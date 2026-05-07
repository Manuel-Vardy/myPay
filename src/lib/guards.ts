import "server-only";
import { getSession, type SessionPayload } from "@/lib/session";
import type { UserRole } from "@/lib/types";

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
 * Require a valid session whose role matches one of the `allowedRoles`.
 * Returns either the verified session or a ready-to-return error Response.
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

  return { session };
}

/**
 * Convenience wrapper: require ADMIN role.
 */
export function requireAdmin(): Promise<GuardResult> {
  return requireRole("ADMIN");
}

/**
 * Convenience wrapper: require MERCHANT role.
 */
export function requireMerchant(): Promise<GuardResult> {
  return requireRole("MERCHANT");
}
