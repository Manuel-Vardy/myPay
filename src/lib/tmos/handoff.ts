import "server-only";
import crypto from "crypto";
import { SignJWT } from "jose";

/**
 * Short-lived handoff token that bootstraps a merchant owner into TMOS.
 *
 * TMOS is its own auth realm — shop staff (cashiers, branch managers) log in
 * there with their own credentials and never hold a Trite account. This token
 * is only the owner's first-entry path: TMOS verifies it, resolves or creates
 * the owner's TMOS identity, and issues its own session cookie. It is not an
 * authentication mechanism for anything else.
 *
 * Deliberately signed with TMOS_HANDOFF_SECRET rather than AUTH_SECRET: a
 * token signed with AUTH_SECRET is, by construction, a valid Trite session
 * cookie for every guard in `lib/guards.ts`.
 */

export const TMOS_HANDOFF_TTL_SECONDS = 60;

const HANDOFF_ISSUER = "trite-psp";

export interface TmosHandoffClaims {
  /** Trite user id of the merchant owner. */
  sub: string;
  merchant_id: string;
  merchant_display_id: string;
  business_name: string;
  email: string;
  /** Snapshot only. TMOS re-checks standing against v_tmos_merchant. */
  kyc_status: string | null;
}

export function getHandoffAudience(): string {
  return process.env.TMOS_HANDOFF_AUDIENCE || "mos.trite.tech";
}

/**
 * True when TMOS is wired up for this deployment. The merchant portal hides
 * the shop-management link when it isn't, rather than offering a dead end.
 */
export function isTmosConfigured(): boolean {
  return Boolean(process.env.TMOS_HANDOFF_SECRET && process.env.TMOS_BASE_URL);
}

/**
 * Mint a single-use, 60-second handoff token.
 *
 * The `jti` is what makes it single-use: TMOS records redeemed ids and rejects
 * a repeat, so a token captured from a URL (browser history, referrer header,
 * a shoulder-surfed address bar) is spent by the time it could be replayed.
 */
export async function mintHandoffToken(
  claims: TmosHandoffClaims
): Promise<string> {
  const secret = process.env.TMOS_HANDOFF_SECRET;
  if (!secret) {
    throw new Error("TMOS_HANDOFF_SECRET is not configured");
  }

  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(HANDOFF_ISSUER)
    .setAudience(getHandoffAudience())
    .setSubject(claims.sub)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${TMOS_HANDOFF_TTL_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));
}

/**
 * The URL the merchant portal sends the owner to. The token rides in the query
 * string because this is a top-level browser navigation across origins — TMOS
 * redeems it immediately and replaces it with its own cookie, so the exposure
 * window is the 60s TTL plus single-use redemption.
 */
export function buildHandoffUrl(token: string): string {
  const base = process.env.TMOS_BASE_URL;
  if (!base) {
    throw new Error("TMOS_BASE_URL is not configured");
  }
  const url = new URL("/auth/handoff", base);
  url.searchParams.set("token", token);
  return url.toString();
}
