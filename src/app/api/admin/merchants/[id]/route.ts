// GET  /api/admin/merchants/[id] — merchant profile, metrics, recent txns
// PATCH /api/admin/merchants/[id] — update merchant status
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { id } = await params;

    // Fetch core merchant + user data
    const merchant = await db("users")
      .leftJoin("merchants", "users.id", "merchants.user_id")
      .leftJoin("ledger_account_balances", function () {
        this.on("merchants.id", "=", "ledger_account_balances.owner_id")
          .andOnVal("ledger_account_balances.account_type", "=", "MERCHANT_FLOAT");
      })
      .where("users.id", id)
      .select(
        "users.id",
        "users.email",
        "users.role",
        "users.status",
        "users.two_factor_enabled",
        "users.last_login",
        "users.created_at",
        "merchants.id as merchant_id",
        "merchants.business_name",
        "merchants.merchant_display_id",
        "merchants.tier as merchant_tier",
        "merchants.region",
        "merchants.api_keys",
        "merchants.notification_email",
        "merchants.payments_paused_at",
        "merchants.payments_paused_reason",
        "ledger_account_balances.balance as available_balance"
      )
      .first();

    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    // Aggregate metrics — only settled transactions
    const metrics = await db("transactions")
      .where({ merchant_id: merchant.merchant_id, status: "SETTLED" })
      .select(
        db.raw("COUNT(*)::int as transaction_count"),
        db.raw("COALESCE(SUM(amount), 0) as total_volume"),
        db.raw("COALESCE(AVG(amount), 0) as avg_value")
      )
      .first();

    // Recent transactions — last 10
    const recentTransactions = await db("transactions")
      .where({ merchant_id: merchant.merchant_id })
      .orderBy("created_at", "desc")
      .limit(10)
      .select(
        "id",
        "tx_id_display",
        "amount",
        "currency",
        "status",
        "method",
        "created_at"
      );

    // KYC status
    const kycRecord = await db("kyc_records")
      .where({ user_id: id })
      .orderBy("created_at", "desc")
      .first();

    // Count active API keys
    let apiKeyCount = 0;
    try {
      const keys = typeof merchant.api_keys === "string"
        ? JSON.parse(merchant.api_keys)
        : merchant.api_keys;
      apiKeyCount = Array.isArray(keys) ? keys.filter((k: any) => k.active !== false).length : 0;
    } catch {
      apiKeyCount = 0;
    }

    return Response.json({
      profile: {
        id: merchant.id,
        email: merchant.email,
        role: merchant.role,
        status: merchant.status,
        two_factor_enabled: merchant.two_factor_enabled,
        last_login: merchant.last_login,
        created_at: merchant.created_at,
        merchant_id: merchant.merchant_id,
        business_name: merchant.business_name,
        merchant_display_id: merchant.merchant_display_id,
        merchant_tier: merchant.merchant_tier,
        region: merchant.region,
        notification_email: merchant.notification_email,
        available_balance: merchant.available_balance != null ? fromMinorUnits(merchant.available_balance) : null,
        api_key_count: apiKeyCount,
        kyc_status: kycRecord?.status || "NOT_SUBMITTED",
        payments_paused: Boolean(merchant.payments_paused_at),
        payments_paused_at: merchant.payments_paused_at,
        payments_paused_reason: merchant.payments_paused_reason,
      },
      metrics: {
        transaction_count: metrics?.transaction_count ?? 0,
        total_volume: metrics?.total_volume != null ? fromMinorUnits(metrics.total_volume) : 0,
        avg_value: metrics?.avg_value != null ? fromMinorUnits(metrics.avg_value) : 0,
      },
      recent_transactions: recentTransactions.map((tx: any) => ({
        ...tx,
        amount: fromMinorUnits(tx.amount),
      })),
    });
  } catch (error) {
    console.error("Admin merchant profile error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["ACTIVE", "SUSPENDED", "FLAGGED"];
    if (!status || !validStatuses.includes(status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const user = await db("users").where({ id }).first();
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const previousStatus = user.status;

    await db("users").where({ id }).update({ status, updated_at: new Date() });

    await db("system_logs").insert({
      level: "WARN",
      source: "ADMIN_ACTION",
      event_description: `Admin ${guard.session.userId} changed merchant ${id} status: ${previousStatus} → ${status}`,
    });

    return Response.json({ success: true, previous_status: previousStatus, new_status: status });
  } catch (error) {
    console.error("Admin merchant status update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
