import { describe, expect, it } from "vitest";
import { generateToken, hashToken } from "@/lib/tokens";

/**
 * Email-verification and password-reset links: the raw token goes in the email,
 * only its hash is persisted.
 */
describe("generateToken", () => {
  it("returns 32 bytes of hex entropy", () => {
    expect(generateToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("does not repeat across generations", () => {
    const tokens = new Set(Array.from({ length: 200 }, generateToken));
    expect(tokens.size).toBe(200);
  });
});

describe("hashToken", () => {
  it("is deterministic", () => {
    const token = generateToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("produces a 64-char hex sha256 that differs from the token", () => {
    const token = generateToken();
    const hash = hashToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toBe(token);
  });

  it("is case sensitive, so a mistyped token cannot verify", () => {
    expect(hashToken("ABCDEF")).not.toBe(hashToken("abcdef"));
  });
});
