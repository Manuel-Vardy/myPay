// Which roles must carry TOTP, and which may opt in.
//
// Deliberately free of `server-only`: the admin settings UI needs the same
// answer the guards use, and two copies of this rule would drift.

import type { UserRole } from "@/lib/types";

/**
 * Roles for which TOTP enrollment is mandatory rather than optional.
 *
 * These are the staff roles that reach the admin terminal — platform volume,
 * merchant records, KYC documents, the compliance feed. The BoG licensing
 * response (Item 25) states that administrative access carries mandatory MFA,
 * so the claim and the code have to agree.
 *
 * MERCHANT and CUSTOMER stay opt-in. Forcing enrollment on merchants is a
 * commercial decision with an onboarding cost attached, and it isn't what was
 * claimed to the regulator.
 */
export const MFA_REQUIRED_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT",
];

export function mfaRequiredForRole(role: UserRole): boolean {
  return MFA_REQUIRED_ROLES.includes(role);
}

/** Returned to clients so they can route to enrollment instead of showing a bare 403. */
export const MFA_ENROLLMENT_REQUIRED_CODE = "MFA_ENROLLMENT_REQUIRED";

export const MFA_ENROLLMENT_REQUIRED_MESSAGE =
  "Two-factor authentication is mandatory for this role. Enroll an authenticator app to continue.";
