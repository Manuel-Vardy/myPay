// GET /api/admin/withdrawal-requests — merchant withdrawal requests awaiting
// (or past) admin review, with filters and status summary.
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
    const status = searchParams.get("status"); // PENDING, PROCESSING, APPROVED, REJECTED, FAILED
    const merchant_id = searchParams.get("merchant_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    let query = db("withdrawal_requests")
      .join("merchants", "withdrawal_requests.merchant_id", "merchants.id")
      .join(
        "settlement_accounts",
        "withdrawal_requests.settlement_account_id",
        "settlement_accounts.id"
      )
      .leftJoin("settlements", "withdrawal_requests.settlement_id", "settlements.id")
      .select(
        "withdrawal_requests.*",
        "merchants.business_name",
        "merchants.merchant_display_id",
        "settlement_accounts.provider_name",
        "settlement_accounts.account_number",
        "settlement_accounts.account_name",
        "settlements.settlement_id_display",
        "settlements.status as settlement_status"
      );

    if (search) {
      const term = `%${search.trim()}%`;
      query = query.where((q) =>
        q
          .whereILike("withdrawal_requests.request_id_display", term)
          .orWhereILike("merchants.business_name", term)
          .orWhereILike("merchants.merchant_display_id", term)
      );
    }
    if (status) query = query.where("withdrawal_requests.status", status);
    if (merchant_id) query = query.where("withdrawal_requests.merchant_id", merchant_id);
    if (date_from) query = query.where("withdrawal_requests.created_at", ">=", date_from);
    if (date_to) query = query.where("withdrawal_requests.created_at", "<=", date_to);

    const countQuery = query
      .clone()
      .clearSelect()
      .clearOrder()
      .count("withdrawal_requests.id as cnt")
      .first();
    const total = Number((await countQuery)?.cnt || 0);

    const rows = await query
      .orderBy("withdrawal_requests.created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    const data = rows.map((r: any) => ({
      ...r,
      amount: r.amount != null ? fromMinorUnits(r.amount) : null,
      account_number: `****${String(r.account_number).slice(-4)}`,
    }));

    // Summary: count + total amount per status (unfiltered — feeds the tiles)
    const rawSummary = await db("withdrawal_requests")
      .select("status")
      .count("id as count")
      .sum("amount as amount")
      .groupBy("status");
    const summary = rawSummary.map((s: any) => ({
      status: s.status,
      count: Number(s.count || 0),
      amount: s.amount != null ? fromMinorUnits(s.amount) : 0,
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
    console.error("Admin withdrawal requests error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
