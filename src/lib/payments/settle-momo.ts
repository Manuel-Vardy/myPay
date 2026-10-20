import crypto from "node:crypto";
import db from "@/lib/db";
import { chargeTransactionFee, ensureLedgerAccount } from "@/lib/fees";
import { recordTransactionEvent } from "@/lib/payments/tx-events";
import { tryLinkTransactionCustomer } from "@/lib/payments/customers";
import { enqueueMerchantWebhook } from "@/lib/webhooks/enqueue";
import { buildPaymentWebhookData } from "@/lib/webhooks/payloads";
import { attemptDelivery } from "@/lib/webhooks/deliver";
import { notifyTransactionSettled } from "@/lib/notifications";

interface SettleMomoParams {
  transactionId: string;
  providerRef: string | null;
  providerName: string;
  source: string;
  thirdPartyRef?: string | null;
}

/**
 * Settle a mobile money payment.
 *
 * Returns true when this call is the one that performed the transition, false
 * when it found the transaction already settled. Callers must not treat a
 * false as a failure — it means someone else got there first — but anything
 * that should happen once per payment (notifying the payer, say) has to be
 * gated on it, because every settlement path can race every other one.
 */
export async function settleMomoPayment(params: SettleMomoParams): Promise<boolean> {
  const { transactionId, providerRef, providerName, source, thirdPartyRef } = params;
  let webhookEventId: string | null = null;

  const settled = await db.transaction(async (trx) => {
    // 1. Fetch the transaction to ensure we have its current state.
    // Row lock: the status poll, provider webhook, and reconciliation cron
    // can all try to settle the same transaction — the lock makes the
    // losers see the terminal status and bail instead of double-crediting.
    const transaction = await trx("transactions").where({ id: transactionId }).forUpdate().first();

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Double-check we haven't already settled
    if (transaction.status === "SETTLED") {
      console.log(`Transaction ${transactionId} already settled, skipping.`);
      return false;
    }

    // 2. Parse existing metadata
    const existingMetadata =
      typeof transaction.metadata === "string"
        ? JSON.parse(transaction.metadata || "{}")
        : transaction.metadata || {};

    // 3. Update the transaction
    await trx("transactions")
      .where({ id: transactionId })
      .update({
        status: "SETTLED",
        metadata: JSON.stringify({
          ...existingMetadata,
          [`${providerName.toLowerCase()}_transaction_id`]: providerRef,
          [`${providerName.toLowerCase()}_third_party_ref`]: thirdPartyRef,
          settled_at: new Date().toISOString(),
          settled_by_source: source,
        }),
        updated_at: new Date(),
      });

    await recordTransactionEvent(trx, {
      transactionId: transaction.id,
      fromStatus: transaction.status,
      toStatus: "SETTLED",
      triggeredBy: source,
      payload: { provider: providerName, providerRef, thirdPartyRef },
    });

    // 4. Update the payment session
    if (transaction.payment_session_id) {
      await trx("payment_sessions")
        .where({ id: transaction.payment_session_id })
        .update({ status: "COMPLETED", updated_at: new Date() });
    }

    // 4b. Link the payer to the merchant's customer directory. Best-effort:
    // never let directory bookkeeping roll back a settled payment.
    await tryLinkTransactionCustomer(trx, transaction, source);

    // 5. Ledger Entries
    const merchantAccount = await ensureLedgerAccount(
      trx,
      transaction.merchant_id,
      "MERCHANT_FLOAT",
      transaction.currency,
      `Merchant float (${transaction.currency})`
    );
    const escrowAccount = await ensureLedgerAccount(
      trx,
      null,
      "ESCROW",
      transaction.currency,
      `System escrow (${transaction.currency})`
    );

    // entry_id_display is UNIQUE: a timestamp alone collides when two
    // settlements commit in the same millisecond, which would roll the whole
    // settlement back. Random suffix, matching chargeFee.
    const entryIdPrefix = `LE-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    await trx("ledger_entries").insert({
      entry_id_display: `${entryIdPrefix}-CR`,
      transaction_id: transaction.id,
      account_id: merchantAccount.id,
      entry_type: "CREDIT",
      amount: transaction.amount,
      currency: transaction.currency,
      description: `Mobile money payment settled: ${transaction.tx_id_display}`,
    });

    await trx("ledger_entries").insert({
      entry_id_display: `${entryIdPrefix}-DR`,
      transaction_id: transaction.id,
      account_id: escrowAccount.id,
      entry_type: "DEBIT",
      amount: transaction.amount,
      currency: transaction.currency,
      description: `Mobile money payment escrow release: ${transaction.tx_id_display}`,
    });

    // 6. Charge Fee
    await chargeTransactionFee(trx, transaction);

    // 7. Merchant webhook (same trx; delivered after commit)
    webhookEventId = await enqueueMerchantWebhook(trx, {
      merchantId: transaction.merchant_id,
      transactionId: transaction.id,
      eventType: "payment.success",
      data: {
        ...buildPaymentWebhookData(transaction),
        status: "SETTLED",
      },
    });

    // 8. System Log
    await trx("system_logs").insert({
      level: "INFO",
      source,
      event_description: `MoMo payment settled: tx ${transaction.tx_id_display} via ${providerName} | amount=${transaction.amount} | provider_ref=${providerRef}`,
    });

    return true;
  });

  if (webhookEventId) attemptDelivery(webhookEventId).catch(() => null);
  // Only the caller that actually settled notifies. Otherwise a webhook
  // racing the reconciliation cron would email the merchant twice and tell
  // the payer by SMS, twice, that they had paid.
  if (settled) notifyTransactionSettled(transactionId).catch(() => null);

  return settled;
}

export async function failMomoPayment(params: SettleMomoParams & { providerMessage?: string }): Promise<void> {
  const { transactionId, providerRef, providerName, source, providerMessage } = params;
  let webhookEventId: string | null = null;

  await db.transaction(async (trx) => {
    const transaction = await trx("transactions").where({ id: transactionId }).forUpdate().first();

    // Never fail a transaction that already reached a terminal state — a
    // SETTLED payment has credited the merchant float and must stay settled.
    if (!transaction || transaction.status === "FAILED" || transaction.status === "SETTLED") return;

    const existingMetadata =
      typeof transaction.metadata === "string"
        ? JSON.parse(transaction.metadata || "{}")
        : transaction.metadata || {};

    await trx("transactions")
      .where({ id: transactionId })
      .update({
        status: "FAILED",
        failure_reason: providerMessage || "Payment failed at provider",
        metadata: JSON.stringify({
          ...existingMetadata,
          [`${providerName.toLowerCase()}_transaction_id`]: providerRef,
          failed_at: new Date().toISOString(),
          failed_by_source: source,
          provider_message: providerMessage,
        }),
        updated_at: new Date(),
      });

    await recordTransactionEvent(trx, {
      transactionId: transaction.id,
      fromStatus: transaction.status,
      toStatus: "FAILED",
      triggeredBy: source,
      payload: { provider: providerName, providerRef, providerMessage },
    });

    // Payment session can remain active so they can try again, unless we want to fail it too.
    // Standard practice for PSPs is to leave the session ACTIVE until it expires,
    // allowing the user to try a different payment method.

    webhookEventId = await enqueueMerchantWebhook(trx, {
      merchantId: transaction.merchant_id,
      transactionId: transaction.id,
      eventType: "payment.failed",
      data: {
        ...buildPaymentWebhookData(transaction),
        status: "FAILED",
        failure_reason: providerMessage || "Payment failed at provider",
      },
    });

    await trx("system_logs").insert({
      level: "INFO",
      source,
      event_description: `MoMo payment failed: tx ${transaction.tx_id_display} via ${providerName} | reason=${providerMessage}`,
    });
  });

  if (webhookEventId) attemptDelivery(webhookEventId).catch(() => null);
}
