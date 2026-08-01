import "server-only";
import crypto from "crypto";

/**
 * Merchant API key + webhook secret generation.
 *
 * Raw keys are shown to the merchant exactly once; only the sha256 hash is
 * persisted (api_keys.key_hash), so a leaked database cannot mint requests.
 * The prefix is stored separately for display in the dashboard.
 */

export const API_KEY_PREFIX = "trite_sk_";

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): {
  rawKey: string;
  keyHash: string;
  prefix: string;
} {
  const rawKey = `${API_KEY_PREFIX}${crypto.randomBytes(32).toString("hex")}`;
  return {
    rawKey,
    keyHash: hashApiKey(rawKey),
    prefix: rawKey.slice(0, 16),
  };
}

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}
