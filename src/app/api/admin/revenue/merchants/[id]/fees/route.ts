import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { id: merchantId } = await context.params;
    if (!merchantId) {
      return Response.json({ error: "Merchant ID is required" }, { status: 400 });
    }

    // 1. Fetch merchant details
    const merchant = await db("merchants")
      .select("id", "business_name", "merchant_display_id", "tier as merchant_tier", "user_id")
      .where("id", merchantId)
      .first();

    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const feeType = searchParams.get("fee_type");
    const status = searchParams.get("status") || "ALL";

    // 2. Fetch merchant aggregate statistics
    const statsRow = await db("fee_ledger")
      .where("merchant_id", merchantId)
      .select(
        db.raw("SUM(CASE WHEN is_waived = false THEN amount ELSE 0 END) as total_fees"),
        db.raw("COUNT(CASE WHEN is_waived = false THEN 1 ELSE NULL END) as fee_count"),
        db.raw("SUM(CASE WHEN is_waived = true THEN amount ELSE 0 END) as waived_fees"),
        db.raw("COUNT(CASE WHEN is_waived = true THEN 1 ELSE NULL END) as waived_count")
      )
      .first();

    // 3. Build query for paginated fees
    let query = db("fee_ledger")
      .leftJoin("transactions", "fee_ledger.transaction_id", "transactions.id")
      .leftJoin("settlements", "fee_ledger.settlement_id", "settlements.id")
      .where("fee_ledger.merchant_id", merchantId);

    if (feeType && feeType !== "ALL") {
      query = query.where("fee_ledger.fee_type", feeType);
    }

    if (status === "CHARGED") {
      query = query.where("fee_ledger.is_waived", false);
    } else if (status === "WAIVED") {
      query = query.where("fee_ledger.is_waived", true);
    }

    // Count total matching records
    const countResult = await query.clone().count("fee_ledger.id as count").first();
    const totalCount = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    // Fetch paginated fee records
    const rows = await query
      .select(
        "fee_ledger.id",
        "fee_ledger.fee_type",
        "fee_ledger.amount",
        "fee_ledger.currency",
        "fee_ledger.is_waived",
        "fee_ledger.waiver_reason",
        "fee_ledger.flat_amount_applied",
        "fee_ledger.percentage_rate_applied",
        "fee_ledger.basis_amount",
        "fee_ledger.created_at",
        "fee_ledger.transaction_id",
        "transactions.tx_id_display",
        "fee_ledger.settlement_id",
        "settlements.settlement_id_display"
      )
      .orderBy("fee_ledger.created_at", "desc")
      .offset((page - 1) * limit)
      .limit(limit);

    const fees = rows.map((r: any) => ({
      id: r.id,
      fee_type: r.fee_type,
      amount: r.amount != null ? fromMinorUnits(r.amount) : 0,
      currency: r.currency || "GHS",
      is_waived: Boolean(r.is_waived),
      waiver_reason: r.waiver_reason || null,
      flat_amount_applied: r.flat_amount_applied != null ? fromMinorUnits(r.flat_amount_applied) : null,
      percentage_rate_applied: r.percentage_rate_applied != null ? Number(r.percentage_rate_applied) : null,
      basis_amount: r.basis_amount != null ? fromMinorUnits(r.basis_amount) : null,
      created_at: r.created_at,
      transaction_id: r.transaction_id || null,
      tx_id_display: r.tx_id_display || null,
      settlement_id: r.settlement_id || null,
      settlement_id_display: r.settlement_id_display || null,
    }));

    return Response.json({
      merchant: {
        id: merchant.id,
        business_name: merchant.business_name,
        merchant_display_id: merchant.merchant_display_id,
        merchant_tier: merchant.merchant_tier,
        user_id: merchant.user_id,
        total_fees: fromMinorUnits(statsRow?.total_fees || 0),
        fee_count: Number(statsRow?.fee_count || 0),
        waived_fees: fromMinorUnits(statsRow?.waived_fees || 0),
        waived_count: Number(statsRow?.waived_count || 0),
      },
      fees,
      pagination: {
        page,
        limit,
        total_count: totalCount,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Admin merchant fees error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
