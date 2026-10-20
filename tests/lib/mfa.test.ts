import { describe, expect, it } from "vitest";
import {
  consumeBackupCode,
  generateBackupCodes,
  generateTotpSecret,
  generateTotpToken,
  totpProvisioningUri,
  verifyTotpToken,
} from "@/lib/mfa";
import { hashToken } from "@/lib/tokens";
import type { TwoFactorBackupCode } from "@/lib/types";

describe("generateBackupCodes", () => {
  it("issues 8 codes", () => {
    expect(generateBackupCodes().plaintext).toHaveLength(8);
  });

  it("formats codes as XXXX-XXXX from an unambiguous alphabet", () => {
    for (const code of generateBackupCodes().plaintext) {
      expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
      // 0/O and 1/I are excluded so a user cannot mistype a code they read.
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  it("persists only hashes, never the plaintext", () => {
    const { plaintext, rows } = generateBackupCodes();
    expect(rows).toHaveLength(8);
    rows.forEach((row, i) => {
      expect(row.hash).toBe(hashToken(plaintext[i]));
      expect(row.used_at).toBeNull();
      expect(JSON.stringify(row)).not.toContain(plaintext[i]);
    });
  });

  it("does not repeat codes within a set", () => {
    const { plaintext } = generateBackupCodes();
    expect(new Set(plaintext).size).toBe(8);
  });
});

describe("consumeBackupCode", () => {
  function freshSet() {
    const { plaintext, rows } = generateBackupCodes();
    return { plaintext, rows };
  }

  it("marks the matching code used and leaves the others alone", () => {
    const { plaintext, rows } = freshSet();
    const updated = consumeBackupCode(rows, plaintext[3]);
    expect(updated).not.toBeNull();
    expect(updated![3].used_at).toBeTypeOf("string");
    updated!.forEach((row, i) => {
      if (i !== 3) expect(row.used_at).toBeNull();
    });
  });

  it("does not mutate the caller's array", () => {
    const { plaintext, rows } = freshSet();
    consumeBackupCode(rows, plaintext[0]);
    expect(rows[0].used_at).toBeNull();
  });

  it("refuses to reuse a code that was already consumed", () => {
    const { plaintext, rows } = freshSet();
    const afterFirst = consumeBackupCode(rows, plaintext[0]);
    expect(afterFirst).not.toBeNull();
    // Single-use is the entire security property of a backup code.
    expect(consumeBackupCode(afterFirst, plaintext[0])).toBeNull();
  });

  it("rejects a code that was never issued", () => {
    const { rows } = freshSet();
    expect(consumeBackupCode(rows, "ZZZZ-ZZZZ")).toBeNull();
  });

  it("accepts a code the user typed in lower case or with stray whitespace", () => {
    const { plaintext, rows } = freshSet();
    expect(consumeBackupCode(rows, `  ${plaintext[1].toLowerCase()}  `)).not.toBeNull();
  });

  it("returns null when the user has no backup codes", () => {
    expect(consumeBackupCode(null, "ABCD-EFGH")).toBeNull();
    expect(consumeBackupCode([] as TwoFactorBackupCode[], "ABCD-EFGH")).toBeNull();
  });
});

describe("verifyTotpToken", () => {
  it("accepts a token generated from the same secret", async () => {
    const secret = generateTotpSecret();
    await expect(verifyTotpToken(secret, await generateTotpToken(secret))).resolves.toBe(
      true
    );
  });

  it("rejects a token generated from a different secret", async () => {
    const token = await generateTotpToken(generateTotpSecret());
    await expect(verifyTotpToken(generateTotpSecret(), token)).resolves.toBe(false);
  });

  it("rejects anything that is not exactly six digits", async () => {
    const secret = generateTotpSecret();
    for (const bad of ["", "12345", "1234567", "abcdef", "12345a", "  123456  "]) {
      await expect(verifyTotpToken(secret, bad)).resolves.toBe(false);
    }
  });

  it("rejects verification when no secret is enrolled", async () => {
    await expect(verifyTotpToken("", "123456")).resolves.toBe(false);
  });
});

describe("totpProvisioningUri", () => {
  it("builds an otpauth URI carrying the TRITE issuer and the user's email", () => {
    const uri = totpProvisioningUri("merchant@example.com", generateTotpSecret());
    expect(uri.startsWith("otpauth://totp/")).toBe(true);
    expect(uri).toContain("issuer=TRITE");
    expect(decodeURIComponent(uri)).toContain("merchant@example.com");
  });
});
