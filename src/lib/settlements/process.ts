// Settlement processing — reserve-then-pay.
//
// Phase 1 (atomic): lock the merchant float, skip if a PENDING/PROCESSING
//   settlement already exists, charge the transfer fee, and move the net
//   amount float → SETTLEMENT_PENDING. The settlement row is inserted as
//   PROCESSING. After this commits, the funds are reserved: overlapping
//   runs and crashes can no longer double-pay.
// Phase 2: external transfer of exactly the reserved net amount, via the
//   payout provider that `active_momo_provider` resolves to.
// Phase 3:
//   - success            → settlement COMPLETED (net stays in
//                          SETTLEMENT_PENDING as the in-transit record)
//   - definitive decline → reserve returned to float, fee reversed and
//                          waived, settlement FAILED
//   - accepted, pending  → settlement stays PROCESSING with funds reserved;
//                          Paystack reports the outcome over its webhook and
//                          the reconciliation cron backstops it
//   - unknown outcome    → settlement left PROCESSING with funds reserved and
//                          an admin alert raised (the transfer may or may not
//                          have gone through)
//
// The last two look the same on the row and differ only in intent: PENDING is
// the expected asynchronous path, UNKNOWN means we lost track. Neither may
// return the reserve — only a definitive decline can.

import db from "@/lib/db";
import { chargeSettlementFee, ensureLedgerAccount } from "@/lib/fees";
import {
  getRecentPaymentCredits,
  getWithdrawalHoldTotal,
} from "@/lib/settlements/balance";
import { getSettlementSchedule } from "@/lib/settlements/schedule";
import { completeSettlement, failSettlement } from "@/lib/settlements/finalize";
import { getPayoutProvider } from "@/lib/payments";
import type { PayoutProvider, TransferResult } from "@/lib/payments";
import { resolveMomoNetwork } from "@/lib/payments/networks";
import { notifyAdmins } from "@/lib/admin-alerts";
import crypto from "crypto";
import { fromMinorUnits } from "@/lib/utils";

interface SettlementAccountRow {
  id: string;
  provider_name: string;
  account_number: string;
  account_name?: string | null;
  provider_metadata?: Record<string, unknown> | string | null;
}

export interface SettlementOptions {
  /** Settle only this amount (minor units) instead of the full float balance. */
  requestedAmount?: bigint;
  /** system_logs source label, e.g. MERCHANT_WITHDRAWAL. */
  source?: string;
  /**
   * Withdrawal request being paid out, if any. Its own hold is excluded from
   * the withdrawable computation so the request can consume the funds it
   * reserved.
   */
  withdrawalRequestId?: string;
  /**
   * Record the transfer fee as waived and charge nothing. Used when an
   * operator pays out by hand to cover for a rail failure and the platform
   * absorbs the cost rather than billing the merchant for our outage.
   */
  waiveFeeReason?: string;
  /**
   * Narration passed to the provider. For a manual payout this is the
   * operator's receipt number, and it becomes the settlement's provider ref.
   */
  reference?: string;
}

/** Outcome of a settlement attempt, as seen by callers. */
export type SettlementOutcome =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "UNKNOWN"
  | "SKIPPED";

function parseAccountMetadata(
  value: SettlementAccountRow["provider_metadata"]
): Record<string, unknown> | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
  return value;
}

export async function processSettlement(
  merchantId: string,
  account: SettlementAccountRow,
  balance: bigint,
  currency: string,
  /**
   * Payout adapter override. Defaults to whatever `active_momo_provider`
   * resolves to, so neither call site passes one — it stays the injectable
   * seam for exercising this function without touching a provider.
   */
  payoutProvider?: PayoutProvider,
  options: SettlementOptions = {}
): Promise<{ status: SettlementOutcome; reason?: string; settlementId?: string }> {
  const logSource = options.source ?? "CRON_SETTLEMENTS";

  if (balance <= 0n) {
    return { status: "SKIPPED", reason: "Non-positive balance" };
  }
  if (options.requestedAmount !== undefined && options.requestedAmount <= 0n) {
    return { status: "SKIPPED", reason: "Non-positive requested amount" };
  }

  // Resolve the destination telco before reserving anything: an account we
  // can't route is a skip, not a settlement stuck holding the merchant's
  // funds.
  const network = resolveMomoNetwork(account.provider_name);
  if (!network) {
    return {
      status: "SKIPPED",
      reason: `Unsupported payout destination: ${account.provider_name}`,
    };
  }

  const provider = payoutProvider ?? (await getPayoutProvider());

  // ---- Phase 1: reserve funds atomically ----
  const reservation = await db.transaction(async (trx) => {
    const merchantAccount = await trx("ledger_accounts")
      .where({
        owner_id: merchantId,
        account_type: "MERCHANT_FLOAT",
        currency,
      })
      .forUpdate()
      .first();

    if (!merchantAccount) {
      throw new Error(`Merchant float account not found for merchant ${merchantId}`);
    }

    // Duplicate guard: one in-flight settlement per merchant+currency.
    // A stale PROCESSING row (crash/unknown transfer outcome) intentionally
    // blocks new settlements until it is reconciled.
    const inFlight = await trx("settlements")
      .where({ merchant_id: merchantId, currency })
      .whereIn("status", ["PENDING", "PROCESSING"])
      .first("id", "settlement_id_display", "status");
    if (inFlight) {
      return {
        status: "SKIPPED" as const,
        reason: `In-flight settlement ${inFlight.settlement_id_display} (${inFlight.status}) exists`,
      };
    }

    // Re-read the balance inside the lock (same math as the balances view)
    const row = await trx("ledger_entries")
      .where({ account_id: merchantAccount.id })
      .select(
        trx.raw(`
          COALESCE(SUM(
            CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END
          ), 0) as sum
        `)
      )
      .first();
    const lockedBalance = BigInt(row?.sum ?? 0);

    if (lockedBalance <= 0n) {
      return { status: "SKIPPED" as const, reason: "Zero or negative balance after lock" };
    }

    // Settlements may only touch the withdrawable slice of the float:
    // balance minus payment credits younger than the configured aging window
    // (settlement:schedule → withdrawal_age_hours), minus amounts held by
    // other in-flight withdrawal requests.
    //
    // Exception: when paying out an approved withdrawal request, the aging
    // gate is NOT re-applied — it was enforced when the request was created,
    // and the request's hold has earmarked the funds since. Re-deriving the
    // window at approval time would count payments received just before
    // *approval* against a request made days earlier, blocking legitimate
    // payouts. Only the balance and other requests' holds cap it.
    const withdrawalHold = await getWithdrawalHoldTotal(
      trx,
      merchantId,
      currency,
      options.withdrawalRequestId
    );
    let recentCredits = 0n;
    if (!options.withdrawalRequestId) {
      const { withdrawal_age_hours } = await getSettlementSchedule();
      recentCredits = await getRecentPaymentCredits(
        trx,
        merchantAccount.id,
        withdrawal_age_hours
      );
    }
    const withdrawable = lockedBalance - recentCredits - withdrawalHold;

    if (withdrawable <= 0n) {
      return {
        status: "SKIPPED" as const,
        reason: "No withdrawable balance (funds still aging or held by withdrawal requests)",
      };
    }

    if (options.requestedAmount !== undefined && options.requestedAmount > withdrawable) {
      return {
        status: "SKIPPED" as const,
        reason: "Requested amount exceeds withdrawable balance",
      };
    }

    const grossAmount = options.requestedAmount ?? withdrawable;

    const lastSettlement = await trx("settlements")
      .where({ merchant_id: merchantId, currency })
      .orderBy("date_range_end", "desc")
      .first("date_range_end");

    const settlementIdDisplay = `STL-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const [settlement] = await trx("settlements")
      .insert({
        settlement_id_display: settlementIdDisplay,
        merchant_id: merchantId,
        gross_amount: grossAmount.toString(),
        fees: "0",
        net_amount: grossAmount.toString(),
        currency,
        status: "PROCESSING",
        date_range_start: lastSettlement?.date_range_end ?? merchantAccount.created_at,
        date_range_end: new Date(),
        transaction_count: 0,
        account_id: account.id,
        // Stamped now, not on success: the reconciler and the payout webhook
        // both need to know who holds this transfer even if the settlement
        // never reaches a terminal state.
        payout_provider: provider.name,
      })
      .returning("*");

    // Charge the transfer fee now (fee_ledger + DEBIT float / CREDIT PSP_FEE).
    // The transfer later sends exactly gross - actualFee, so paid == debited.
    const actualFee = await chargeSettlementFee(
      trx,
      settlement,
      "SETTLEMENT_TRANSFER",
      options.waiveFeeReason
    );
    const netAmount = grossAmount - actualFee;

    if (netAmount <= 0n) {
      // Fee swallows the whole balance — abort the reservation entirely.
      throw Object.assign(new Error("Net amount after fees is zero or negative"), {
        settlementSkip: true,
      });
    }

    // Reserve: move the net amount out of the float before paying.
    const pendingAccount = await ensureLedgerAccount(
      trx,
      null,
      "SETTLEMENT_PENDING",
      currency,
      `Settlement pending (${currency})`
    );

    const entryIdPrefix = `LE-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomUUID()
      .slice(0, 4)
      .toUpperCase()}`;

    await trx("ledger_entries").insert([
      {
        entry_id_display: `${entryIdPrefix}-SDR`,
        settlement_id: settlement.id,
        account_id: merchantAccount.id,
        entry_type: "DEBIT",
        amount: netAmount.toString(),
        currency,
        description: `Settlement reserve: ${settlement.settlement_id_display}`,
      },
      {
        entry_id_display: `${entryIdPrefix}-SCR`,
        settlement_id: settlement.id,
        account_id: pendingAccount.id,
        entry_type: "CREDIT",
        amount: netAmount.toString(),
        currency,
        description: `Settlement reserve: ${settlement.settlement_id_display}`,
      },
    ]);

    await trx("settlements").where({ id: settlement.id }).update({
      fees: actualFee.toString(),
      net_amount: netAmount.toString(),
      updated_at: new Date(),
    });

    return { status: "RESERVED" as const, settlement, netAmount, actualFee };
  }).catch((err) => {
    if (err?.settlementSkip) {
      return { status: "SKIPPED" as const, reason: err.message };
    }
    throw err;
  });

  if (reservation.status === "SKIPPED") {
    console.log(`Skipped settlement for merchant ${merchantId}: ${reservation.reason}`);
    return reservation;
  }

  const { settlement, netAmount, actualFee } = reservation;

  // ---- Phase 2: external transfer of the reserved amount ----
  let transferResult: TransferResult;
  try {
    transferResult = await provider.initiateTransfer({
      network,
      currency,
      amount: Number(netAmount),
      receiver: account.account_number,
      accountName: account.account_name ?? undefined,
      externalRef: settlement.id,
      reference: options.reference,
      accountMetadata: parseAccountMetadata(account.provider_metadata),
    });
  } catch (err) {
    // An adapter that throws tells us nothing about whether money moved.
    transferResult = {
      status: "UNKNOWN",
      message: err instanceof Error ? err.message : String(err),
      rawResponse: { error: String(err) },
    };
  }

  // Cache any handle the provider issued (e.g. a Paystack recipient code) so
  // the next payout to this account skips the setup call. Best-effort: never
  // let bookkeeping affect the payout outcome.
  if (transferResult.accountMetadataPatch) {
    await db("settlement_accounts")
      .where({ id: account.id })
      .update({
        provider_metadata: JSON.stringify({
          ...(parseAccountMetadata(account.provider_metadata) ?? {}),
          ...transferResult.accountMetadataPatch,
        }),
        updated_at: new Date(),
      })
      .catch(() => null);
  }

  const providerMetadata = {
    payout_initiated_at: new Date().toISOString(),
    payout_provider_ref: transferResult.providerRef ?? null,
    payout_provider_message: transferResult.message,
  };

  // ---- Phase 3: finalize ----
  if (transferResult.status === "SUCCESS") {
    await completeSettlement({
      settlementId: settlement.id,
      providerRef: transferResult.providerRef ?? null,
      source: logSource,
      providerMetadata,
    });
    return { status: "COMPLETED", settlementId: settlement.id };
  }

  if (transferResult.status === "FAILED") {
    await failSettlement({
      settlementId: settlement.id,
      reason: transferResult.message,
      source: logSource,
      providerMetadata,
    });
    return {
      status: "FAILED",
      settlementId: settlement.id,
      reason: transferResult.message,
    };
  }

  // Everything below leaves the settlement PROCESSING with the funds still
  // reserved. The in-flight guard in phase 1 then blocks further settlements
  // for this merchant until the payout resolves — which is correct: the money
  // is out of the float and may be in transit.
  await db("settlements")
    .where({ id: settlement.id })
    .update({
      bank_reference: transferResult.providerRef || null,
      provider_metadata: JSON.stringify(providerMetadata),
      updated_at: new Date(),
    });

  if (transferResult.status === "PENDING") {
    // The expected Paystack path, not a fault: the provider accepted the
    // transfer and reports the outcome over its webhook.
    await db("system_logs").insert({
      level: "INFO",
      source: logSource,
      event_description:
        `Settlement ${settlement.settlement_id_display} accepted by ${provider.name} and ` +
        `awaiting confirmation (${transferResult.message}). ` +
        `Net: ${fromMinorUnits(netAmount)} ${currency}, fee: ${fromMinorUnits(actualFee)} ${currency}`,
    });
    return {
      status: "PENDING",
      settlementId: settlement.id,
      reason: transferResult.message,
    };
  }

  // UNKNOWN / NOT_FOUND: we never learned the outcome. Hold the reserve and
  // get a human involved — the reconciler will keep re-checking meanwhile.
  await db("system_logs").insert({
    level: "ERROR",
    source: logSource,
    event_description:
      `Settlement ${settlement.settlement_id_display} outcome UNKNOWN via ${provider.name} ` +
      `(${transferResult.message}). Funds remain reserved — reconciliation required.`,
  });

  await notifyAdmins({
    category: "SYSTEM_ALERT",
    severity: "CRITICAL",
    title: "Payout outcome unknown",
    message:
      `Settlement ${settlement.settlement_id_display} (${fromMinorUnits(netAmount)} ${currency}) ` +
      `via ${provider.name} did not return a definitive outcome: ${transferResult.message}. ` +
      `Funds stay reserved and further payouts for this merchant are blocked until it resolves.`,
    dedupeKey: `payout-unknown:${settlement.id}`,
    metadata: { settlement_id: settlement.id, merchant_id: merchantId, provider: provider.name },
  }).catch(() => null);

  return {
    status: "UNKNOWN",
    settlementId: settlement.id,
    reason: transferResult.message,
  };
}
