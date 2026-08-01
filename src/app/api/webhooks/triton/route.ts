// POST /api/webhooks/triton — receive Triton payment event callbacks.
//
// Triton sends webhooks (e.g. invoice.paid) when on-chain payments are
// detected, confirmed, and settled. This handler verifies the webhook
// signature, resolves the matching transaction, and finalises the payment.

import { type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import db from "@/lib/db";
import {
  finaliseCryptoPayment,
} from "@/lib/payments/crypto-helpers";
import { getCryptoProvider } from "@/lib/payments";

/**
 * Verify Triton webhook signature.
 * Triton signs `${timestamp}.${JSON.stringify(body)}` — the value of the
 * x-triton-timestamp header, a period, and the JSON-serialized body — with
 * the signing secret returned at webhook registration.
 */
function verifyWebhookSignature(
  timestamp: string | null,
  body: unknown,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !timestamp) return false;
  const signedPayload = `${timestamp}.${JSON.stringify(body)}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // 1. Parse the event payload (verification signs the re-serialized body)
    let event: {
      type: string;
      data: {
        invoiceId?: string;
        id?: string;
        status?: string;
        hash?: string;
        amount?: string;
        asset?: string;
        [key: string]: unknown;
      };
    };

    try {
      event = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    let webhookSecret = process.env.TRITON_WEBHOOK_SECRET;

    // Check DB for dynamic setting first
    try {
      const setting = await db("platform_settings")
        .where({ key: "integration:triton:webhook" })
        .first();

      if (setting && setting?.value?.secret) {
        webhookSecret = setting.value.secret;
      }
    } catch (dbErr) {
      console.warn("Failed to fetch webhook secret from DB, falling back to env", dbErr);
    }

    if (webhookSecret) {
      const signature = request.headers.get("x-triton-signature");
      const timestamp = request.headers.get("x-triton-timestamp");
      if (!verifyWebhookSignature(timestamp, event, signature, webhookSecret)) {
        console.warn("Triton webhook: invalid signature");
        return Response.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    const eventType = event.type;
    console.info(`Triton webhook received: ${eventType}`);

    // 3. Handle invoice.paid events
    if (eventType === "invoice.paid" || eventType === "invoice.settled") {
      const invoiceId = event.data?.invoiceId || event.data?.id;

      if (!invoiceId) {
        console.warn("Triton webhook: missing invoiceId in payload");
        return Response.json(
          { error: "Missing invoiceId" },
          { status: 400 }
        );
      }

      // Find the transaction by gateway_reference (Triton invoice ID)
      const transaction = await db("transactions")
        .where({ gateway_reference: invoiceId, method: "CRYPTO" })
        .first();

      if (!transaction) {
        console.warn(
          `Triton webhook: no transaction found for invoiceId=${invoiceId}`
        );
        // Acknowledge to prevent retries — we may not have the transaction yet
        // if the payer hasn't clicked "I Have Paid".
        return Response.json({ received: true, matched: false });
      }

      // Try to get the network hash from Triton payments endpoint
      let networkHash: string | null = null;
      try {
        const crypto = getCryptoProvider();
        const payments = await crypto.listPayments(invoiceId);
        const confirmedPayment = payments.find(
          (p) => p.status === "CONFIRMED" || p.status === "SWEPT"
        );
        if (confirmedPayment) {
          networkHash = confirmedPayment.hash;
        }
      } catch (err) {
        console.warn("Triton webhook: failed to fetch payment details:", err);
      }

      // Finalise the payment (shared helper handles idempotency)
      const settled = await finaliseCryptoPayment({
        transactionId: transaction.id,
        networkHash,
        triggeredBy: `webhook:triton:${eventType}`,
      });

      return Response.json({ received: true, settled });
    }

    // 4. Handle other event types (log but acknowledge)
    console.info(
      `Triton webhook: unhandled event type "${eventType}" — acknowledged`
    );

    return Response.json({ received: true });
  } catch (error) {
    console.error("Triton webhook error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
