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

    // Daily time-series (last 12 calendar days) for the trend graph
    const dailyRows = await notWaived()
      .select(db.raw("DATE(created_at) as fee_date"))
      .sum("amount as total")
      .where("created_at", ">=", db.raw("CURRENT_DATE - INTERVAL '11 days'"))
      .groupByRaw("DATE(created_at)");

    const feeMap = new Map<string, number>();
    dailyRows.forEach((row: any) => {
      let dateKey = "";
      if (row.fee_date instanceof Date) {
        dateKey = row.fee_date.toISOString().split("T")[0];
      } else if (typeof row.fee_date === "string") {
        dateKey = row.fee_date.split("T")[0];
      } else if (row.fee_date) {
        dateKey = String(row.fee_date).split("T")[0];
      }
      if (dateKey) {
        feeMap.set(dateKey, Number(row.total || 0));
      }
    });

    const revenue_graph = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const amountMinor = feeMap.get(dateStr) || 0;
      revenue_graph.push({
        date: dateStr,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day_name: d.toLocaleDateString("en-US", { weekday: "short" }),
        amount: fromMinorUnits(amountMinor),
      });
    }

    // Top merchants ranked by total fees acquired
    const topMerchantsRows = await db("fee_ledger")
      .join("merchants", "fee_ledger.merchant_id", "merchants.id")
      .select(
        "merchants.id as merchant_id",
        "merchants.business_name",
        "merchants.merchant_display_id",
        "merchants.tier as merchant_tier",
        "merchants.user_id"
      )
      .select(
        db.raw("SUM(CASE WHEN fee_ledger.is_waived = false THEN fee_ledger.amount ELSE 0 END) as total_fees"),
        db.raw("COUNT(CASE WHEN fee_ledger.is_waived = false THEN 1 ELSE NULL END) as fee_count"),
        db.raw("SUM(CASE WHEN fee_ledger.is_waived = true THEN fee_ledger.amount ELSE 0 END) as waived_fees"),
        db.raw("COUNT(CASE WHEN fee_ledger.is_waived = true THEN 1 ELSE NULL END) as waived_count"),
        db.raw("MAX(fee_ledger.created_at) as last_fee_at")
      )
      .groupBy(
        "merchants.id",
        "merchants.business_name",
        "merchants.merchant_display_id",
        "merchants.tier",
        "merchants.user_id"
      )
      .orderBy("total_fees", "desc")
      .limit(20);

    const top_merchants = topMerchantsRows.map((r: any) => ({
      merchant_id: r.merchant_id,
      business_name: r.business_name,
      merchant_display_id: r.merchant_display_id,
      merchant_tier: r.merchant_tier,
      user_id: r.user_id,
      total_fees: fromMinorUnits(r.total_fees || 0),
      fee_count: Number(r.fee_count || 0),
      waived_fees: fromMinorUnits(r.waived_fees || 0),
      waived_count: Number(r.waived_count || 0),
      last_fee_at: r.last_fee_at ? new Date(r.last_fee_at).toISOString() : null,
    }));

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
      top_merchants,
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
