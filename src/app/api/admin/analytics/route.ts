// GET /api/admin/analytics — regional performance and platform-wide analytics
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30d";
    const periodDays = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const dateFilter = db.raw(`NOW() - INTERVAL '${periodDays} days'`);

    // Regional performance: volume by merchant region
    const regionalVolume = await db("transactions")
      .join("merchants", "transactions.merchant_id", "merchants.id")
      .where("transactions.status", "SUCCESS")
      .where("transactions.created_at", ">=", dateFilter)
      .whereNotNull("merchants.region")
      .select("merchants.region")
      .sum("transactions.amount as total_volume")
      .count("transactions.id as tx_count")
      .groupBy("merchants.region")
      .orderBy("total_volume", "desc");

    const totalVolume = (regionalVolume as any[]).reduce((s: number, r: any) => s + Number(r.total_volume), 0);

    const regional_performance = (regionalVolume as any[]).map((r: any) => ({
      region: r.region,
      volume: Number(r.total_volume),
      tx_count: Number(r.tx_count),
      percentage: totalVolume > 0 ? Math.round((Number(r.total_volume) / totalVolume) * 100) : 0,
    }));

    return Response.json({ regional_performance, period });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
