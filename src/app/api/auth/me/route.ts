// GET /api/auth/me — return current authenticated user
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import type { User, Merchant, AdminProfile } from "@/lib/types";
import { fromMinorUnits } from "@/lib/utils";

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
    .select("id", "email", "first_name", "last_name", "role", "status", "last_login", "email_verified_at", "two_factor_enabled", "created_at")
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
      const floatBalanceRow = await db("ledger_account_balances")
        .where({ owner_id: merchant.id, account_type: "MERCHANT_FLOAT", currency: "GHS" })
        .first();
        
      const available_balance = fromMinorUnits(floatBalanceRow?.balance || 0);

      // Load KYC status for frontend gating
      const kycRecord = await db("kyc_records")
        .where({ user_id: user.id })
        .select("status")
        .first();

      profile = {
        merchant: { ...merchant, available_balance },
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
    profile = { admin };
  }

  return Response.json({ user, ...profile });
}
