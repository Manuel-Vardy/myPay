// GET /api/admin/revenue — platform revenue earned from fees
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    // Revenue is money the platform actually earned: charged fees that were
    // not waived. fee_ledger is immutable, so it is the source of truth.
    const notWaived = () => db("fee_ledger").where("is_waived", false);

    // Total earned revenue + fee count
    const totalRow = await notWaived()
      .sum("amount as total")
      .count("id as cnt")
      .first();

    // Total waived (revenue given up)
    const waivedRow = await db("fee_ledger")
      .where("is_waived", true)
      .sum("amount as total")
      .first();

    // Revenue in the last 24h and last 30 days
    const last24hRow = await notWaived()
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '24 hours'"))
      .sum("amount as total")
      .first();
    const last30dRow = await notWaived()
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '30 days'"))
      .sum("amount as total")
      .first();

    // Breakdown by fee type
    const byTypeRows = await notWaived()
      .select("fee_type")
      .sum("amount as total")
      .count("id as cnt")
      .groupBy("fee_type")
      .orderBy("total", "desc");

    // Daily time-series (last 12 days) for the trend graph
    const dailyRows = await notWaived()
      .select(db.raw("DATE(created_at) as date"))
      .sum("amount as total")
      .groupByRaw("DATE(created_at)")
      .orderByRaw("DATE(created_at) DESC")
      .limit(12);

    const revenue_graph = Array(12).fill(0);
    dailyRows.forEach((row: any, i: number) => {
      revenue_graph[11 - i] = fromMinorUnits(row.total || 0);
    });

    // Most recent fees charged
    const recentRows = await db("fee_ledger")
      .leftJoin("merchants", "fee_ledger.merchant_id", "merchants.id")
      .select(
        "fee_ledger.id",
        "fee_ledger.fee_type",
        "fee_ledger.amount",
        "fee_ledger.currency",
        "fee_ledger.is_waived",
        "fee_ledger.created_at",
        "merchants.business_name",
        "merchants.merchant_display_id"
      )
      .orderBy("fee_ledger.created_at", "desc")
      .limit(15);

    return Response.json({
      total_revenue: fromMinorUnits(totalRow?.total || 0),
      total_fees_charged: Number(totalRow?.cnt || 0),
      total_waived: fromMinorUnits(waivedRow?.total || 0),
      revenue_last_24h: fromMinorUnits(last24hRow?.total || 0),
      revenue_last_30d: fromMinorUnits(last30dRow?.total || 0),
      by_type: byTypeRows.map((r: any) => ({
        fee_type: r.fee_type,
        total: fromMinorUnits(r.total || 0),
        count: Number(r.cnt || 0),
      })),
      revenue_graph,
      recent_fees: recentRows.map((r: any) => ({
        ...r,
        amount: r.amount != null ? fromMinorUnits(r.amount) : null,
      })),
    });
  } catch (error) {
    console.error("Admin revenue error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
