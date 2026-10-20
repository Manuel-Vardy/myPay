// POST /api/webhooks/paystack — receive Paystack charge and transfer
// lifecycle callbacks.
//
// This is the primary settlement path for Paystack, not a supplement to
// polling: a `pay_offline` prompt can be approved long after the payer's
// browser (or the merchant's poll loop) has given up, and merchant polling is
// rate-limited. The status poll and the reconciliation cron are backstops for
// when a delivery is dropped.
//
// Transfers (payouts) are asynchronous end to end: POST /transfer returns
// `pending` and the money's fate arrives here as `transfer.success`,
// `transfer.failed` or `transfer.reversed`. Until one of those lands the
// settlement sits PROCESSING with the merchant's funds reserved, so this
// route is the primary way a Paystack payout ever completes;
// /api/cron/reconcile-payouts is the backstop.
//
// Configure the URL in the Paystack dashboard under Settings → API Keys &
// Webhooks, separately for test and live mode:
//   https://api.trite.tech/api/webhooks/paystack

import { type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import db from "@/lib/db";
import { settleMomoPayment, failMomoPayment } from "@/lib/payments/settle-momo";
import { completeSettlement, failSettlement } from "@/lib/settlements/finalize";
import { notifyAdmins } from "@/lib/admin-alerts";

const PROVIDER_NAME = "Paystack";

/**
 * Paystack signs the raw request body with the account's secret key using
 * HMAC-SHA512 (not the SHA-256 most providers use) and sends it hex-encoded
 * in `x-paystack-signature`.
 *
 * The signature covers the exact bytes received — parsing and re-serialising
 * the JSON before hashing would break verification on any key ordering or
 * whitespace difference.
 */
export function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface PaystackEvent {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    id?: number | string;
    gateway_response?: string;
    /** Transfer events only. */
    transfer_code?: string;
    /** Transfer events only — the decline narration. */
    reason?: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // --- Verify webhook authenticity ---
    // Unlike the Moolre route, an unset secret is a hard failure rather than
    // a skipped check: this endpoint can credit a merchant's balance.
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("Paystack webhook: PAYSTACK_SECRET_KEY unset — rejecting");
      return Response.json({ error: "Webhook not configured" }, { status: 401 });
    }

    if (!verifySignature(rawBody, request.headers.get("x-paystack-signature"), secret)) {
      console.warn("Paystack webhook: invalid signature — rejecting");
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: PaystackEvent;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventType = event.event;
    const reference = event.data?.reference;

    if (
      eventType === "transfer.success" ||
      eventType === "transfer.failed" ||
      eventType === "transfer.reversed"
    ) {
      return handleTransferEvent(eventType, event);
    }

    // Anything that isn't a charge or transfer outcome (disputes,
    // subscriptions) is acknowledged and dropped. A non-200 puts the endpoint
    // into Paystack's retry-then-disable cycle, which would cost us the
    // settlement path.
    if (eventType !== "charge.success" && eventType !== "charge.failed") {
      return Response.json({ received: true, ignored: eventType ?? "unknown" });
    }

    if (!reference) {
      console.warn("Paystack webhook: missing data.reference in payload");
      return Response.json({ received: true, matched: false });
    }

    // We send our own `reference` on POST /charge, so Paystack echoes back the
    // tx_id_display. A reference we don't recognise belongs to a charge created
    // outside Trite on the same account — acknowledge and move on.
    const transaction = await db("transactions").where({ tx_id_display: reference }).first();

    if (!transaction) {
      console.debug(`Paystack webhook: no transaction for reference=${reference}`);
      return Response.json({ received: true, matched: false });
    }

    // Don't re-process already terminal transactions
    if (transaction.status === "SETTLED" || transaction.status === "FAILED") {
      return Response.json({ received: true, status: "already_terminal" });
    }

    if (eventType === "charge.failed") {
      await failMomoPayment({
        transactionId: transaction.id,
        providerRef: reference,
        providerMessage: event.data?.gateway_response || "Charge failed at Paystack",
        providerName: PROVIDER_NAME,
        source: "WEBHOOK_PAYSTACK",
      });
      return Response.json({ received: true, status: "failed" });
    }

    // --- charge.success: confirm the money matches before granting value ---
    // A webhook that says "paid" for the wrong amount or currency must never
    // credit the merchant float. Both sides are minor units.
    const paidAmount = event.data?.amount;
    const paidCurrency = event.data?.currency;
    const expectedAmount = BigInt(String(transaction.amount));

    const amountMismatch =
      paidAmount === undefined || BigInt(Math.trunc(Number(paidAmount))) !== expectedAmount;
    const currencyMismatch =
      typeof paidCurrency === "string" &&
      paidCurrency.toUpperCase() !== String(transaction.currency).toUpperCase();

    if (amountMismatch || currencyMismatch) {
      const detail = `expected ${expectedAmount} ${transaction.currency}, webhook reported ${paidAmount} ${paidCurrency}`;
      console.error(`Paystack webhook: amount mismatch on ${reference} — ${detail}`);

      await db("system_logs").insert({
        level: "ERROR",
        source: "WEBHOOK_PAYSTACK",
        event_description: `Paystack webhook amount mismatch on ${reference} — not settled | ${detail}`,
        metadata: JSON.stringify({
          transaction_id: transaction.id,
          merchant_id: transaction.merchant_id,
          expected_amount: expectedAmount.toString(),
          expected_currency: transaction.currency,
          reported_amount: paidAmount ?? null,
          reported_currency: paidCurrency ?? null,
        }),
      });

      await notifyAdmins({
        category: "SYSTEM_ALERT",
        severity: "CRITICAL",
        title: "Paystack webhook amount mismatch",
        message: `Charge ${reference} reported success at a different amount and was not settled — ${detail}`,
        dedupeKey: `paystack-amount-mismatch:${reference}`,
        metadata: { transaction_id: transaction.id, reference },
      });

      return Response.json({ received: true, status: "amount_mismatch" }, { status: 202 });
    }

    await settleMomoPayment({
      transactionId: transaction.id,
      providerRef: reference,
      thirdPartyRef: event.data?.id != null ? String(event.data.id) : null,
      providerName: PROVIDER_NAME,
      source: "WEBHOOK_PAYSTACK",
    });

    return Response.json({ received: true, status: "settled" });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Finalize a payout whose outcome has just arrived.
 *
 * `processSettlement` sends the settlement UUID as the transfer `reference`,
 * so Paystack echoes it back here and it is the whole lookup key.
 */
async function handleTransferEvent(eventType: string, event: PaystackEvent) {
  const reference = event.data?.reference;
  if (!reference) {
    console.warn("Paystack webhook: transfer event with no data.reference");
    return Response.json({ received: true, matched: false });
  }

  const settlement = await db("settlements").where({ id: reference }).first();

  // A reference we don't recognise belongs to a transfer created outside
  // Trite on the same account — acknowledge and move on.
  if (!settlement) {
    console.debug(`Paystack webhook: no settlement for transfer reference=${reference}`);
    return Response.json({ received: true, matched: false });
  }

  // Never let a Paystack callback finalize a Moolre payout.
  if (settlement.payout_provider !== PROVIDER_NAME) {
    console.warn(
      `Paystack webhook: settlement ${reference} was paid out via ` +
        `${settlement.payout_provider ?? "unknown"} — ignoring`
    );
    return Response.json({ received: true, matched: false });
  }

  // Only a PROCESSING settlement has funds reserved awaiting this outcome.
  if (settlement.status !== "PROCESSING") {
    return Response.json({ received: true, status: `not_reserved:${settlement.status}` });
  }

  if (eventType === "transfer.success") {
    // Confirm the money matches before calling the payout done. Both sides
    // are minor units; net_amount is what we actually asked Paystack to send.
    const paidAmount = event.data?.amount;
    const paidCurrency = event.data?.currency;
    const expectedAmount = BigInt(String(settlement.net_amount));

    const amountMismatch =
      paidAmount === undefined || BigInt(Math.trunc(Number(paidAmount))) !== expectedAmount;
    const currencyMismatch =
      typeof paidCurrency === "string" &&
      paidCurrency.toUpperCase() !== String(settlement.currency).toUpperCase();

    if (amountMismatch || currencyMismatch) {
      const detail = `expected ${expectedAmount} ${settlement.currency}, webhook reported ${paidAmount} ${paidCurrency}`;
      console.error(`Paystack webhook: payout amount mismatch on ${reference} — ${detail}`);

      await db("system_logs").insert({
        level: "ERROR",
        source: "WEBHOOK_PAYSTACK",
        event_description: `Paystack payout amount mismatch on ${settlement.settlement_id_display} — not completed | ${detail}`,
        metadata: JSON.stringify({
          settlement_id: settlement.id,
          merchant_id: settlement.merchant_id,
          expected_amount: expectedAmount.toString(),
          expected_currency: settlement.currency,
          reported_amount: paidAmount ?? null,
          reported_currency: paidCurrency ?? null,
        }),
      });

      await notifyAdmins({
        category: "SYSTEM_ALERT",
        severity: "CRITICAL",
        title: "Paystack payout amount mismatch",
        message: `Payout ${settlement.settlement_id_display} reported success at a different amount and was not completed — ${detail}`,
        dedupeKey: `paystack-payout-mismatch:${reference}`,
        metadata: { settlement_id: settlement.id, reference },
      });

      return Response.json({ received: true, status: "amount_mismatch" }, { status: 202 });
    }

    // False means the reconciler or another delivery of this event got there
    // first — not an error, and Paystack must still see a 200.
    const applied = await completeSettlement({
      settlementId: settlement.id,
      providerRef: event.data?.transfer_code ?? reference,
      source: "WEBHOOK_PAYSTACK",
      providerMetadata: { transfer_event: eventType },
    });

    return Response.json({ received: true, status: applied ? "completed" : "already_terminal" });
  }

  // transfer.failed / transfer.reversed — Paystack is definitive, so the
  // reserve goes back to the merchant float and the fee is reversed.
  const applied = await failSettlement({
    settlementId: settlement.id,
    reason:
      event.data?.reason ||
      (eventType === "transfer.reversed"
        ? "Transfer reversed by Paystack"
        : "Transfer failed at Paystack"),
    source: "WEBHOOK_PAYSTACK",
    providerMetadata: { transfer_event: eventType },
  });

  return Response.json({ received: true, status: applied ? "failed" : "already_terminal" });
}
