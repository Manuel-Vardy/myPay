import "server-only";
import crypto from "crypto";
import { generateSecret, generate, verify, generateURI } from "otplib";
import { hashToken } from "@/lib/tokens";
import type { TwoFactorBackupCode } from "@/lib/types";

const ISSUER = "TRITE";
const BACKUP_CODE_COUNT = 8;

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpProvisioningUri(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

export async function verifyTotpToken(secret: string, token: string): Promise<boolean> {
  if (!secret || !/^\d{6}$/.test(token)) return false;
  const result = await verify({ secret, token });
  return result.valid;
}

/** Only used by tests/dev tooling — app code never needs to generate a token. */
export async function generateTotpToken(secret: string): Promise<string> {
  return generate({ secret });
}

/** Formatted like XXXX-XXXX for readability; not cryptographically sensitive
 *  since only the sha256 hash is ever persisted. */
function randomBackupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[crypto.randomInt(chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

/** Returns the plaintext codes (show once) alongside the hashed rows to persist. */
export function generateBackupCodes(): { plaintext: string[]; rows: TwoFactorBackupCode[] } {
  const plaintext = Array.from({ length: BACKUP_CODE_COUNT }, randomBackupCode);
  const rows = plaintext.map((code) => ({ hash: hashToken(code), used_at: null }));
  return { plaintext, rows };
}

/** Checks a candidate code against unused backup codes; returns the updated
 *  list (with the matched code marked used) or null if no match. */
export function consumeBackupCode(
  codes: TwoFactorBackupCode[] | null,
  candidate: string
): TwoFactorBackupCode[] | null {
  if (!codes) return null;
  const hash = hashToken(candidate.trim().toUpperCase());
  const idx = codes.findIndex((c) => c.hash === hash && !c.used_at);
  if (idx === -1) return null;
  const updated = [...codes];
  updated[idx] = { ...updated[idx], used_at: new Date().toISOString() };
  return updated;
}
