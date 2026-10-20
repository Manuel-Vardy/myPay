import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", async () => {
  const { cookiesMock } = await import("../helpers/cookie-jar");
  return { cookies: cookiesMock };
});

import { createSession, decrypt, deleteSession, getSession } from "@/lib/session";
import { cookieJar } from "../helpers/cookie-jar";

const COOKIE_NAME = "session";

beforeEach(() => cookieJar.clear());

/**
 * The cookie half of session.ts. `encrypt`/`decrypt` are covered in
 * session.test.ts; these are the three functions that touch `next/headers`.
 */
describe("createSession", () => {
  it("writes a verifiable token to the session cookie", async () => {
    const token = await createSession("user-123", "MERCHANT");

    expect(cookieJar.get(COOKIE_NAME)?.value).toBe(token);
    const decoded = await decrypt(token);
    expect(decoded).toMatchObject({ userId: "user-123", role: "MERCHANT" });
  });

  it("carries the sessionId when one is supplied", async () => {
    const token = await createSession("user-123", "ADMIN", "sess-9");
    expect((await decrypt(token))?.sessionId).toBe("sess-9");
  });

  it("omits sessionId entirely when none is supplied", async () => {
    const decoded = await decrypt(await createSession("user-123", "ADMIN"));
    expect(decoded).not.toHaveProperty("sessionId");
  });

  it("sets the cookie httpOnly, sameSite lax, and scoped to the whole site", async () => {
    await createSession("user-123", "MERCHANT");
    const options = cookieJar.optionsFor(COOKIE_NAME)!;

    // httpOnly is what keeps the token out of reach of injected scripts.
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  it("expires the cookie in 7 days, matching the token's own expiry", async () => {
    const before = Date.now();
    const token = await createSession("user-123", "MERCHANT");
    const options = cookieJar.optionsFor(COOKIE_NAME)!;

    const expires = options.expires as Date;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(expires.getTime() - before).toBeGreaterThan(sevenDaysMs - 5_000);
    expect(expires.getTime() - before).toBeLessThanOrEqual(sevenDaysMs + 5_000);

    // A cookie outliving its token (or vice versa) produces confusing 401s.
    const decoded = await decrypt(token);
    expect(Math.abs(decoded!.exp! * 1000 - expires.getTime())).toBeLessThan(5_000);
    expect(new Date(decoded!.expiresAt).getTime()).toBeCloseTo(expires.getTime(), -4);
  });

  it("does not mark the cookie secure outside production", async () => {
    // NODE_ENV is "test" here; the flag is driven by production only.
    await createSession("user-123", "MERCHANT");
    expect(cookieJar.optionsFor(COOKIE_NAME)!.secure).toBe(false);
  });

  it("marks the cookie secure in production", async () => {
    const original = process.env.NODE_ENV;
    try {
      vi.stubEnv("NODE_ENV", "production");
      await createSession("user-123", "MERCHANT");
      expect(cookieJar.optionsFor(COOKIE_NAME)!.secure).toBe(true);
    } finally {
      vi.unstubAllEnvs();
      expect(process.env.NODE_ENV).toBe(original);
    }
  });

  it("replaces an existing session rather than accumulating cookies", async () => {
    await createSession("user-a", "MERCHANT");
    await createSession("user-b", "ADMIN");

    expect(cookieJar.names()).toEqual([COOKIE_NAME]);
    expect((await getSession())?.userId).toBe("user-b");
  });
});

describe("getSession", () => {
  it("returns null when no cookie is present", async () => {
    await expect(getSession()).resolves.toBeNull();
  });

  it("round-trips the session written by createSession", async () => {
    await createSession("user-123", "SUPPORT", "sess-1");
    expect(await getSession()).toMatchObject({
      userId: "user-123",
      role: "SUPPORT",
      sessionId: "sess-1",
    });
  });

  it("returns null for a garbage cookie value instead of throwing", async () => {
    cookieJar.set(COOKIE_NAME, "not-a-jwt");
    await expect(getSession()).resolves.toBeNull();
  });

  it("returns null for a token signed with someone else's secret", async () => {
    // A forged cookie must be indistinguishable from no cookie at all.
    const { SignJWT } = await import("jose");
    const forged = await new SignJWT({ userId: "attacker", role: "SUPER_ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode("wrong-secret"));

    cookieJar.set(COOKIE_NAME, forged);
    await expect(getSession()).resolves.toBeNull();
  });

  it("ignores unrelated cookies", async () => {
    cookieJar.set("theme", "dark");
    await expect(getSession()).resolves.toBeNull();
  });
});

describe("deleteSession", () => {
  it("removes the session cookie", async () => {
    await createSession("user-123", "MERCHANT");
    expect(cookieJar.has(COOKIE_NAME)).toBe(true);

    await deleteSession();

    expect(cookieJar.has(COOKIE_NAME)).toBe(false);
    await expect(getSession()).resolves.toBeNull();
  });

  it("is safe to call when there is no session", async () => {
    await expect(deleteSession()).resolves.toBeUndefined();
  });

  it("leaves other cookies alone", async () => {
    cookieJar.set("theme", "dark");
    await createSession("user-123", "MERCHANT");

    await deleteSession();

    expect(cookieJar.has("theme")).toBe(true);
  });
});
