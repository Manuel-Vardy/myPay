// Terminal transitions for a reserved settlement.
//
// `processSettlement` reserves funds (float → SETTLEMENT_PENDING) and then
// asks a provider to move the money. Three things can finish that payout:
// the transfer response itself, a provider webhook, or the reconciliation
// cron. All three land here, so the ledger movements — especially the
// reserve return and fee reversal on a decline — exist in exactly one place.
//
// Both functions row-lock the settlement and return whether *this* call
// performed the transition, mirroring `settleMomoPayment`: a false means
// someone else got there first, not a failure.

import crypto from "crypto";
import db from "@/lib/db";
import type { Knex } from "knex";
import { fromMinorUnits } from "@/lib/utils";
import { enqueueMerchantWebhook } from "@/lib/webhooks/enqueue";
import { attemptDelivery } from "@/lib/webhooks/deliver";

/**
 * The only status these transitions may act on.
 *
 * Deliberately not PENDING. PENDING is the column default and covers rows
 * that never went through `processSettlement` — seed data and pre-reserve
 * legacy settlements. Those have no funds sitting in SETTLEMENT_PENDING, so
 * "returning the reserve" for one would credit a merchant float out of thin
 * air. PROCESSING is the state that means money is actually reserved.
 */
const RESERVED_STATUS = "PROCESSING";

function entryIdPrefix(): string {
  return `LE-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomUUID()
    .slice(0, 4)
    .toUpperCase()}`;
}

async function payoutWebhookData(trx: Knex.Transaction, settlement: {
  settlement_id_display: string;
  net_amount: string;
  fees: string;
  currency: string;
  account_id: string | null;
}) {
  const account = settlement.account_id
    ? await trx("settlement_accounts").where({ id: settlement.account_id }).first("provider_name")
    : null;

  return {
    settlement_id_display: settlement.settlement_id_display,
    amount: fromMinorUnits(settlement.net_amount),
    fee: fromMinorUnits(settlement.fees),
    currency: settlement.currency,
    provider: account?.provider_name ?? null,
  };
}

/**
 * Merge a patch into `settlements.provider_metadata` without clobbering what
 * an earlier step wrote.
 */
export function mergeProviderMetadata(
  existing: unknown,
  patch: Record<string, unknown>
): Record<string, unknown> {
  const base =
    typeof existing === "string"
      ? (JSON.parse(existing || "{}") as Record<string, unknown>)
      : ((existing as Record<string, unknown>) ?? {});
  return { ...base, ...patch };
}

interface CompleteParams {
  settlementId: string;
  providerRef?: string | null;
  /** system_logs source label, e.g. WEBHOOK_PAYSTACK. */
  source: string;
  providerMetadata?: Record<string, unknown>;
}

/**
 * The transfer landed. The net amount stays in SETTLEMENT_PENDING — that
 * account is the in-transit record, not a holding pen, so there is no further
 * ledger movement on success.
 */
export async function completeSettlement(params: CompleteParams): Promise<boolean> {
  const { settlementId, providerRef, source, providerMetadata } = params;
  let webhookEventId: string | null = null;

  const completed = await db.transaction(async (trx) => {
    const settlement = await trx("settlements")
      .where({ id: settlementId })
      .forUpdate()
      .first();

    if (!settlement) throw new Error(`Settlement ${settlementId} not found`);

    // The transfer response, the webhook and the cron all race each other.
    if (settlement.status !== RESERVED_STATUS) return false;

    await trx("settlements")
      .where({ id: settlementId })
      .update({
        status: "COMPLETED",
        bank_reference: providerRef || settlement.bank_reference || null,
        provider_metadata: JSON.stringify(
          mergeProviderMetadata(settlement.provider_metadata, {
            ...providerMetadata,
            completed_at: new Date().toISOString(),
            completed_by_source: source,
          })
        ),
        updated_at: new Date(),
      });

    webhookEventId = await enqueueMerchantWebhook(trx, {
      merchantId: settlement.merchant_id,
      eventType: "payout.success",
      data: { ...(await payoutWebhookData(trx, settlement)), status: "COMPLETED" },
    });

    await trx("system_logs").insert({
      level: "INFO",
      source,
      event_description:
        `Settlement ${settlement.settlement_id_display} COMPLETED via ` +
        `${settlement.payout_provider ?? "unknown provider"}. ` +
        `Net: ${fromMinorUnits(settlement.net_amount)} ${settlement.currency}, ` +
        `fee: ${fromMinorUnits(settlement.fees)} ${settlement.currency}` +
        (providerRef ? ` | provider_ref=${providerRef}` : ""),
    });

    return true;
  });

  if (webhookEventId) attemptDelivery(webhookEventId).catch(() => null);
  return completed;
}

interface FailParams {
  settlementId: string;
  reason: string;
  /** system_logs source label. */
  source: string;
  providerMetadata?: Record<string, unknown>;
}

/**
 * The provider definitively declined. Return the reserve to the merchant
 * float and reverse the transfer fee.
 *
 * Only ever call this on a *definitive* decline. An unknown outcome must
 * leave the reserve alone — the money may already be with the payee, and
 * crediting the float again would pay them twice.
 */
export async function failSettlement(params: FailParams): Promise<boolean> {
  const { settlementId, reason, source, providerMetadata } = params;
  let webhookEventId: string | null = null;

  const failed = await db.transaction(async (trx) => {
    const settlement = await trx("settlements")
      .where({ id: settlementId })
      .forUpdate()
      .first();

    if (!settlement) throw new Error(`Settlement ${settlementId} not found`);
    if (settlement.status !== RESERVED_STATUS) return false;

    const { merchant_id: merchantId, currency } = settlement;
    const netAmount = BigInt(String(settlement.net_amount));
    const actualFee = BigInt(String(settlement.fees));

    const merchantAccount = await trx("ledger_accounts")
      .where({ owner_id: merchantId, account_type: "MERCHANT_FLOAT", currency })
      .first();
    const pendingAccount = await trx("ledger_accounts")
      .where({ owner_id: null, account_type: "SETTLEMENT_PENDING", currency })
      .first();

    const prefix = entryIdPrefix();

    await trx("ledger_entries").insert([
      {
        entry_id_display: `${prefix}-RDR`,
        settlement_id: settlement.id,
        account_id: pendingAccount.id,
        entry_type: "DEBIT",
        amount: netAmount.toString(),
        currency,
        description: `Settlement reserve returned (transfer declined): ${settlement.settlement_id_display}`,
      },
      {
        entry_id_display: `${prefix}-RCR`,
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
          entry_id_display: `${prefix}-WDR`,
          settlement_id: settlement.id,
          account_id: feeAccount.id,
          entry_type: "DEBIT",
          amount: actualFee.toString(),
          currency,
          description: `Settlement fee reversed (transfer declined): ${settlement.settlement_id_display}`,
        },
        {
          entry_id_display: `${prefix}-WCR`,
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

    await trx("settlements")
      .where({ id: settlement.id })
      .update({
        status: "FAILED",
        failure_reason: reason,
        provider_metadata: JSON.stringify(
          mergeProviderMetadata(settlement.provider_metadata, {
            ...providerMetadata,
            failed_at: new Date().toISOString(),
            failed_by_source: source,
          })
        ),
        updated_at: new Date(),
      });

    // A withdrawal request is marked APPROVED as soon as its payout is
    // accepted, because with Paystack the outcome arrives much later. If the
    // transfer then declines, the request has to follow the money back.
    await trx("withdrawal_requests")
      .where({ settlement_id: settlement.id })
      .whereNot("status", "FAILED")
      .update({
        status: "FAILED",
        failure_reason: reason,
        updated_at: new Date(),
      });

    webhookEventId = await enqueueMerchantWebhook(trx, {
      merchantId,
      eventType: "payout.failed",
      data: {
        ...(await payoutWebhookData(trx, settlement)),
        status: "FAILED",
        failure_reason: reason,
      },
    });

    await trx("system_logs").insert({
      level: "ERROR",
      source,
      event_description:
        `Settlement ${settlement.settlement_id_display} FAILED via ` +
        `${settlement.payout_provider ?? "unknown provider"}: ${reason}. ` +
        `Reserve and fee returned to merchant float.`,
    });

    return true;
  });

  if (webhookEventId) attemptDelivery(webhookEventId).catch(() => null);
  return failed;
}
