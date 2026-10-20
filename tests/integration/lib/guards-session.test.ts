import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// The whole session-guard surface funnels through session.ts -> cookies().
// See tests/helpers/cookie-jar.ts.
vi.mock("next/headers", async () => {
  const { cookiesMock } = await import("../../helpers/cookie-jar");
  return { cookies: cookiesMock };
});

import {
  getAdminPermissionsAndRoles,
  requireActiveMerchant,
  requireAdmin,
  requireMerchant,
  requirePermission,
  requireRole,
  requireRoleAllowingMfaSetup,
  requireVerifiedMerchant,
} from "@/lib/guards";
import { createSession, encrypt } from "@/lib/session";
import type { UserRole } from "@/lib/types";
import { cookieJar } from "../../helpers/cookie-jar";
import { closeDatabase, db, resetDatabase } from "../helpers/db";
import {
  assignRole,
  createAdminProfile,
  createKycRecord,
  createMerchant,
  createPermission,
  createRole,
  createUser,
  createUserSession,
  grantPermission,
} from "../helpers/factories";

beforeEach(async () => {
  cookieJar.clear();
  await resetDatabase();
});
afterAll(closeDatabase);

const bodyOf = async (res: Response) => JSON.parse(await res.text());

/** Sign in as a user through the real session path, with a tracked session. */
async function signIn(user: { id: string; role: string }) {
  const session = await createUserSession(user.id);
  await createSession(user.id, user.role as UserRole, session.id);
  return session;
}

/** An ADMIN who has satisfied the mandatory-MFA gate. */
async function signedInAdmin(overrides: Record<string, unknown> = {}) {
  const user = await createUser({
    role: "ADMIN",
    two_factor_enabled: true,
    ...overrides,
  });
  const session = await signIn(user);
  return { user, session };
}

describe("resolveSession — authentication", () => {
  it("rejects a request with no session cookie", async () => {
    const guard = await requireRole("MERCHANT");
    expect(guard.error?.status).toBe(401);
    expect(await bodyOf(guard.error!)).toMatchObject({
      error: "Authentication required",
    });
  });

  it("rejects a forged cookie the same way as no cookie", async () => {
    cookieJar.set("session", "not-a-jwt");
    const guard = await requireRole("MERCHANT");
    expect(guard.error?.status).toBe(401);
    expect(await bodyOf(guard.error!)).toMatchObject({
      error: "Authentication required",
    });
  });

  it("accepts a valid session for an allowed role", async () => {
    const user = await createUser({ role: "MERCHANT" });
    await signIn(user);

    const guard = await requireRole("MERCHANT");
    expect(guard.error).toBeUndefined();
    expect(guard.session?.userId).toBe(user.id);
  });

  it("accepts any of several allowed roles", async () => {
    const user = await createUser({ role: "MERCHANT" });
    await signIn(user);
    expect((await requireRole("MERCHANT", "CUSTOMER")).error).toBeUndefined();
  });

  it("rejects a role that is not allowed", async () => {
    const user = await createUser({ role: "MERCHANT" });
    await signIn(user);

    const guard = await requireRole("ADMIN");
    expect(guard.error?.status).toBe(403);
    expect(await bodyOf(guard.error!)).toMatchObject({
      error: "Insufficient permissions",
    });
  });
});

describe("resolveSession — expiry", () => {
  it("rejects a session whose expiresAt has passed", async () => {
    const user = await createUser({ role: "MERCHANT" });
    // The JWT's own exp is 7 days out; expiresAt is the claim the guard reads,
    // so a stale one must be refused even while the token still verifies.
    const token = await encrypt({
      userId: user.id,
      role: "MERCHANT",
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    cookieJar.set("session", token);

    const guard = await requireRole("MERCHANT");
    expect(guard.error?.status).toBe(401);
    expect(await bodyOf(guard.error!)).toMatchObject({ error: "Session expired" });
  });

  it("accepts a session that has not yet expired", async () => {
    const user = await createUser({ role: "MERCHANT" });
    const token = await encrypt({
      userId: user.id,
      role: "MERCHANT",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    cookieJar.set("session", token);

    expect((await requireRole("MERCHANT")).error).toBeUndefined();
  });
});

describe("resolveSession — revocation", () => {
  it("rejects a session whose user_sessions row was revoked", async () => {
    const user = await createUser({ role: "MERCHANT" });
    const session = await signIn(user);

    await db("user_sessions").where({ id: session.id }).update({
      revoked_at: new Date(),
    });

    // Signing out on another device has to take effect immediately, not in
    // seven days when the cookie expires.
    const guard = await requireRole("MERCHANT");
    expect(guard.error?.status).toBe(401);
    expect(await bodyOf(guard.error!)).toMatchObject({
      error: "Session revoked. Please sign in again.",
    });
  });

  it("rejects a session whose user_sessions row is gone", async () => {
    const user = await createUser({ role: "MERCHANT" });
    const session = await signIn(user);
    await db("user_sessions").where({ id: session.id }).del();

    expect((await requireRole("MERCHANT")).error?.status).toBe(401);
  });

  it("skips the revocation check for legacy tokens with no sessionId", async () => {
    const user = await createUser({ role: "MERCHANT" });
    // Tokens minted before session tracking carry no sessionId and cannot be
    // revoked; they still authenticate until they expire.
    const token = await encrypt({
      userId: user.id,
      role: "MERCHANT",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    cookieJar.set("session", token);

    expect((await requireRole("MERCHANT")).error).toBeUndefined();
  });

  it("touches last_seen_at on a tracked session", async () => {
    const user = await createUser({ role: "MERCHANT" });
    const session = await signIn(user);
    await db("user_sessions")
      .where({ id: session.id })
      .update({ last_seen_at: new Date(Date.now() - 60 * 60 * 1000) });
    const before = (await db("user_sessions").where({ id: session.id }).first())
      .last_seen_at;

    await requireRole("MERCHANT");

    // The touch is deliberately fire-and-forget, so poll rather than assume.
    let after = before;
    for (let i = 0; i < 40 && after.getTime() === before.getTime(); i++) {
      await new Promise((r) => setTimeout(r, 25));
      after = (await db("user_sessions").where({ id: session.id }).first()).last_seen_at;
    }
    expect(after.getTime()).toBeGreaterThan(before.getTime());
  });
});

describe("enforceMfaEnrollment", () => {
  it("blocks an ADMIN who has not enrolled TOTP", async () => {
    const user = await createUser({ role: "ADMIN", two_factor_enabled: false });
    await signIn(user);

    // Gating only at login would leave every already-issued admin cookie
    // unenforced for its full 7-day life.
    const guard = await requireRole("ADMIN");
    expect(guard.error?.status).toBe(403);
    expect(await bodyOf(guard.error!)).toMatchObject({
      code: "MFA_ENROLLMENT_REQUIRED",
    });
  });

  it("admits an ADMIN who has enrolled TOTP", async () => {
    const user = await createUser({ role: "ADMIN", two_factor_enabled: true });
    await signIn(user);
    expect((await requireRole("ADMIN")).error).toBeUndefined();
  });

  it("blocks SUPPORT without TOTP, since the policy covers staff roles", async () => {
    const user = await createUser({ role: "SUPPORT", two_factor_enabled: false });
    await signIn(user);
    expect((await requireRole("SUPPORT")).error?.status).toBe(403);
  });

  it("leaves MERCHANT opt-in", async () => {
    const user = await createUser({ role: "MERCHANT", two_factor_enabled: false });
    await signIn(user);
    expect((await requireRole("MERCHANT")).error).toBeUndefined();
  });

  it("blocks an ADMIN whose user row has vanished", async () => {
    const user = await createUser({ role: "ADMIN", two_factor_enabled: true });
    const token = await encrypt({
      userId: "00000000-0000-0000-0000-000000000000",
      role: "ADMIN",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    cookieJar.set("session", token);
    void user;

    // No row means no proof of enrollment, so the gate must fail closed.
    expect((await requireRole("ADMIN")).error?.status).toBe(403);
  });
});

describe("requireRoleAllowingMfaSetup", () => {
  it("admits an unenrolled ADMIN so they can reach the enrollment endpoints", async () => {
    const user = await createUser({ role: "ADMIN", two_factor_enabled: false });
    await signIn(user);

    const guard = await requireRoleAllowingMfaSetup("ADMIN");
    expect(guard.error).toBeUndefined();
    expect(guard.session?.userId).toBe(user.id);
  });

  it("still enforces authentication, expiry and role", async () => {
    expect((await requireRoleAllowingMfaSetup("ADMIN")).error?.status).toBe(401);

    const merchant = await createUser({ role: "MERCHANT" });
    await signIn(merchant);
    expect((await requireRoleAllowingMfaSetup("ADMIN")).error?.status).toBe(403);
  });

  it("still enforces revocation", async () => {
    const user = await createUser({ role: "ADMIN", two_factor_enabled: false });
    const session = await signIn(user);
    await db("user_sessions").where({ id: session.id }).update({
      revoked_at: new Date(),
    });
    expect((await requireRoleAllowingMfaSetup("ADMIN")).error?.status).toBe(401);
  });
});

describe("requireAdmin", () => {
  it("admits an enrolled ADMIN", async () => {
    await signedInAdmin();
    expect((await requireAdmin()).error).toBeUndefined();
  });

  it("rejects a MERCHANT", async () => {
    const user = await createUser({ role: "MERCHANT" });
    await signIn(user);
    expect((await requireAdmin()).error?.status).toBe(403);
  });

  it("rejects a user carrying users.role = SUPER_ADMIN", async () => {
    const user = await createUser({ role: "SUPER_ADMIN", two_factor_enabled: true });
    await signIn(user);

    // requireAdmin() is requireRole("ADMIN") — an exact match, not a hierarchy.
    // Super-admin-ness is expressed through admin_roles (see
    // getAdminPermissionsAndRoles), and every admin the app creates gets
    // users.role = "ADMIN", so this is consistent today. It is a trap for
    // anyone who later mints a user with the SUPER_ADMIN role expecting it to
    // outrank ADMIN: it does not, it locks them out.
    expect((await requireAdmin()).error?.status).toBe(403);
  });
});

describe("getAdminPermissionsAndRoles", () => {
  it("returns nothing for a user with no admin profile", async () => {
    const user = await createUser({ role: "MERCHANT" });
    expect(await getAdminPermissionsAndRoles(user.id)).toEqual({
      roles: [],
      permissions: [],
      isSuperAdmin: false,
    });
  });

  it("treats a profile with no assigned roles as Super Admin", async () => {
    const user = await createUser({ role: "ADMIN" });
    await createAdminProfile(user.id);

    // Back-compat: admins predating RBAC have no admin_roles rows and must
    // not be locked out of the console.
    const result = await getAdminPermissionsAndRoles(user.id);
    expect(result.isSuperAdmin).toBe(true);
    expect(result.roles).toEqual([]);
  });

  it("recognises the Super Admin role by name, case insensitively", async () => {
    const user = await createUser({ role: "ADMIN" });
    const profile = await createAdminProfile(user.id);
    const role = await createRole("SUPER ADMIN", true);
    await assignRole(profile.id, role.id);

    expect((await getAdminPermissionsAndRoles(user.id)).isSuperAdmin).toBe(true);
  });

  it("resolves the permissions attached to an ordinary role", async () => {
    const user = await createUser({ role: "ADMIN" });
    const profile = await createAdminProfile(user.id);
    const role = await createRole("Compliance Officer");
    const kyc = await createPermission("kyc.review");
    const logs = await createPermission("logs.read");
    await assignRole(profile.id, role.id);
    await grantPermission(role.id, kyc.id);
    await grantPermission(role.id, logs.id);

    const result = await getAdminPermissionsAndRoles(user.id);
    expect(result.isSuperAdmin).toBe(false);
    expect(result.roles.map((r) => r.name)).toEqual(["Compliance Officer"]);
    expect([...result.permissions].sort()).toEqual(["kyc.review", "logs.read"]);
  });

  it("merges permissions across roles without duplicating them", async () => {
    const user = await createUser({ role: "ADMIN" });
    const profile = await createAdminProfile(user.id);
    const first = await createRole("Support Agent");
    const second = await createRole("Analyst");
    const shared = await createPermission("tickets.read");
    const extra = await createPermission("reports.read");
    await assignRole(profile.id, first.id);
    await assignRole(profile.id, second.id);
    await grantPermission(first.id, shared.id);
    await grantPermission(second.id, shared.id);
    await grantPermission(second.id, extra.id);

    const result = await getAdminPermissionsAndRoles(user.id);
    expect([...result.permissions].sort()).toEqual(["reports.read", "tickets.read"]);
  });

  it("reports a role that carries no permissions as an empty grant", async () => {
    const user = await createUser({ role: "ADMIN" });
    const profile = await createAdminProfile(user.id);
    const role = await createRole("Read Only");
    await assignRole(profile.id, role.id);

    const result = await getAdminPermissionsAndRoles(user.id);
    expect(result.isSuperAdmin).toBe(false);
    expect(result.permissions).toEqual([]);
  });
});

describe("requirePermission", () => {
  it("admits an admin holding the required permission", async () => {
    const { user } = await signedInAdmin();
    const profile = await createAdminProfile(user.id);
    const role = await createRole("Compliance Officer");
    const perm = await createPermission("kyc.review");
    await assignRole(profile.id, role.id);
    await grantPermission(role.id, perm.id);

    const guard = await requirePermission("kyc.review");
    expect(guard.error).toBeUndefined();
    expect(guard.permissions).toContain("kyc.review");
    expect(guard.isSuperAdmin).toBe(false);
  });

  it("admits when the admin holds any one of several permissions", async () => {
    const { user } = await signedInAdmin();
    const profile = await createAdminProfile(user.id);
    const role = await createRole("Support Agent");
    const perm = await createPermission("tickets.read");
    await assignRole(profile.id, role.id);
    await grantPermission(role.id, perm.id);

    expect((await requirePermission("kyc.review", "tickets.read")).error).toBeUndefined();
  });

  it("rejects an admin missing the permission, naming what was required", async () => {
    const { user } = await signedInAdmin();
    const profile = await createAdminProfile(user.id);
    const role = await createRole("Support Agent");
    const perm = await createPermission("tickets.read");
    await assignRole(profile.id, role.id);
    await grantPermission(role.id, perm.id);

    const guard = await requirePermission("kyc.review");
    expect(guard.error?.status).toBe(403);
    expect(await bodyOf(guard.error!)).toMatchObject({
      code: "FORBIDDEN",
      requiredPermissions: ["kyc.review"],
    });
  });

  it("lets a Super Admin through without an explicit grant", async () => {
    const { user } = await signedInAdmin();
    const profile = await createAdminProfile(user.id);
    const role = await createRole("Super Admin", true);
    await assignRole(profile.id, role.id);

    const guard = await requirePermission("anything.at.all");
    expect(guard.error).toBeUndefined();
    expect(guard.isSuperAdmin).toBe(true);
  });

  it("rejects an admin with no admin profile at all", async () => {
    await signedInAdmin();
    // No admin_profiles row means no roles and no super-admin fallback.
    expect((await requirePermission("kyc.review")).error?.status).toBe(403);
  });

  it("applies the ADMIN role and MFA gates before looking at permissions", async () => {
    const merchant = await createUser({ role: "MERCHANT" });
    await signIn(merchant);
    expect((await requirePermission("kyc.review")).error?.status).toBe(403);

    cookieJar.clear();
    const unenrolled = await createUser({ role: "ADMIN", two_factor_enabled: false });
    await signIn(unenrolled);
    const guard = await requirePermission("kyc.review");
    expect(await bodyOf(guard.error!)).toMatchObject({
      code: "MFA_ENROLLMENT_REQUIRED",
    });
  });
});

describe("requireMerchant and verification state", () => {
  it("rejects an authenticated merchant with no merchant profile", async () => {
    const user = await createUser({ role: "MERCHANT" });
    await signIn(user);

    const guard = await requireVerifiedMerchant();
    expect(guard.error?.status).toBe(404);
    expect(await bodyOf(guard.error!)).toMatchObject({
      error: "Merchant profile not found",
    });
  });

  it("rejects a session pointing at a user row that no longer exists", async () => {
    const token = await encrypt({
      userId: "00000000-0000-0000-0000-000000000000",
      role: "MERCHANT",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    cookieJar.set("session", token);

    const guard = await requireVerifiedMerchant();
    expect(guard.error?.status).toBe(404);
    expect(await bodyOf(guard.error!)).toMatchObject({ error: "User not found" });
  });

  it("requireMerchant itself does not check verification", async () => {
    const user = await createUser({ role: "MERCHANT", email_verified_at: null });
    await signIn(user);
    expect((await requireMerchant()).error).toBeUndefined();
  });
});

describe("requireVerifiedMerchant", () => {
  async function signedInMerchant(userOverrides: Record<string, unknown> = {}) {
    const merchant = await createMerchant({}, );
    await db("users").where({ id: merchant.user_id }).update(userOverrides);
    const user = await db("users").where({ id: merchant.user_id }).first();
    await signIn(user);
    return merchant;
  }

  it("checks mobile verification before email", async () => {
    await signedInMerchant({ mobile_verified_at: null, email_verified_at: null });
    const guard = await requireVerifiedMerchant();
    expect(guard.error?.status).toBe(403);
    // Both are missing; the mobile check runs first.
    expect(await bodyOf(guard.error!)).toMatchObject({ code: "MOBILE_NOT_VERIFIED" });
  });

  it("rejects an unverified email once mobile is verified", async () => {
    await signedInMerchant({ mobile_verified_at: new Date(), email_verified_at: null });
    const guard = await requireVerifiedMerchant();
    expect(await bodyOf(guard.error!)).toMatchObject({ code: "EMAIL_NOT_VERIFIED" });
  });

  it("admits a fully verified merchant regardless of KYC", async () => {
    const merchant = await signedInMerchant({
      mobile_verified_at: new Date(),
      email_verified_at: new Date(),
    });

    const guard = await requireVerifiedMerchant();
    expect(guard.error).toBeUndefined();
    expect(guard.merchant?.id).toBe(merchant.id);
    expect(guard.kycStatus).toBeNull();
  });
});

describe("requireActiveMerchant", () => {
  async function signedInMerchant(userOverrides: Record<string, unknown> = {}) {
    const merchant = await createMerchant();
    await db("users")
      .where({ id: merchant.user_id })
      .update({
        mobile_verified_at: new Date(),
        email_verified_at: new Date(),
        ...userOverrides,
      });
    const user = await db("users").where({ id: merchant.user_id }).first();
    await signIn(user);
    return merchant;
  }

  it("admits a verified merchant with APPROVED KYC", async () => {
    const merchant = await signedInMerchant();
    await createKycRecord(merchant.user_id, "APPROVED");

    const guard = await requireActiveMerchant();
    expect(guard.error).toBeUndefined();
    expect(guard.merchant?.id).toBe(merchant.id);
    expect(guard.kycStatus).toBe("APPROVED");
  });

  it("rejects a merchant with no KYC record and reports a null status", async () => {
    await signedInMerchant();
    const guard = await requireActiveMerchant();
    expect(guard.error?.status).toBe(403);
    expect(await bodyOf(guard.error!)).toMatchObject({
      code: "KYC_NOT_APPROVED",
      kyc_status: null,
    });
  });

  it.each(["PENDING", "IN_REVIEW", "REJECTED", "EXPIRED"])(
    "rejects KYC in %s and echoes the status",
    async (status) => {
      const merchant = await signedInMerchant();
      await createKycRecord(merchant.user_id, status);

      const guard = await requireActiveMerchant();
      expect(guard.error?.status).toBe(403);
      expect(await bodyOf(guard.error!)).toMatchObject({
        code: "KYC_NOT_APPROVED",
        kyc_status: status,
      });
    }
  );

  it("checks email verification before KYC", async () => {
    const merchant = await signedInMerchant({ email_verified_at: null });
    await createKycRecord(merchant.user_id, "APPROVED");

    const guard = await requireActiveMerchant();
    expect(await bodyOf(guard.error!)).toMatchObject({ code: "EMAIL_NOT_VERIFIED" });
  });

  it("checks mobile verification before everything else", async () => {
    const merchant = await signedInMerchant({ mobile_verified_at: null });
    await createKycRecord(merchant.user_id, "APPROVED");

    const guard = await requireActiveMerchant();
    expect(guard.error?.status).toBe(403);
    expect(await bodyOf(guard.error!)).toMatchObject({ code: "MOBILE_NOT_VERIFIED" });
  });
});
