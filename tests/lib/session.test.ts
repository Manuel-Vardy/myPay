import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { decrypt, encrypt, type SessionPayload } from "@/lib/session";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

function payload(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    userId: "user-123",
    role: "MERCHANT",
    expiresAt: new Date("2026-09-01T00:00:00Z").toISOString(),
    ...overrides,
  };
}

/**
 * The session cookie is the only thing standing between an anonymous request
 * and a merchant's money, so forgery paths are tested explicitly.
 */
describe("encrypt / decrypt", () => {
  it("round-trips a session payload", async () => {
    const token = await encrypt(payload());
    const decoded = await decrypt(token);
    expect(decoded).toMatchObject({
      userId: "user-123",
      role: "MERCHANT",
      expiresAt: "2026-09-01T00:00:00.000Z",
    });
  });

  it("carries sessionId when present", async () => {
    const decoded = await decrypt(await encrypt(payload({ sessionId: "sess-9" })));
    expect(decoded?.sessionId).toBe("sess-9");
  });

  it("issues a compact HS256 JWT", async () => {
    const token = await encrypt(payload());
    const [header] = token.split(".");
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toMatchObject({
      alg: "HS256",
    });
    expect(token.split(".")).toHaveLength(3);
  });

  it("sets iat and a 7-day exp", async () => {
    const token = await encrypt(payload());
    const decoded = await decrypt(token);
    expect(decoded?.iat).toBeTypeOf("number");
    expect(decoded?.exp).toBeTypeOf("number");
    const sevenDays = 7 * 24 * 60 * 60;
    expect(decoded!.exp! - decoded!.iat!).toBe(sevenDays);
  });
});

describe("decrypt — rejection paths", () => {
  it("returns null for a missing token instead of throwing", async () => {
    await expect(decrypt(undefined)).resolves.toBeNull();
    await expect(decrypt("")).resolves.toBeNull();
  });

  it("returns null for a malformed token", async () => {
    await expect(decrypt("not-a-jwt")).resolves.toBeNull();
    await expect(decrypt("a.b.c")).resolves.toBeNull();
  });

  it("rejects a token whose payload was tampered with", async () => {
    const token = await encrypt(payload({ role: "MERCHANT" }));
    const [header, body, signature] = token.split(".");
    const forged = JSON.parse(Buffer.from(body, "base64url").toString());
    forged.role = "SUPER_ADMIN";
    const forgedBody = Buffer.from(JSON.stringify(forged)).toString("base64url");
    await expect(decrypt(`${header}.${forgedBody}.${signature}`)).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const foreign = await new SignJWT({ ...payload(), role: "SUPER_ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode("an-attackers-secret"));
    await expect(decrypt(foreign)).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const expired = await new SignJWT({ ...payload() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(SECRET);
    await expect(decrypt(expired)).resolves.toBeNull();
  });

  it("rejects the alg:none confusion attack", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
      "base64url"
    );
    const body = Buffer.from(
      JSON.stringify({ ...payload({ role: "SUPER_ADMIN" }), exp: 9999999999 })
    ).toString("base64url");
    await expect(decrypt(`${header}.${body}.`)).resolves.toBeNull();
  });

  it("rejects a token signed with an algorithm other than HS256", async () => {
    const hs512 = await new SignJWT({ ...payload({ role: "SUPER_ADMIN" }) })
      .setProtectedHeader({ alg: "HS512" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);
    await expect(decrypt(hs512)).resolves.toBeNull();
  });
});
