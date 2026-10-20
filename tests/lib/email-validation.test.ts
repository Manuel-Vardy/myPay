import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DISPOSABLE_EMAIL_ERROR,
  INVALID_EMAIL_ERROR,
  isDisposableDomain,
  normalizeEmail,
  validateSignupEmail,
} from "@/lib/email-validation";

/**
 * Signup email gate for /api/auth/register and /api/auth/admin-register:
 * malformed addresses and disposable/throwaway domains are rejected.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("validateSignupEmail", () => {
  it("accepts real business addresses", () => {
    expect(validateSignupEmail("ama@trite.africa")).toEqual({
      ok: true,
      email: "ama@trite.africa",
      domain: "trite.africa",
    });
    expect(validateSignupEmail("kofi.mensah+ops@gmail.com").ok).toBe(true);
    expect(validateSignupEmail("ops@mail.company.com.gh").ok).toBe(true);
  });

  it("normalizes case and surrounding whitespace", () => {
    const result = validateSignupEmail("  Ama@Trite.Africa ");
    expect(result).toMatchObject({ ok: true, email: "ama@trite.africa" });
  });

  it.each(["", "no-at", "a@b", "a@@b.com", "@trite.africa", "ama@trite.", "ama @trite.africa", "ama@-x.com"])(
    "rejects malformed address %j",
    (input) => {
      expect(validateSignupEmail(input)).toEqual({ ok: false, error: INVALID_EMAIL_ERROR, reason: "INVALID" });
    }
  );

  it.each([undefined, null, 42, {}, ["a@b.com"]])("rejects non-string %j", (input) => {
    expect(validateSignupEmail(input)).toMatchObject({ ok: false, reason: "INVALID" });
  });

  it.each(["x@mailinator.com", "x@10minutemail.com", "X@Guerrillamail.com"])("blocks disposable %s", (input) => {
    expect(validateSignupEmail(input)).toMatchObject({
      ok: false,
      error: DISPOSABLE_EMAIL_ERROR,
      reason: "DISPOSABLE",
    });
  });

  it("blocks subdomains of listed disposable domains", () => {
    expect(validateSignupEmail("x@inbox.mailinator.com")).toMatchObject({ reason: "DISPOSABLE" });
    // 33m.co is a wildcard entry: every subdomain is disposable.
    expect(validateSignupEmail("x@anything.33m.co")).toMatchObject({ reason: "DISPOSABLE" });
  });

  it("ALLOW_DISPOSABLE_EMAILS=true bypasses the domain block but not the format check", () => {
    vi.stubEnv("ALLOW_DISPOSABLE_EMAILS", "true");
    expect(validateSignupEmail("x@mailinator.com")).toMatchObject({ ok: true, email: "x@mailinator.com" });
    expect(validateSignupEmail("not-an-email")).toMatchObject({ ok: false, reason: "INVALID" });
  });

  it("only the exact value 'true' disables blocking", () => {
    vi.stubEnv("ALLOW_DISPOSABLE_EMAILS", "1");
    expect(validateSignupEmail("x@mailinator.com")).toMatchObject({ reason: "DISPOSABLE" });
  });
});

describe("isDisposableDomain", () => {
  it("does not flag a bare TLD or unrelated domains", () => {
    expect(isDisposableDomain("com")).toBe(false);
    expect(isDisposableDomain("trite.africa")).toBe(false);
    expect(isDisposableDomain("gmail.com")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Kofi@Trite.Africa ")).toBe("kofi@trite.africa");
  });

  it.each([undefined, null, 42, "", "   "])("returns null for %j", (input) => {
    expect(normalizeEmail(input)).toBeNull();
  });
});
