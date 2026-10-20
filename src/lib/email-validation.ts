import "server-only";
import disposableDomains from "disposable-email-domains/index.json";
import wildcardDomains from "disposable-email-domains/wildcard.json";

/**
 * Signup email validation: format check + disposable/throwaway domain block.
 *
 * The blocklist is the community `disposable-email-domains` package, bundled
 * with the server (no network call at signup). Bump the package to refresh it.
 * Blocking is on in every environment; set ALLOW_DISPOSABLE_EMAILS=true to
 * disable it for local/test use. Production must never set it.
 */

// Domains the upstream list misses. Keep lowercase, no leading "@".
const EXTRA_BLOCKED_DOMAINS: string[] = [];

const EXACT = new Set<string>([...(disposableDomains as string[]), ...EXTRA_BLOCKED_DOMAINS]);
// Wildcard entries block the base domain and every subdomain beneath it.
const WILDCARD = new Set<string>(wildcardDomains as string[]);

// Pragmatic, not RFC 5322: one "@", non-empty local part, dotted domain with a 2+ letter TLD.
const EMAIL_RE = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

export const INVALID_EMAIL_ERROR = "Enter a valid email address";
export const DISPOSABLE_EMAIL_ERROR =
  "Disposable or temporary email addresses aren't allowed. Please use your business email.";

export type SignupEmailResult =
  | { ok: true; email: string; domain: string }
  | { ok: false; error: string; reason: "INVALID" | "DISPOSABLE"; domain?: string };

/** True if `domain` or any of its parent domains is on the disposable list. */
export function isDisposableDomain(domain: string): boolean {
  const labels = domain.toLowerCase().split(".");
  // Walk "a.b.mailinator.com" → "b.mailinator.com" → "mailinator.com" (stop before the bare TLD).
  for (let i = 0; i < labels.length - 1; i++) {
    const candidate = labels.slice(i).join(".");
    if (EXACT.has(candidate) || WILDCARD.has(candidate)) return true;
  }
  return false;
}

/**
 * Canonical form of an email for storage and lookup: trimmed and lowercased.
 * `users.email` is constrained lowercase (migration 0050), so every
 * `where({ email })` must go through this or it will miss mixed-case input.
 */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  return raw.trim().toLowerCase() || null;
}

export function validateSignupEmail(raw: unknown): SignupEmailResult {
  const email = normalizeEmail(raw);
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: INVALID_EMAIL_ERROR, reason: "INVALID" };

  const domain = email.slice(email.lastIndexOf("@") + 1);
  if (process.env.ALLOW_DISPOSABLE_EMAILS !== "true" && isDisposableDomain(domain)) {
    return { ok: false, error: DISPOSABLE_EMAIL_ERROR, reason: "DISPOSABLE", domain };
  }

  return { ok: true, email, domain };
}
