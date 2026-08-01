import crypto from "crypto";

/**
 * Generate a URL-safe random token for email verification / password reset
 * links. Only the sha256 hash of this value is stored in the database, so
 * the raw token is never persisted (same pattern as API keys).
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
