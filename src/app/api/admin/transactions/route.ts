// GET /api/admin/transactions — full ledger with filters for anomaly detection
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const search = searchParams.get("search");
    const method = searchParams.get("method"); // CARD, CRYPTO, ACH, SWIFT, MOBILE_MONEY
    const status = searchParams.get("status"); // PENDING, SUCCESS, FAILED
    const flag_level = searchParams.get("flag_level"); // NONE, LOW, MEDIUM, HIGH
    const merchant_id = searchParams.get("merchant_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    let query = db("transactions")
      .join("merchants", "transactions.merchant_id", "merchants.id")
      .select(
        "transactions.*",
        "merchants.business_name",
        "merchants.merchant_display_id"
      );

    if (search) {
      const term = `%${search.trim()}%`;
      query = query.where((q) =>
        q
          .whereILike("transactions.tx_id_display", term)
          .orWhereILike("transactions.payer_email", term)
          .orWhereILike("merchants.business_name", term)
      );
    }
    if (method) query = query.where("transactions.method", method);
    if (status) query = query.where("transactions.status", status);
    if (flag_level) query = query.where("transactions.flag_level", flag_level);
    if (merchant_id) query = query.where("transactions.merchant_id", merchant_id);
    if (date_from) query = query.where("transactions.created_at", ">=", date_from);
    if (date_to) query = query.where("transactions.created_at", "<=", date_to);

    // Count total
    const countQuery = query.clone().clearSelect().clearOrder().count("transactions.id as cnt").first();
    const total = Number((await countQuery)?.cnt || 0);

    // Fetch page
    const rawTransactions = await query
      .orderBy("transactions.created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    const transactions = rawTransactions.map((tx: any) => ({
      ...tx,
      amount: tx.amount != null ? fromMinorUnits(tx.amount) : null,
      fee_amount: tx.fee_amount != null ? fromMinorUnits(tx.fee_amount) : null,
      net_amount: tx.net_amount != null ? fromMinorUnits(tx.net_amount) : null,
    }));

    // Anomaly summary — flagged transaction counts by level
    const anomalySummary = await db("transactions")
      .whereIn("flag_level", ["MEDIUM", "HIGH"])
      .select("flag_level")
      .count("id as count")
      .groupBy("flag_level");

    return Response.json({
      data: transactions,
      anomalies: anomalySummary,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Admin transactions error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
