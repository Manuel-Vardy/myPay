import { NextRequest } from "next/server";
import db from "@/lib/db";
import { processSettlement } from "@/lib/settlements/process";
import { getSettlementSchedule, payoutTimeToday } from "@/lib/settlements/schedule";
import { getMerchantFloatBalances } from "@/lib/settlements/balance";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Payouts trigger on whichever comes first: the float balance reaching
    // the platform threshold, or the daily payout time (once per day).
    const schedule = await getSettlementSchedule();
    const threshold =
      schedule.payout_threshold_minor != null
        ? BigInt(schedule.payout_threshold_minor)
        : null;
    const now = new Date();
    const payoutAt = payoutTimeToday(schedule.payout_time, now);

    // Find all merchants with a positive float balance
    const balances = await db("ledger_account_balances")
      .where({ account_type: "MERCHANT_FLOAT" })
      .where("balance", ">", 0);

    const processed = [];
    const skipped = [];
    const failed = [];

    for (const balanceRecord of balances) {
      const merchantId = balanceRecord.owner_id;
      const currency = balanceRecord.currency;
      const balance = BigInt(balanceRecord.balance);

      // Auto-settlement may only sweep the withdrawable slice: funds older
      // than 24h that aren't held by pending withdrawal requests.
      // processSettlement re-derives and enforces the same cap inside its
      // phase-1 lock; this pre-check just drives the schedule/threshold
      // decision and avoids pointless settlement attempts.
      const { withdrawable } = await getMerchantFloatBalances(merchantId, currency);
      if (withdrawable <= 0n) {
        skipped.push({ merchantId, reason: "No withdrawable balance (aging window / withdrawal holds)" });
        continue;
      }

      const thresholdHit = threshold !== null && withdrawable >= threshold;
      let scheduleDue = false;
      if (!thresholdHit && now >= payoutAt) {
        // Time-based payout runs once per day: skip if any settlement was
        // already created at/after today's payout time.
        const alreadyRan = await db("settlements")
          .where({ merchant_id: merchantId, currency })
          .where("created_at", ">=", payoutAt)
          .first("id");
        scheduleDue = !alreadyRan;
      }
      if (!thresholdHit && !scheduleDue) {
        skipped.push({ merchantId, reason: "Payout not due (schedule/threshold)" });
        continue;
      }

      // Find default mobile-wallet settlement account (v1 pays out via MoMo).
      // The UI writes MOBILE_WALLET; MOBILE_MONEY is a legacy enum value.
      const defaultAccount = await db("settlement_accounts")
        .where({ merchant_id: merchantId, is_default: true })
        .whereIn("account_type", ["MOBILE_WALLET", "MOBILE_MONEY"])
        .first();

      if (!defaultAccount) {
        skipped.push({ merchantId, reason: "No default mobile wallet account found" });
        await db("system_logs").insert({
          level: "WARN",
          source: "CRON_SETTLEMENTS",
          event_description: `Settlement skipped for merchant ${merchantId}: No default mobile wallet account`,
        });
        continue;
      }

      // Check if provider name is supported
      const provider = defaultAccount.provider_name.toLowerCase();
      if (!provider.includes("mtn") && !provider.includes("telecel") && !provider.includes("vodafone") && !provider.includes("at") && !provider.includes("airteltigo")) {
        skipped.push({ merchantId, reason: `Unsupported provider: ${defaultAccount.provider_name}` });
        await db("system_logs").insert({
          level: "WARN",
          source: "CRON_SETTLEMENTS",
          event_description: `Settlement skipped for merchant ${merchantId}: Unsupported provider ${defaultAccount.provider_name}`,
        });
        continue;
      }

      try {
        await processSettlement(merchantId, defaultAccount, balance, currency);
        processed.push({ merchantId });
      } catch (err) {
        console.error(`Failed to process settlement for merchant ${merchantId}:`, err);
        failed.push({ merchantId, error: err instanceof Error ? err.message : String(err) });
        await db("system_logs").insert({
          level: "ERROR",
          source: "CRON_SETTLEMENTS",
          event_description: `Settlement process crashed for merchant ${merchantId}: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    return Response.json({
      success: true,
      processed: processed.length,
      skipped: skipped.length,
      failed: failed.length,
      details: { processed, skipped, failed }
    });
  } catch (error) {
    console.error("Cron settlements error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
