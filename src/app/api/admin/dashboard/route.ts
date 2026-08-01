// GET /api/admin/dashboard — platform overview stats
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    // Total platform volume (sum of all successful transactions)
    const volumeResult = await db("transactions")
      .where({ status: "SETTLED" })
      .sum("amount as total")
      .first();

    // Active merchant count
    const merchantCount = await db("merchants")
      .join("users", "merchants.user_id", "users.id")
      .where("users.status", "ACTIVE")
      .count("merchants.id as cnt")
      .first();

    // Liquidity inbound (last 24h successful transactions)
    const inboundResult = await db("transactions")
      .where({ status: "SETTLED" })
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '24 hours'"))
      .sum("amount as total")
      .first();

    // Liquidity outbound (last 24h settlements)
    const outboundResult = await db("settlements")
      .where({ status: "COMPLETED" })
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '24 hours'"))
      .sum("net_amount as total")
      .first();

    // Security alerts (flagged transactions)
    const alertCount = await db("transactions")
      .whereIn("flag_level", ["MEDIUM", "HIGH"])
      .where("status", "!=", "REVERSED")
      .count("id as cnt")
      .first();

    // Recent transactions (last 10)
    const rawRecentTransactions = await db("transactions")
      .orderBy("created_at", "desc")
      .limit(10);
      
    const recentTransactions = rawRecentTransactions.map((tx: any) => ({
      ...tx,
      amount: tx.amount != null ? fromMinorUnits(tx.amount) : null,
      fee_amount: tx.fee_amount != null ? fromMinorUnits(tx.fee_amount) : null,
      net_amount: tx.net_amount != null ? fromMinorUnits(tx.net_amount) : null,
    }));

    // Graph data (last 12 days)
    const graphData = await db("transactions")
      .select(db.raw("DATE(created_at) as date"))
      .sum("amount as total")
      .where("status", "SETTLED")
      .groupByRaw("DATE(created_at)")
      .orderByRaw("DATE(created_at) DESC")
      .limit(12);
      
    // Fill in 12 items even if less data exists
    const liquidity_graph = Array(12).fill(0);
    graphData.forEach((row, i) => {
      liquidity_graph[11 - i] = fromMinorUnits(row.total || 0);
    });

    return Response.json({
      total_platform_volume: fromMinorUnits(volumeResult?.total || 0),
      active_merchants: Number(merchantCount?.cnt || 0),
      system_uptime: "99.99%",
      liquidity_inbound: fromMinorUnits(inboundResult?.total || 0),
      liquidity_outbound: fromMinorUnits(outboundResult?.total || 0),
      security_alerts: Number(alertCount?.cnt || 0),
      recent_transactions: recentTransactions,
      liquidity_graph: liquidity_graph,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
