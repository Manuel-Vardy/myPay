// GET /api/merchant/transactions — paginated transaction list for a merchant
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(50, Math.max(1, Number(searchParams.get("per_page") || 20)));
    const status = searchParams.get("status");
    const currency = searchParams.get("currency");
    const method = searchParams.get("method");
    const search = searchParams.get("search");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");
    const date_range = searchParams.get("dateRange");//7,30,90
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant_id = guard.merchant.id;

    let query = db("transactions").where({ merchant_id });

    if (status) query = query.where("status", status);
    if (currency) {
      if (currency === "FIAT") {
        query = query.whereIn("currency", ["GHS", "USD", "EUR", "NGN"]);
      } else if (currency === "STABLECOIN") {
        query = query.whereIn("currency", ["USDC", "USDT", "DAI", "BUSD"]);
      } else if (currency === "CRYPTO") {
        query = query.whereNotIn("currency", ["GHS", "USD", "EUR", "NGN", "USDC", "USDT", "DAI", "BUSD"]);
      } else {
        query = query.where("currency", currency);
      }
    }
    if (method) query = query.where("method", method);
    if (date_range) {
      const days = parseInt(date_range);
      if (!isNaN(days)) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.where("created_at", ">=", dateLimit.toISOString());
      }
    }
    if (date_from) query = query.where("created_at", ">=", date_from);
    if (date_to) query = query.where("created_at", "<=", date_to);
    if (search) {
      query = query.where(function () {
        this.where("tx_id_display", "ilike", `%${search}%`).orWhere(
          "payer_email",
          "ilike",
          `%${search}%`
        );
      });
    }

    const countQuery = query.clone().count("id as cnt").first();
    const total = Number((await countQuery)?.cnt || 0);

    // Global Stats Aggregations
    const statsQuery = query.clone()
      .select('status')
      .sum('amount as total_amount')
      .count('id as count')
      .groupBy('status');
    const statusStats = await statsQuery;

    let totalVolume = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    
    statusStats.forEach(stat => {
      totalVolume += Number(stat.total_amount || 0);
      const count = Number(stat.count || 0);
      if (stat.status === 'SETTLED') completedCount += count;
      else if (stat.status === 'FAILED') failedCount += count;
      else pendingCount += count; // INITIATED, PENDING, PROCESSING
    });

    // Method Mix Aggregation
    const methodsQuery = query.clone()
      .select('method')
      .count('id as count')
      .groupBy('method')
      .orderBy('count', 'desc');
    const methodMixRows = await methodsQuery;

    const methodMix = methodMixRows.map(row => {
      const count = Number(row.count);
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      const methodStr = String(row.method);
      let color = "bg-gray-500";
      if (methodStr.includes("MOBILE")) color = "bg-[color:var(--trite-lime-strong)]";
      else if (methodStr.includes("CARD")) color = "bg-blue-500";
      else if (methodStr.includes("BANK")) color = "bg-purple-500";
      else if (methodStr.includes("CRYPTO")) color = "bg-orange-500";
      else if (methodStr.includes("USDC") || methodStr.includes("USDT")) color = "bg-green-500";
      
      return { name: methodStr, count, percent, color };
    });

    // Calculate Volume Change (Last 24h vs Previous 24h)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const last24hResult = await db("transactions")
      .where({ merchant_id })
      .where("created_at", ">=", oneDayAgo)
      .sum("amount as total_amount")
      .first();
    const previous24hResult = await db("transactions")
      .where({ merchant_id })
      .where("created_at", ">=", twoDaysAgo)
      .where("created_at", "<", oneDayAgo)
      .sum("amount as total_amount")
      .first();

    const last24hVol = Number(last24hResult?.total_amount || 0);
    const prev24hVol = Number(previous24hResult?.total_amount || 0);

    let volumeChangePercentage = 0;
    if (prev24hVol > 0) {
      volumeChangePercentage = ((last24hVol - prev24hVol) / prev24hVol) * 100;
    } else if (last24hVol > 0) {
      volumeChangePercentage = 100; // if prev was 0 and now has volume, 100% increase
    }

    const transactions = await query
      .orderBy("created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);
      
    const formattedTransactions = transactions.map((tx: any) => ({
      ...tx,
      amount: fromMinorUnits(tx.amount)
    }));

    return Response.json({
      data: formattedTransactions,
      global_stats: {
        total_volume: fromMinorUnits(totalVolume),
        completed_count: completedCount,
        pending_count: pendingCount,
        failed_count: failedCount,
        volume_change_percentage_24h: Number(volumeChangePercentage.toFixed(1)),
        method_mix: methodMix
      },
      pagination: { page, per_page, total, total_pages: Math.ceil(total / per_page) },
    });
  } catch (error) {
    console.error("Merchant transactions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
