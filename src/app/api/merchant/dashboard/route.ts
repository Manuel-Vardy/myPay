// GET /api/merchant/dashboard — merchant balance, volume, and gateway health
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }
    const merchant_id = merchantUser.id;

    // Merchant profile
    const merchant = await db("merchants").where({ id: merchant_id }).first();
    if (!merchant) {
      return Response.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    // Daily volume (today's successful transactions)
    const dailyVolume = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", db.raw("CURRENT_DATE"))
      .sum("amount as total")
      .first();

    // Total transaction count
    const txCount = await db("transactions")
      .where({ merchant_id })
      .count("id as cnt")
      .first();

    // Pending settlements
    const pendingSettlements = await db("settlements")
      .where({ merchant_id, status: "PENDING" })
      .sum("net_amount as total")
      .first();

    // Gateway health (based on recent failure rate)
    const recentTxCount = await db("transactions")
      .where({ merchant_id })
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '1 hour'"))
      .count("id as cnt")
      .first();

    const recentFailures = await db("transactions")
      .where({ merchant_id, status: "FAILED" })
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '1 hour'"))
      .count("id as cnt")
      .first();

    const totalRecent = Number(recentTxCount?.cnt || 0);
    const failedRecent = Number(recentFailures?.cnt || 0);
    const failureRate = totalRecent > 0 ? failedRecent / totalRecent : 0;

    let gateway_health: "OPERATIONAL" | "DEGRADED" | "DOWN" = "OPERATIONAL";
    if (failureRate > 0.5) gateway_health = "DOWN";
    else if (failureRate > 0.1) gateway_health = "DEGRADED";

    // Stablecoin holdings
    const stablecoinSummary = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .whereNotNull("stablecoin_amount")
      .select("stablecoin_currency")
      .sum("stablecoin_amount as total")
      .groupBy("stablecoin_currency");

    const stablecoin_holdings: Record<string, number> = { USDC: 0, USDT: 0, Total: 0 };
    stablecoinSummary.forEach((row: any) => {
      const cur = row.stablecoin_currency || "USDT";
      const val = Number(row.total || 0);
      stablecoin_holdings[cur] = val;
      stablecoin_holdings.Total += val;
    });

    // Revenue Chart data (Success transactions volume)
    // Day (Last 24h in 4h blocks)
    const dayData = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '24 hours'"))
      .select(db.raw("FLOOR(EXTRACT(HOUR FROM created_at) / 4) * 4 as block"))
      .sum("amount as value")
      .groupBy("block")
      .orderBy("block");

    const revenue_chart = {
      day: [0, 4, 8, 12, 16, 20].map(h => {
        const match = dayData.find((d: any) => Number(d.block) === h);
        return { label: `${h.toString().padStart(2, '0')}:00`, value: Number(match?.value || 0) };
      }),
      week: [] as { label: string, value: number }[],
      month: [] as { label: string, value: number }[],
      year: [] as { label: string, value: number }[],
    };

    // Week (Last 7 days)
    const weekData = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", db.raw("CURRENT_DATE - INTERVAL '6 days'"))
      .select(db.raw("TO_CHAR(created_at, 'Dy') as label"))
      .select(db.raw("DATE_TRUNC('day', created_at) as day_date"))
      .sum("amount as value")
      .groupBy("label", "day_date")
      .orderBy("day_date");
    revenue_chart.week = weekData.map((d: any) => ({ label: d.label, value: Number(d.value) }));

    // Month (Last 4 weeks)
    const monthData = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", db.raw("CURRENT_DATE - INTERVAL '28 days'"))
      .select(db.raw("FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - created_at)) / 7) as week_idx"))
      .sum("amount as value")
      .groupBy("week_idx")
      .orderBy("week_idx", "desc");
    
    revenue_chart.month = [3, 2, 1, 0].map(idx => {
      const match = monthData.find((d: any) => Number(d.week_idx) === idx);
      return { label: `Week ${4-idx}`, value: Number(match?.value || 0) };
    });

    // Year (Last 12 months)
    const yearData = await db("transactions")
      .where({ merchant_id, status: "SUCCESS" })
      .where("created_at", ">=", db.raw("DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'"))
      .select(db.raw("TO_CHAR(created_at, 'Mon') as label"))
      .select(db.raw("DATE_TRUNC('month', created_at) as month_date"))
      .sum("amount as value")
      .groupBy("label", "month_date")
      .orderBy("month_date");
    revenue_chart.year = yearData.map((d: any) => ({ label: d.label, value: Number(d.value) }));

    return Response.json({
      available_balance: Number(merchant.available_balance),
      balance_currency: merchant.balance_currency,
      daily_volume: Number(dailyVolume?.total || 0),
      total_transactions: Number(txCount?.cnt || 0),
      pending_settlements: Number(pendingSettlements?.total || 0),
      gateway_health,
      stablecoin_holdings,
      revenue_chart,
      merchant: {
        business_name: merchant.business_name,
        merchant_display_id: merchant.merchant_display_id,
        tier: merchant.tier,
        region: merchant.region,
      },
    });
  } catch (error) {
    console.error("Merchant dashboard error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
