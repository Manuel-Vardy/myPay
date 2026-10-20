// ============================================================
// Shared helper for finalising a crypto payment.
// Used by both the Triton webhook handler and the status
// polling endpoint to avoid duplicating settlement logic.
// ============================================================

import crypto from "node:crypto";
import db from "@/lib/db";
import { chargeTransactionFee, ensureLedgerAccount } from "@/lib/fees";
import { recordTransactionEvent } from "@/lib/payments/tx-events";
import { tryLinkTransactionCustomer } from "@/lib/payments/customers";
import { enqueueMerchantWebhook } from "@/lib/webhooks/enqueue";
import { attemptDelivery } from "@/lib/webhooks/deliver";
import { buildPaymentWebhookData } from "@/lib/webhooks/payloads";
import { notifyTransactionSettled } from "@/lib/notifications";

interface FinaliseCryptoPaymentParams {
  /** Our internal transaction UUID. */
  transactionId: string;
  /** Blockchain transaction hash (if known). */
  networkHash?: string | null;
  /** Who triggered the finalisation: e.g. "webhook:triton" or "status_poll". */
  triggeredBy: string;
}

/**
 * Transition a CRYPTO transaction from AUTHORIZED → SETTLED.
 *
 * - Updates the transaction row.
 * - Inserts a transaction_event (immutable audit trail).
 * - Marks the payment_session COMPLETED.
 * - Writes ledger entries (CREDIT merchant float, DEBIT escrow).
 * - Logs the event.
 *
 * Returns true if the transition was applied, false if the transaction
 * was already settled or in a non-AUTHORIZED state (idempotent).
 */
export async function finaliseCryptoPayment(
  params: FinaliseCryptoPaymentParams
): Promise<boolean> {
  const { transactionId, networkHash, triggeredBy } = params;
  let webhookEventId: string | null = null;

  const settled = await db.transaction(async (trx) => {
    // Lock the row to prevent race conditions between webhook and poll.
    const tx = await trx("transactions")
      .where({ id: transactionId })
      .forUpdate()
      .first();

    if (!tx) {
      console.warn(`finaliseCryptoPayment: transaction ${transactionId} not found`);
      return false;
    }

    // Idempotent — if already settled or in a terminal state, skip.
    if (tx.status !== "AUTHORIZED") {
      console.info(
        `finaliseCryptoPayment: tx ${transactionId} is ${tx.status}, not AUTHORIZED — skipping`
      );
      return false;
    }

    // 1. Update transaction → SETTLED
    await trx("transactions")
      .where({ id: transactionId })
      .update({
        status: "SETTLED",
        crypto_network_hash: networkHash || tx.crypto_network_hash,
        updated_at: new Date(),
      });

    // 2. Insert transaction_event (immutable audit trail — migration 0013)
    await recordTransactionEvent(trx, {
      transactionId,
      fromStatus: "AUTHORIZED",
      toStatus: "SETTLED",
      triggeredBy,
      payload: { networkHash },
    });

    // 3. Mark payment session as COMPLETED (if linked)
    if (tx.payment_session_id) {
      await trx("payment_sessions")
        .where({ id: tx.payment_session_id })
        .update({ status: "COMPLETED", updated_at: new Date() });
    }

    // 3b. Link the payer to the merchant's customer directory. Only lands
    // when the payer has a contactable identity — a crypto payer with no
    // merchant-supplied email is anonymous, since the deposit address is ours
    // and leased fresh per payment. Best-effort either way.
    await tryLinkTransactionCustomer(trx, tx, "CRYPTO_SETTLEMENT");

    // 4. Write ledger entries (migration 0012)
    const merchantAccount = await ensureLedgerAccount(
      trx,
      tx.merchant_id,
      "MERCHANT_FLOAT",
      tx.currency,
      `Merchant float (${tx.currency})`
    );
    const escrowAccount = await ensureLedgerAccount(
      trx,
      null,
      "ESCROW",
      tx.currency,
      `System escrow (${tx.currency})`
    );

    // entry_id_display is UNIQUE: a timestamp alone collides when two
    // settlements commit in the same millisecond, which would roll the whole
    // settlement back. Random suffix, matching chargeFee.
    const entryIdPrefix = `LE-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    // CREDIT merchant float
    await trx("ledger_entries").insert({
      entry_id_display: `${entryIdPrefix}-CR`,
      transaction_id: transactionId,
      account_id: merchantAccount.id,
      entry_type: "CREDIT",
      amount: tx.amount, // fiat minor units
      currency: tx.currency,
      crypto_amount: tx.crypto_amount
        ? parseFloat(tx.crypto_amount)
        : null,
      crypto_currency: tx.crypto_currency,
      description: `Crypto payment settled: ${tx.tx_id_display}`,
    });

    // DEBIT escrow
    await trx("ledger_entries").insert({
      entry_id_display: `${entryIdPrefix}-DR`,
      transaction_id: transactionId,
      account_id: escrowAccount.id,
      entry_type: "DEBIT",
      amount: tx.amount,
      currency: tx.currency,
      crypto_amount: tx.crypto_amount
        ? parseFloat(tx.crypto_amount)
        : null,
      crypto_currency: tx.crypto_currency,
      description: `Crypto payment escrow release: ${tx.tx_id_display}`,
    });

    // 5. Charge the platform processing fee (fee_ledger + DEBIT merchant
    // float / CREDIT PSP_FEE). No-op when no schedule applies.
    await chargeTransactionFee(trx, tx);

    // 5b. Merchant webhook (same trx; delivered after commit)
    webhookEventId = await enqueueMerchantWebhook(trx, {
      merchantId: tx.merchant_id,
      transactionId: tx.id,
      eventType: "payment.success",
      data: {
        ...buildPaymentWebhookData(tx),
        status: "SETTLED",
        crypto_network_hash: networkHash || tx.crypto_network_hash || null,
      },
    });

    // 6. Log the event
    await trx("system_logs").insert({
      level: "INFO",
      source: "CRYPTO_SETTLEMENT",
      event_description:
        `Crypto payment settled: ${tx.tx_id_display} → SETTLED ` +
        `| method=${tx.method} | rail=${tx.rail} | triggered_by=${triggeredBy}` +
        (networkHash ? ` | hash=${networkHash}` : ""),
    });

    return true;
  });

  if (settled && webhookEventId) attemptDelivery(webhookEventId).catch(() => null);
  if (settled) notifyTransactionSettled(transactionId).catch(() => null);
  return settled;
}

/**
 * Transition a CRYPTO transaction to EXPIRED or FAILED.
 *
 * - Updates the transaction row.
 * - Inserts a transaction_event.
 * - Marks the payment_session back to ACTIVE (so payer can retry).
 */
export async function expireCryptoPayment(
  transactionId: string,
  triggeredBy: string
): Promise<boolean> {
  let webhookEventId: string | null = null;

  const expired = await db.transaction(async (trx) => {
    const tx = await trx("transactions")
      .where({ id: transactionId })
      .forUpdate()
      .first();

    if (!tx || tx.status !== "AUTHORIZED") {
      return false;
    }

    await trx("transactions")
      .where({ id: transactionId })
      .update({
        status: "EXPIRED",
        failure_reason: "Crypto payment window expired",
        updated_at: new Date(),
      });

    await recordTransactionEvent(trx, {
      transactionId,
      fromStatus: "AUTHORIZED",
      toStatus: "EXPIRED",
      triggeredBy,
    });

    webhookEventId = await enqueueMerchantWebhook(trx, {
      merchantId: tx.merchant_id,
      transactionId: tx.id,
      eventType: "payment.failed",
      data: {
        ...buildPaymentWebhookData(tx),
        status: "EXPIRED",
        failure_reason: "Crypto payment window expired",
      },
    });

    await trx("system_logs").insert({
      level: "WARN",
      source: "CRYPTO_SETTLEMENT",
      event_description: `Crypto payment expired: ${tx.tx_id_display} | triggered_by=${triggeredBy}`,
    });

    return true;
  });

  if (expired && webhookEventId) attemptDelivery(webhookEventId).catch(() => null);
  return expired;
}
