// GET /api/admin/settlements — platform-wide settlement ledger with filters
// and per-status summary totals.
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
    const status = searchParams.get("status"); // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    const merchant_id = searchParams.get("merchant_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    let query = db("settlements")
      .join("merchants", "settlements.merchant_id", "merchants.id")
      .leftJoin(
        "settlement_accounts",
        "settlements.account_id",
        "settlement_accounts.id"
      )
      .select(
        "settlements.*",
        "merchants.business_name",
        "merchants.merchant_display_id",
        "settlement_accounts.provider_name",
        "settlement_accounts.account_number"
      );

    if (search) {
      const term = `%${search.trim()}%`;
      query = query.where((q) =>
        q
          .whereILike("settlements.settlement_id_display", term)
          .orWhereILike("merchants.business_name", term)
          .orWhereILike("merchants.merchant_display_id", term)
          .orWhereILike("settlements.bank_reference", term)
      );
    }
    if (status) query = query.where("settlements.status", status);
    if (merchant_id) query = query.where("settlements.merchant_id", merchant_id);
    if (date_from) query = query.where("settlements.created_at", ">=", date_from);
    if (date_to) query = query.where("settlements.created_at", "<=", date_to);

    const countQuery = query
      .clone()
      .clearSelect()
      .clearOrder()
      .count("settlements.id as cnt")
      .first();
    const total = Number((await countQuery)?.cnt || 0);

    const rows = await query
      .orderBy("settlements.created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    const data = rows.map((s: any) => ({
      ...s,
      gross_amount: s.gross_amount != null ? fromMinorUnits(s.gross_amount) : null,
      fees: s.fees != null ? fromMinorUnits(s.fees) : null,
      net_amount: s.net_amount != null ? fromMinorUnits(s.net_amount) : null,
      account_number: s.account_number
        ? `****${String(s.account_number).slice(-4)}`
        : null,
    }));

    // Summary: count + totals per status (unfiltered — feeds the tiles)
    const rawSummary = await db("settlements")
      .select("status")
      .count("id as count")
      .sum("gross_amount as gross")
      .sum("fees as fees")
      .sum("net_amount as net")
      .groupBy("status");
    const summary = rawSummary.map((s: any) => ({
      status: s.status,
      count: Number(s.count || 0),
      gross: s.gross != null ? fromMinorUnits(s.gross) : 0,
      fees: s.fees != null ? fromMinorUnits(s.fees) : 0,
      net: s.net != null ? fromMinorUnits(s.net) : 0,
    }));

    return Response.json({
      data,
      summary,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Admin settlements error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
