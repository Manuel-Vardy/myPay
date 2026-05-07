// GET /api/merchant/analytics — revenue, AOV, conversion rates, method mix
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }
    const merchant_id = merchantUser.id;

    // Determine date range
    const periodDays = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const dateFilter = db.raw(`NOW() - INTERVAL '${periodDays} days'`);

    // Total revenue (successful transactions)
    const revenueResult = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", dateFilter)
      .sum("amount as total")
      .count("id as count")
      .first();

    const totalRevenue = Number(revenueResult?.total || 0);
    const successCount = Number(revenueResult?.count || 0);

    // AOV
    const aov = successCount > 0 ? totalRevenue / successCount : 0;

    // Conversion rate (successful / total)
    const totalAttempts = await db("transactions")
      .where({ merchant_id })
      .where("created_at", ">=", dateFilter)
      .count("id as cnt")
      .first();
    const conversionRate =
      Number(totalAttempts?.cnt || 0) > 0
        ? successCount / Number(totalAttempts?.cnt || 1)
        : 0;

    // Method mix
    const methodMix = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", dateFilter)
      .select("method")
      .sum("amount as total")
      .count("id as count")
      .groupBy("method");

    const methodMixObj: Record<string, { amount: number; count: number }> = {};
    for (const row of methodMix) {
      methodMixObj[row.method] = {
        amount: Number(row.total),
        count: Number(row.count),
      };
    }

    // Revenue by region (from customers via transactions metadata)
    // Simplified: group by gateway_node as proxy for region
    const revenueByRegion = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", dateFilter)
      .whereNotNull("gateway_node")
      .select("gateway_node as region")
      .sum("amount as total")
      .groupBy("gateway_node");

    const regionObj: Record<string, number> = {};
    for (const row of revenueByRegion) {
      regionObj[row.region] = Number(row.total);
    }

    // Revenue trend (daily aggregation)
    const revenueTrend = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", dateFilter)
      .select(db.raw("DATE(created_at) as date"))
      .sum("amount as amount")
      .groupBy(db.raw("DATE(created_at)"))
      .orderBy("date", "asc");

    return Response.json({
      total_revenue: totalRevenue,
      aov: Math.round(aov * 100) / 100,
      conversion_rate: Math.round(conversionRate * 10000) / 100, // percentage
      method_mix: methodMixObj,
      revenue_by_region: regionObj,
      revenue_trend: revenueTrend.map((r: { date: string; amount: string }) => ({
        date: r.date,
        amount: Number(r.amount),
      })),
      period,
    });
  } catch (error) {
    console.error("Merchant analytics error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
