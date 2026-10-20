import "server-only";
import type { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/session";
import { hashApiKey, API_KEY_PREFIX } from "@/lib/api-keys";
import type { Merchant, UserRole } from "@/lib/types";
import {
  mfaRequiredForRole,
  MFA_ENROLLMENT_REQUIRED_CODE,
  MFA_ENROLLMENT_REQUIRED_MESSAGE,
} from "@/lib/mfa-policy";

/**
 * Result of an auth guard check.
 * If `error` is set the caller should return it immediately.
 * Otherwise `session` is guaranteed to be a valid, non-expired session with
 * the required role.
 */
export type GuardResult =
  | { session: SessionPayload; error?: undefined }
  | { session?: undefined; error: Response };

/**
 * Session validity, expiry, role and revocation — everything except the MFA
 * enrollment gate. Split out so the enrollment endpoints themselves can be
 * reached by a user who is being told to enroll.
 */
async function resolveSession(allowedRoles: UserRole[]): Promise<GuardResult> {
  const session = await getSession();

  if (!session) {
    return {
      error: Response.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    return {
      error: Response.json(
        { error: "Session expired" },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(session.role)) {
    return {
      error: Response.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  // Enforce revocation for tracked sessions (legacy tokens have no sessionId)
  if (session.sessionId) {
    const row = await db("user_sessions")
      .where({ id: session.sessionId })
      .first("id", "revoked_at");
    if (!row || row.revoked_at) {
      return {
        error: Response.json(
          { error: "Session revoked. Please sign in again." },
          { status: 401 }
        ),
      };
    }
    // Touch last_seen_at without blocking the request
    db("user_sessions")
      .where({ id: session.sessionId })
      .update({ last_seen_at: db.fn.now() })
      .catch(() => null);
  }

  return { session };
}

/**
 * Reject a privileged session that has no TOTP enrolled.
 *
 * Enforced here rather than only at login on purpose: sessions carry a 7-day
 * TTL, so gating at login alone would leave every already-issued admin cookie
 * unenforced for a week. Applying it at the guard closes existing sessions the
 * moment this ships.
 *
 * Costs one indexed primary-key lookup, and only for roles in
 * `MFA_REQUIRED_ROLES` — merchant traffic is untouched.
 */
async function enforceMfaEnrollment(session: SessionPayload): Promise<GuardResult> {
  if (!mfaRequiredForRole(session.role)) return { session };

  const row = await db("users")
    .where({ id: session.userId })
    .first("two_factor_enabled");

  if (row?.two_factor_enabled) return { session };

  return {
    error: Response.json(
      {
        error: MFA_ENROLLMENT_REQUIRED_MESSAGE,
        code: MFA_ENROLLMENT_REQUIRED_CODE,
      },
      { status: 403 }
    ),
  };
}

/**
 * Require a valid session whose role matches one of the `allowedRoles`.
 * Returns either the verified session or a ready-to-return error Response.
 *
 * For roles in `MFA_REQUIRED_ROLES` this also requires TOTP to be enrolled,
 * failing with 403 `MFA_ENROLLMENT_REQUIRED` if it is not.
 *
 * Usage in a route handler:
 * ```ts
 * const guard = await requireRole("ADMIN");
 * if (guard.error) return guard.error;
 * const { session } = guard;
 * ```
 */
export async function requireRole(
  ...allowedRoles: UserRole[]
): Promise<GuardResult> {
  const guard = await resolveSession(allowedRoles);
  if (guard.error) return guard;
  return enforceMfaEnrollment(guard.session);
}

/**
 * As `requireRole`, but without the MFA enrollment gate.
 *
 * Only for the enrollment endpoints themselves (`/api/auth/mfa/enroll`,
 * `/api/auth/mfa/confirm`). Using this anywhere else reopens the hole this
 * guard exists to close.
 */
export async function requireRoleAllowingMfaSetup(
  ...allowedRoles: UserRole[]
): Promise<GuardResult> {
  return resolveSession(allowedRoles);
}

/**
 * Convenience wrapper: require ADMIN role.
 */
export function requireAdmin(): Promise<GuardResult> {
  return requireRole("ADMIN");
}

export type AdminRoleInfo = { id: string; name: string; is_system_role: boolean };

/**
 * Resolve roles and permissions for an admin user.
 */
export async function getAdminPermissionsAndRoles(userId: string): Promise<{
  roles: AdminRoleInfo[];
  permissions: string[];
  isSuperAdmin: boolean;
}> {
  const profile = await db("admin_profiles").where({ user_id: userId }).first("id");
  if (!profile) {
    return { roles: [], permissions: [], isSuperAdmin: false };
  }

  const roles: AdminRoleInfo[] = await db("admin_roles")
    .join("roles", "admin_roles.role_id", "roles.id")
    .where("admin_roles.admin_profile_id", profile.id)
    .select("roles.id", "roles.name", "roles.is_system_role");

  // Backward compatibility: admins who exist in admin_profiles but have no
  // admin_roles entries predate RBAC enforcement.  Treat them as Super Admin
  // so they are not locked out.  Once a role is explicitly assigned via the
  // Roles page, the normal permission resolution takes over.
  if (roles.length === 0) {
    return { roles: [], permissions: [], isSuperAdmin: true };
  }

  const isSuperAdmin = roles.some(
    (r) => r.name.toLowerCase() === "super admin"
  );

  const roleIds = roles.map((r) => r.id);
  const permissionRows = roleIds.length
    ? await db("role_permissions")
        .join("permissions", "role_permissions.permission_id", "permissions.id")
        .whereIn("role_permissions.role_id", roleIds)
        .distinct("permissions.name")
    : [];

  const permissions = permissionRows.map((p: { name: string }) => p.name);

  return { roles, permissions, isSuperAdmin };
}

export type PermissionGuardResult =
  | { session: SessionPayload; permissions: string[]; isSuperAdmin: boolean; roles: AdminRoleInfo[]; error?: undefined }
  | { session?: undefined; permissions?: undefined; isSuperAdmin?: undefined; roles?: undefined; error: Response };

/**
 * Require ADMIN role and at least one of the specified permissions (or Super Admin).
 */
export async function requirePermission(
  ...allowedPermissions: string[]
): Promise<PermissionGuardResult> {
  const guard = await requireAdmin();
  if (guard.error) return { error: guard.error };

  const { session } = guard;
  const { roles, permissions, isSuperAdmin } = await getAdminPermissionsAndRoles(session.userId);

  if (isSuperAdmin) {
    return { session, permissions, isSuperAdmin, roles };
  }

  const hasAccess = allowedPermissions.some((perm) => permissions.includes(perm));
  if (!hasAccess) {
    return {
      error: Response.json(
        {
          error: "Insufficient permissions to perform this action",
          code: "FORBIDDEN",
          requiredPermissions: allowedPermissions,
        },
        { status: 403 }
      ),
    };
  }

  return { session, permissions, isSuperAdmin, roles };
}

/**
 * Convenience wrapper: require MERCHANT role.
 */
export function requireMerchant(): Promise<GuardResult> {
  return requireRole("MERCHANT");
}

// ---------- Merchant Verification Guards ----------

/**
 * Result of a merchant verification guard.
 * On success, provides the session, the merchant row, AND the user row
 * so callers don't need redundant DB lookups.
 */
export type MerchantGuardResult =
  | {
      session: SessionPayload;
      merchant: Merchant;
      user: { id: string; email_verified_at: Date | null; mobile_verified_at: Date | null };
      kycStatus: string | null;
      error?: undefined;
    }
  | { session?: undefined; merchant?: undefined; user?: undefined; kycStatus?: undefined; error: Response };

/**
 * Shared implementation: authenticate merchant and load verification state.
 * Returns the session, merchant, user (email_verified_at), and KYC status.
 */
async function loadMerchantVerificationState(): Promise<MerchantGuardResult> {
  const guard = await requireMerchant();
  if (guard.error) return { error: guard.error };

  const { session } = guard;

  const user = await db("users")
    .where({ id: session.userId })
    .select("id", "email_verified_at", "mobile_verified_at")
    .first();

  if (!user) {
    return {
      error: Response.json({ error: "User not found" }, { status: 404 }),
    };
  }

  const merchant = await db("merchants")
    .where({ user_id: session.userId })
    .first();

  if (!merchant) {
    return {
      error: Response.json(
        { error: "Merchant profile not found" },
        { status: 404 }
      ),
    };
  }

  const kycRecord = await db("kyc_records")
    .where({ user_id: session.userId })
    .select("status")
    .first();

  return {
    session,
    merchant,
    user,
    kycStatus: kycRecord?.status ?? null,
  };
}

/**
 * Require a verified merchant: authenticated + email verified.
 * Returns 403 with code "EMAIL_NOT_VERIFIED" if email is unverified.
 *
 * Usage:
 * ```ts
 * const guard = await requireVerifiedMerchant();
 * if (guard.error) return guard.error;
 * const { session, merchant } = guard;
 * ```
 */
export async function requireVerifiedMerchant(): Promise<MerchantGuardResult> {
  const state = await loadMerchantVerificationState();
  if (state.error) return { error: state.error };

  if (!state.user.mobile_verified_at) {
    return {
      error: Response.json(
        {
          error: "Mobile number verification required",
          code: "MOBILE_NOT_VERIFIED",
        },
        { status: 403 }
      ),
    };
  }

  if (!state.user.email_verified_at) {
    return {
      error: Response.json(
        {
          error: "Email verification required",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      ),
    };
  }

  return state;
}

/**
 * Require a fully verified merchant: authenticated + email verified + KYC APPROVED.
 * Returns 403 with code "EMAIL_NOT_VERIFIED" or "KYC_NOT_APPROVED" as appropriate.
 *
 * Usage:
 * ```ts
 * const guard = await requireActiveMerchant();
 * if (guard.error) return guard.error;
 * const { session, merchant } = guard;
 * ```
 */
export async function requireActiveMerchant(): Promise<MerchantGuardResult> {
  const state = await loadMerchantVerificationState();
  if (state.error) return { error: state.error };

  if (!state.user.mobile_verified_at) {
    return {
      error: Response.json(
        {
          error: "Mobile number verification required",
          code: "MOBILE_NOT_VERIFIED",
        },
        { status: 403 }
      ),
    };
  }

  if (!state.user.email_verified_at) {
    return {
      error: Response.json(
        {
          error: "Email verification required",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      ),
    };
  }

  if (state.kycStatus !== "APPROVED") {
    return {
      error: Response.json(
        {
          error:
            "KYC verification required. Please complete identity verification to access this feature.",
          code: "KYC_NOT_APPROVED",
          kyc_status: state.kycStatus,
        },
        { status: 403 }
      ),
    };
  }

  return state;
}

/**
 * Result of an API-key guard check (public merchant API).
 * Same contract as GuardResult: if `error` is set, return it immediately.
 */
export type ApiKeyGuardResult =
  | { merchant: Merchant; apiKeyId: string; error?: undefined }
  | { merchant?: undefined; apiKeyId?: undefined; error: Response };

const API_KEY_TOUCH_INTERVAL_MS = 60_000;

function apiKeyUnauthorized(): Response {
  return new Response(
    JSON.stringify({ error: "Missing or invalid API key" }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": "Bearer",
      },
    }
  );
}

/**
 * Authenticate a public-API request via `Authorization: Bearer trite_sk_...`.
 * Looks the key up by sha256 hash, loads its merchant, touches last_used_at
 * (throttled), and enforces a fixed-window rate limit per merchant+endpoint.
 *
 * Usage:
 * ```ts
 * const guard = await requireApiKey(request, { endpoint: "v1/payments" });
 * if (guard.error) return guard.error;
 * const { merchant } = guard;
 * ```
 */
export async function requireApiKey(
  request: NextRequest,
  opts?: { endpoint?: string; limit?: number; windowSeconds?: number }
): Promise<ApiKeyGuardResult> {
  const authHeader = request.headers.get("authorization") || "";
  const [scheme, rawKey] = authHeader.split(" ");
  if (
    scheme?.toLowerCase() !== "bearer" ||
    !rawKey ||
    !rawKey.startsWith(API_KEY_PREFIX)
  ) {
    return { error: apiKeyUnauthorized() };
  }

  const key = await db("api_keys")
    .where({ key_hash: hashApiKey(rawKey) })
    .whereNull("revoked_at")
    .first();

  // Same response for unknown and revoked keys — don't leak which
  if (!key) {
    return { error: apiKeyUnauthorized() };
  }

  const merchant = await db("merchants").where({ id: key.merchant_id }).first();
  if (!merchant) {
    return { error: apiKeyUnauthorized() };
  }

  // Touch last_used_at without blocking the request, at most once a minute
  const lastUsed = key.last_used_at ? new Date(key.last_used_at).getTime() : 0;
  if (Date.now() - lastUsed > API_KEY_TOUCH_INTERVAL_MS) {
    db("api_keys")
      .where({ id: key.id })
      .update({ last_used_at: db.fn.now() })
      .catch(() => null);
  }

  // Fixed-window rate limit via rate_limit_counters upsert
  const limit = opts?.limit ?? 60;
  const windowMs = (opts?.windowSeconds ?? 60) * 1000;
  const endpoint =
    opts?.endpoint ?? new URL(request.url).pathname.slice(0, 200);
  const windowStartMs = Math.floor(Date.now() / windowMs) * windowMs;

  const counter = await db.raw(
    `INSERT INTO rate_limit_counters (merchant_id, endpoint, window_start)
     VALUES (?, ?, ?)
     ON CONFLICT (merchant_id, endpoint, window_start)
     DO UPDATE SET request_count = rate_limit_counters.request_count + 1
     RETURNING request_count`,
    [merchant.id, endpoint, new Date(windowStartMs)]
  );
  const requestCount: number = counter.rows?.[0]?.request_count ?? 1;

  if (requestCount > limit) {
    const retryAfter = Math.ceil((windowStartMs + windowMs - Date.now()) / 1000);
    return {
      error: new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.max(retryAfter, 1)),
          },
        }
      ),
    };
  }

  return { merchant, apiKeyId: key.id };
}

/**
 * Require an API key whose merchant is fully verified (email + KYC APPROVED).
 * Combines `requireApiKey` key validation/rate-limiting with verification checks.
 *
 * Returns the same `ApiKeyGuardResult` shape. On verification failure the
 * response includes a `code` field (`EMAIL_NOT_VERIFIED` or `KYC_NOT_APPROVED`)
 * so API consumers can surface actionable feedback.
 *
 * Usage:
 * ```ts
 * const guard = await requireActiveApiKey(request, { endpoint: "v1/payments" });
 * if (guard.error) return guard.error;
 * const { merchant } = guard;
 * ```
 */
export async function requireActiveApiKey(
  request: NextRequest,
  opts?: { endpoint?: string; limit?: number; windowSeconds?: number }
): Promise<ApiKeyGuardResult> {
  const guard = await requireApiKey(request, opts);
  if (guard.error) return guard;

  const { merchant } = guard;

  // Load the merchant's user to check email verification
  const user = await db("users")
    .where({ id: merchant.user_id })
    .select("id", "email_verified_at")
    .first();

  if (!user || !user.email_verified_at) {
    return {
      error: Response.json(
        {
          error: "Merchant account email is not verified. Please verify your email in the merchant portal.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      ),
    };
  }

  // Check KYC status
  const kycRecord = await db("kyc_records")
    .where({ user_id: merchant.user_id })
    .select("status")
    .first();

  if (!kycRecord || kycRecord.status !== "APPROVED") {
    return {
      error: Response.json(
        {
          error: "Merchant KYC verification is required. Please complete identity verification in the merchant portal.",
          code: "KYC_NOT_APPROVED",
          kyc_status: kycRecord?.status ?? null,
        },
        { status: 403 }
      ),
    };
  }

  return guard;
}

/**
 * Result of an auth-endpoint rate-limit check (login, MFA verify, etc).
 * If `error` is set the caller should return it immediately.
 */
export type AuthRateLimitResult = { error?: Response };

/**
 * Fixed-window rate limit for unauthenticated/pre-session auth endpoints,
 * keyed by an arbitrary identifier (e.g. `user:<id>` or `ip:<addr>`) since
 * there's no merchant to key `rate_limit_counters` off of at this point in
 * the flow.
 *
 * Usage:
 * ```ts
 * const limited = await checkAuthRateLimit(`user:${user_id}`, "mfa_verify", { limit: 5, windowSeconds: 300 });
 * if (limited.error) return limited.error;
 * ```
 */
export async function checkAuthRateLimit(
  identifier: string,
  endpoint: string,
  opts?: { limit?: number; windowSeconds?: number }
): Promise<AuthRateLimitResult> {
  const limit = opts?.limit ?? 5;
  const windowMs = (opts?.windowSeconds ?? 300) * 1000;
  const windowStartMs = Math.floor(Date.now() / windowMs) * windowMs;

  const counter = await db.raw(
    `INSERT INTO auth_rate_limit_counters (identifier, endpoint, window_start)
     VALUES (?, ?, ?)
     ON CONFLICT (identifier, endpoint, window_start)
     DO UPDATE SET request_count = auth_rate_limit_counters.request_count + 1
     RETURNING request_count`,
    [identifier, endpoint, new Date(windowStartMs)]
  );
  const requestCount: number = counter.rows?.[0]?.request_count ?? 1;

  if (requestCount > limit) {
    const retryAfter = Math.ceil((windowStartMs + windowMs - Date.now()) / 1000);
    return {
      error: new Response(
        JSON.stringify({ error: "Too many attempts. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.max(retryAfter, 1)),
          },
        }
      ),
    };
  }

  return {};
}
