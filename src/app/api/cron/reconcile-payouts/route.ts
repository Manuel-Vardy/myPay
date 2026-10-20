// POST /api/cron/reconcile-payouts — resolve settlements stuck in PROCESSING.
//
// A settlement sits in PROCESSING whenever the payout has left the merchant
// float but we have no terminal answer: Paystack accepted the transfer and
// hasn't called back yet, or a Moolre transfer died mid-flight and we never
// learned whether the money moved. Either way the merchant's funds are
// reserved and the in-flight guard in processSettlement blocks every further
// payout for them, so these cannot be left to accumulate.
//
// This is the payout twin of /api/cron/reconcile-momo, with one deliberate
// difference: a payout still PENDING at the provider is NEVER aged out into
// FAILED. An unanswered USSD prompt is safe to fail; a transfer that may
// already have reached the payee is not. Long-pending payouts alert a human.

import { NextRequest } from "next/server";
import db from "@/lib/db";
import { resolvePayoutProvider } from "@/lib/payments";
import { completeSettlement, failSettlement } from "@/lib/settlements/finalize";
import { notifyAdmins } from "@/lib/admin-alerts";
import { fromMinorUnits } from "@/lib/utils";
import { STALE_PAYOUT_HOURS } from "@/lib/settlements/stuck";

const DEFAULT_BATCH_LIMIT = 100;
const MAX_BATCH_LIMIT = 500;
// Don't touch settlements younger than this — a Paystack transfer normally
// resolves over its webhook within seconds to minutes.
const DEFAULT_GRACE_MINUTES = 10;
// If the provider still has no transfer under our reference after this long,
// it was never created and the reserve can safely go back.
const DEFAULT_NOT_FOUND_FAIL_HOURS = 24;
// A payout still pending at the provider after this long needs a human. We
// alert rather than fail: the money may be in transit. Shared with the admin
// settlements "Needs attention" filter so an alert can never point at a
// settlement the UI hides.
const DEFAULT_STALE_ALERT_HOURS = STALE_PAYOUT_HOURS;

interface StuckSettlement {
  id: string;
  settlement_id_display: string;
  merchant_id: string;
  net_amount: string;
  currency: string;
  bank_reference: string | null;
  payout_provider: string | null;
  created_at: string | Date;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_BATCH_LIMIT, 1),
    MAX_BATCH_LIMIT
  );
  const graceMinutes = Number(searchParams.get("grace")) || DEFAULT_GRACE_MINUTES;
  const notFoundFailHours =
    Number(searchParams.get("notFoundFailHours")) || DEFAULT_NOT_FOUND_FAIL_HOURS;
  const staleAlertHours =
    Number(searchParams.get("staleAlertHours")) || DEFAULT_STALE_ALERT_HOURS;

  try {
    const cutoff = new Date(Date.now() - graceMinutes * 60 * 1000);
    const notFoundCutoff = new Date(Date.now() - notFoundFailHours * 60 * 60 * 1000);
    const staleCutoff = new Date(Date.now() - staleAlertHours * 60 * 60 * 1000);

    // Newest first: a merchant can't settle again until their in-flight
    // payout clears, so the freshest block is the most urgent.
    // PROCESSING only. PENDING is the column default and covers rows that
    // never reserved funds (seed data, pre-reserve legacy settlements) —
    // nothing to poll and nothing to return.
    const stuck: StuckSettlement[] = await db("settlements")
      .where({ status: "PROCESSING" })
      .where("created_at", "<=", cutoff)
      .orderBy("created_at", "desc")
      .limit(limit);

    let completed = 0;
    let failed = 0;
    let pending = 0;
    let unknown = 0;
    let unroutable = 0;
    let alerted = 0;
    const errors: { settlementId: string; error: string }[] = [];

    for (const settlement of stuck) {
      try {
        const provider = resolvePayoutProvider(settlement.payout_provider);

        // Settlements created before payouts recorded a provider, or paid out
        // by an adapter that has since lost its payout capability. Nothing to
        // poll — surface them rather than silently skipping.
        if (!provider) {
          unroutable++;
          if (new Date(settlement.created_at) <= staleCutoff) {
            const raised = await alertStale(
              settlement,
              "unresolvable: no usable payout provider recorded on the settlement"
            );
            if (raised) alerted++;
          }
          continue;
        }

        const result = await provider.checkTransferStatus({
          externalRef: settlement.id,
          providerRef: settlement.bank_reference || undefined,
        });

        if (result.status === "SUCCESS") {
          await completeSettlement({
            settlementId: settlement.id,
            providerRef: result.providerRef || settlement.bank_reference || null,
            source: "CRON_RECONCILE_PAYOUTS",
            providerMetadata: { reconciled_message: result.message },
          });
          completed++;
        } else if (result.status === "FAILED") {
          await failSettlement({
            settlementId: settlement.id,
            reason: result.message || "Transfer declined at provider",
            source: "CRON_RECONCILE_PAYOUTS",
            providerMetadata: { reconciled_message: result.message },
          });
          failed++;
        } else if (
          result.status === "NOT_FOUND" &&
          new Date(settlement.created_at) <= notFoundCutoff
        ) {
          // The provider never created a transfer under our reference and has
          // had a full day to disagree. Return the reserve.
          await failSettlement({
            settlementId: settlement.id,
            reason: `No transfer at ${provider.name} after ${notFoundFailHours}h — the payout was never created`,
            source: "CRON_RECONCILE_PAYOUTS",
            providerMetadata: { reconciled_message: result.message },
          });
          failed++;
        } else {
          if (result.status === "PENDING") pending++;
          else unknown++;

          if (new Date(settlement.created_at) <= staleCutoff) {
            const raised = await alertStale(
              settlement,
              `still ${result.status} at ${provider.name}: ${result.message}`
            );
            if (raised) alerted++;
          }
        }
      } catch (err) {
        errors.push({
          settlementId: settlement.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return Response.json({
      success: true,
      checked: stuck.length,
      completed,
      failed,
      pending,
      unknown,
      unroutable,
      alerted,
      errors,
    });
  } catch (error) {
    console.error("Payout reconciliation error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * A payout in flight for days is either a provider problem or a reference we
 * can no longer resolve. Both need a person, and neither may be settled by
 * reversing the ledger from a cron.
 */
async function alertStale(settlement: StuckSettlement, detail: string): Promise<boolean> {
  const raised = await notifyAdmins({
    category: "SYSTEM_ALERT",
    severity: "CRITICAL",
    title: "Payout stuck in flight",
    message:
      `Settlement ${settlement.settlement_id_display} ` +
      `(${fromMinorUnits(settlement.net_amount)} ${settlement.currency}, ` +
      `${settlement.payout_provider ?? "unknown provider"}) is ${detail}. ` +
      `Funds stay reserved and further payouts for this merchant are blocked ` +
      `until someone confirms with the provider whether the money moved.`,
    // One alert per settlement per dedupe window, not one per cron tick.
    dedupeKey: `payout-stuck:${settlement.id}`,
    metadata: { settlement_id: settlement.id, merchant_id: settlement.merchant_id },
  }).catch(() => 0);

  return raised > 0;
}
