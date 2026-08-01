// Settlement processing — reserve-then-pay.
//
// Phase 1 (atomic): lock the merchant float, skip if a PENDING/PROCESSING
//   settlement already exists, charge the transfer fee, and move the net
//   amount float → SETTLEMENT_PENDING. The settlement row is inserted as
//   PROCESSING. After this commits, the funds are reserved: overlapping
//   runs and crashes can no longer double-pay.
// Phase 2: external Moolre transfer of exactly the reserved net amount.
// Phase 3 (atomic):
//   - success            → settlement COMPLETED (net stays in
//                          SETTLEMENT_PENDING as the in-transit record)
//   - definitive decline → reserve returned to float, fee reversed and
//                          waived, settlement FAILED
//   - unknown outcome    → settlement left PROCESSING with funds reserved;
//                          flagged for manual reconciliation (the transfer
//                          may or may not have gone through)

import db from "@/lib/db";
import { chargeSettlementFee, ensureLedgerAccount } from "@/lib/fees";
import {
  getRecentPaymentCredits,
  getWithdrawalHoldTotal,
} from "@/lib/settlements/balance";
import { getSettlementSchedule } from "@/lib/settlements/schedule";
import { MoolreProvider } from "@/lib/payments/moolre";
import crypto from "crypto";
import { fromMinorUnits } from "@/lib/utils";
import { enqueueMerchantWebhook } from "@/lib/webhooks/enqueue";
import { attemptDelivery } from "@/lib/webhooks/deliver";

export interface TransferResult {
  success: boolean;
  message: string;
  providerRef?: string;
  rawResponse: { error?: unknown } & Record<string, unknown>;
}

export type TransferFn = (params: {
  providerName: string;
  currency: string;
  amount: number; // minor units
  receiver: string;
  externalRef: string;
}) => Promise<TransferResult>;

const moolreTransfer: TransferFn = (params) =>
  new MoolreProvider().initiateTransfer(params);

interface SettlementAccountRow {
  id: string;
  provider_name: string;
  account_number: string;
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
}

export async function processSettlement(
  merchantId: string,
  account: SettlementAccountRow,
  balance: bigint,
  currency: string,
  transfer: TransferFn = moolreTransfer,
  options: SettlementOptions = {}
): Promise<{ status: string; reason?: string; settlementId?: string }> {
  const logSource = options.source ?? "CRON_SETTLEMENTS";

  if (balance <= 0n) {
    return { status: "SKIPPED", reason: "Non-positive balance" };
  }
  if (options.requestedAmount !== undefined && options.requestedAmount <= 0n) {
    return { status: "SKIPPED", reason: "Non-positive requested amount" };
  }

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
      })
      .returning("*");

    // Charge the transfer fee now (fee_ledger + DEBIT float / CREDIT PSP_FEE).
    // The transfer later sends exactly gross - actualFee, so paid == debited.
    const actualFee = await chargeSettlementFee(trx, settlement, "SETTLEMENT_TRANSFER");
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
    transferResult = await transfer({
      providerName: account.provider_name,
      currency,
      amount: Number(netAmount),
      receiver: account.account_number,
      externalRef: settlement.id,
    });
  } catch (err) {
    transferResult = {
      success: false,
      message: err instanceof Error ? err.message : String(err),
      rawResponse: { error: String(err) },
    };
  }

  // A response without provider fields means the outcome is UNKNOWN (network
  // error) — the transfer may have gone through. Never reverse in that case.
  const definitiveDecline =
    !transferResult.success && transferResult.rawResponse?.error === undefined;

  // ---- Phase 3: finalize ----
  let webhookEventId: string | null = null;
  const payoutWebhookData = {
    settlement_id_display: settlement.settlement_id_display,
    amount: fromMinorUnits(netAmount),
    fee: fromMinorUnits(actualFee),
    currency,
    provider: account.provider_name,
  };

  const result = await db.transaction(async (trx) => {
    if (transferResult.success) {
      await trx("settlements").where({ id: settlement.id }).update({
        status: "COMPLETED",
        bank_reference: transferResult.providerRef || null,
        updated_at: new Date(),
      });

      webhookEventId = await enqueueMerchantWebhook(trx, {
        merchantId,
        eventType: "payout.success",
        data: { ...payoutWebhookData, status: "COMPLETED" },
      });

      await trx("system_logs").insert({
        level: "INFO",
        source: logSource,
        event_description:
          `Settlement ${settlement.settlement_id_display} COMPLETED via ${account.provider_name}. ` +
          `Net: ${fromMinorUnits(netAmount)} ${currency}, fee: ${fromMinorUnits(actualFee)} ${currency}`,
      });

      return { status: "COMPLETED", settlementId: settlement.id };
    }

    if (!definitiveDecline) {
      // Unknown outcome: keep funds reserved and the row PROCESSING so no
      // further settlement can run for this merchant until reconciled.
      await trx("system_logs").insert({
        level: "ERROR",
        source: logSource,
        event_description:
          `Settlement ${settlement.settlement_id_display} outcome UNKNOWN ` +
          `(${transferResult.message}). Funds remain reserved — manual reconciliation required.`,
      });
      return { status: "UNKNOWN", settlementId: settlement.id, reason: transferResult.message };
    }

    // Definitive provider decline: return the reserve and reverse the fee.
    const merchantAccount = await trx("ledger_accounts")
      .where({ owner_id: merchantId, account_type: "MERCHANT_FLOAT", currency })
      .first();
    const pendingAccount = await trx("ledger_accounts")
      .where({ owner_id: null, account_type: "SETTLEMENT_PENDING", currency })
      .first();

    const entryIdPrefix = `LE-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomUUID()
      .slice(0, 4)
      .toUpperCase()}`;

    await trx("ledger_entries").insert([
      {
        entry_id_display: `${entryIdPrefix}-RDR`,
        settlement_id: settlement.id,
        account_id: pendingAccount.id,
        entry_type: "DEBIT",
        amount: netAmount.toString(),
        currency,
        description: `Settlement reserve returned (transfer declined): ${settlement.settlement_id_display}`,
      },
      {
        entry_id_display: `${entryIdPrefix}-RCR`,
        settlement_id: settlement.id,
        account_id: merchantAccount.id,
        entry_type: "CREDIT",
        amount: netAmount.toString(),
        currency,
        description: `Settlement reserve returned (transfer declined): ${settlement.settlement_id_display}`,
      },
    ]);

    if (actualFee > 0n) {
      const feeAccount = await trx("ledger_accounts")
        .where({ owner_id: null, account_type: "PSP_FEE", currency })
        .first();

      await trx("ledger_entries").insert([
        {
          entry_id_display: `${entryIdPrefix}-WDR`,
          settlement_id: settlement.id,
          account_id: feeAccount.id,
          entry_type: "DEBIT",
          amount: actualFee.toString(),
          currency,
          description: `Settlement fee reversed (transfer declined): ${settlement.settlement_id_display}`,
        },
        {
          entry_id_display: `${entryIdPrefix}-WCR`,
          settlement_id: settlement.id,
          account_id: merchantAccount.id,
          entry_type: "CREDIT",
          amount: actualFee.toString(),
          currency,
          description: `Settlement fee reversed (transfer declined): ${settlement.settlement_id_display}`,
        },
      ]);

      // Waiver semantics per the fee ledger design: the row stays, flagged.
      await trx("fee_ledger").where({ settlement_id: settlement.id }).update({
        is_waived: true,
        waiver_reason: "Settlement transfer declined by provider",
      });
    }

    await trx("settlements").where({ id: settlement.id }).update({
      status: "FAILED",
      failure_reason: transferResult.message,
      updated_at: new Date(),
    });

    webhookEventId = await enqueueMerchantWebhook(trx, {
      merchantId,
      eventType: "payout.failed",
      data: {
        ...payoutWebhookData,
        status: "FAILED",
        failure_reason: transferResult.message,
      },
    });

    await trx("system_logs").insert({
      level: "ERROR",
      source: logSource,
      event_description:
        `Settlement ${settlement.settlement_id_display} FAILED via ${account.provider_name}: ` +
        `${transferResult.message}. Reserve and fee returned to merchant float.`,
    });

    return { status: "FAILED", settlementId: settlement.id, reason: transferResult.message };
  });

  if (webhookEventId) attemptDelivery(webhookEventId).catch(() => null);
  return result;
}
