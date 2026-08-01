// GET /api/merchant/dashboard — merchant balance, volume, and gateway health
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";
import { getSettlementSchedule } from "@/lib/settlements/schedule";
import { getMerchantFloatBalances } from "@/lib/settlements/balance";
import { quoteFee } from "@/lib/fees";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

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

    // Fetch balances from the ledger: the full float plus the withdrawable
    // slice (payments older than 24h, minus in-flight withdrawal holds).
    const floatBalances = await getMerchantFloatBalances(merchant_id, "GHS");
    const available_balance = Number(floatBalances.total);
    const withdrawable_balance = floatBalances.withdrawable;

    // Daily volume (today's successful transactions)
    const dailyVolume = await db("transactions")
      .where({ merchant_id, status: "SETTLED" }) // changed from SUCCESS to SETTLED based on new enums
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
      .where({ merchant_id, status: "SETTLED" }) // status update
      .whereNotNull("crypto_amount") // column update
      .select("crypto_currency") // column update
      .sum("crypto_amount as total")
      .groupBy("crypto_currency");

    const stablecoin_holdings: Record<string, number> = { USDC: 0, USDT: 0, Total: 0 };
    stablecoinSummary.forEach((row: any) => {
      const cur = row.crypto_currency || "USDT";
      const val = Number(row.total || 0);
      stablecoin_holdings[cur] = val;
      stablecoin_holdings.Total += val;
    });

    // Revenue Chart data (Success transactions volume)
    // Day (Last 24h in 4h blocks)
    const dayData = await db("transactions")
      .where({ merchant_id, status: "SETTLED" })
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '24 hours'"))
      .select(db.raw("FLOOR(EXTRACT(HOUR FROM created_at) / 4) * 4 as block"))
      .sum("amount as value")
      .groupBy("block")
      .orderBy("block");

    const revenue_chart = {
      day: [0, 4, 8, 12, 16, 20].map(h => {
        const match = dayData.find((d: any) => Number(d.block) === h);
        return { label: `${h.toString().padStart(2, '0')}:00`, value: fromMinorUnits(match?.value || 0) };
      }),
      week: [] as { label: string, value: number }[],
      month: [] as { label: string, value: number }[],
      year: [] as { label: string, value: number }[],
    };

    // Week (Last 7 days)
    const weekData = await db("transactions")
      .where({ merchant_id, status: "SETTLED" })
      .where("created_at", ">=", db.raw("CURRENT_DATE - INTERVAL '6 days'"))
      .select(db.raw("TO_CHAR(created_at, 'Dy') as label"))
      .select(db.raw("DATE_TRUNC('day', created_at) as day_date"))
      .sum("amount as value")
      .groupBy("label", "day_date")
      .orderBy("day_date");
    revenue_chart.week = weekData.map((d: any) => ({ label: d.label, value: fromMinorUnits(d.value) }));

    // Month (Last 4 weeks)
    const monthData = await db("transactions")
      .where({ merchant_id, status: "SETTLED" })
      .where("created_at", ">=", db.raw("CURRENT_DATE - INTERVAL '28 days'"))
      .select(db.raw("FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - created_at)) / 7) as week_idx"))
      .sum("amount as value")
      .groupBy("week_idx")
      .orderBy("week_idx", "desc");
    
    revenue_chart.month = [3, 2, 1, 0].map(idx => {
      const match = monthData.find((d: any) => Number(d.week_idx) === idx);
      return { label: `Week ${4-idx}`, value: fromMinorUnits(match?.value || 0) };
    });

    // Year (Last 12 months)
    const yearData = await db("transactions")
      .where({ merchant_id, status: "SETTLED" })
      .where("created_at", ">=", db.raw("DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'"))
      .select(db.raw("TO_CHAR(created_at, 'Mon') as label"))
      .select(db.raw("DATE_TRUNC('month', created_at) as month_date"))
      .sum("amount as value")
      .groupBy("label", "month_date")
      .orderBy("month_date");
    revenue_chart.year = yearData.map((d: any) => ({ label: d.label, value: fromMinorUnits(d.value) }));

    // Default settlement account (fall back to oldest if none flagged default)
    const defaultAccount = await db("settlement_accounts")
      .where({ merchant_id })
      .orderBy("is_default", "desc")
      .orderBy("created_at", "asc")
      .first();

    const schedule = await getSettlementSchedule();

    // Expected next payout: withdrawable balance minus the quoted
    // SETTLEMENT_TRANSFER fee — mirrors the net amount processSettlement will
    // actually transfer (settlements only touch withdrawable funds).
    let expectedPayout = 0n;
    if (withdrawable_balance > 0n) {
      const feeQuote = await quoteFee(
        "SETTLEMENT_TRANSFER",
        { merchantId: merchant_id, merchantTier: merchant.tier, currency: "GHS" },
        withdrawable_balance
      );
      const net = withdrawable_balance - feeQuote;
      expectedPayout = net > 0n ? net : 0n;
    }

    return Response.json({
      available_balance: fromMinorUnits(available_balance),
      withdrawable_balance: fromMinorUnits(withdrawable_balance),
      pending_withdrawal_total: fromMinorUnits(floatBalances.withdrawalHold),
      expected_payout: fromMinorUnits(expectedPayout),
      balance_currency: "GHS", // dropped from DB, we default to GHS
      daily_volume: fromMinorUnits(dailyVolume?.total || 0),
      total_transactions: Number(txCount?.cnt || 0),
      pending_settlements: fromMinorUnits(pendingSettlements?.total || 0),
      gateway_health,
      stablecoin_holdings,
      revenue_chart,
      merchant: {
        business_name: merchant.business_name,
        merchant_display_id: merchant.merchant_display_id,
        tier: merchant.tier,
        region: merchant.region,
      },
      settlement_schedule: {
        payout_time: schedule.payout_time,
        payout_threshold:
          schedule.payout_threshold_minor != null
            ? fromMinorUnits(schedule.payout_threshold_minor)
            : null,
        withdrawal_age_hours: schedule.withdrawal_age_hours,
      },
      settlement_account: defaultAccount ? {
        id: defaultAccount.id,
        provider_name: defaultAccount.provider_name,
        account_number: `****${String(defaultAccount.account_number).slice(-4)}`,
        account_type: defaultAccount.account_type,
        account_name: defaultAccount.account_name,
      } : null,
    });
  } catch (error) {
    console.error("Merchant dashboard error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
