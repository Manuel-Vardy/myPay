// GET /api/auth/me — return current authenticated user
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import type { User, Merchant, AdminProfile } from "@/lib/types";
import { fromMinorUnits } from "@/lib/utils";
import { getMerchantFloatBalances } from "@/lib/settlements/balance";

import { getAdminPermissionsAndRoles } from "@/lib/guards";
import { mfaRequiredForRole } from "@/lib/mfa-policy";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Reject revoked sessions (legacy tokens have no sessionId)
  if (session.sessionId) {
    const sessionRow = await db("user_sessions")
      .where({ id: session.sessionId })
      .first("id", "revoked_at");
    if (!sessionRow || sessionRow.revoked_at) {
      return Response.json({ error: "Session revoked" }, { status: 401 });
    }
  }

  const user = await db<User>("users")
    .where({ id: session.userId })
    .select("id", "email", "first_name", "last_name", "role", "status", "last_login", "email_verified_at", "mobile_number", "mobile_verified_at", "two_factor_enabled", "created_at")
    .first();

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Attach role-specific profile data
  let profile: Record<string, unknown> = {};

  if (user.role === "MERCHANT") {
    const merchant = await db<Merchant>("merchants")
      .where({ user_id: user.id })
      .select(
        "id",
        "business_name",
        "merchant_display_id",
        "tier",
        "region"
      )
      .first();
      
    if (merchant) {
      const floatBalances = await getMerchantFloatBalances(merchant.id, "GHS");
      const available_balance = fromMinorUnits(floatBalances.total);
      const withdrawable_balance = fromMinorUnits(floatBalances.withdrawable);

      const kycRecord = await db("kyc_records")
        .where({ user_id: user.id })
        .select("status")
        .first();

      profile = {
        merchant: { ...merchant, available_balance, withdrawable_balance },
        kyc_status: kycRecord?.status ?? null,
      };
    } else {
      profile = { merchant: null, kyc_status: null };
    }
  } else if (user.role === "ADMIN") {
    const admin = await db<AdminProfile>("admin_profiles")
      .where({ user_id: user.id })
      .select("id", "admin_id_display", "notification_settings")
      .first();

    const { roles, permissions, isSuperAdmin } = await getAdminPermissionsAndRoles(user.id);

    profile = {
      admin,
      roles,
      permissions,
      isSuperAdmin,
    };
  }

  // This endpoint deliberately stays reachable while enrollment is pending —
  // it is how the settings page renders the enrollment prompt.
  const mfa_mandatory = mfaRequiredForRole(user.role);

  return Response.json({
    user,
    mfa_mandatory,
    mfa_enrollment_required: mfa_mandatory && !user.two_factor_enabled,
    ...profile,
  });
}
