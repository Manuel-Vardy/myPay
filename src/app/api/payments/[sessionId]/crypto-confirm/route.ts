// POST /api/payments/[sessionId]/crypto-confirm
// Called when the payer clicks "I Have Paid" after sending crypto.
// Creates a transaction row in AUTHORIZED state and starts the settlement flow.

import { type NextRequest } from "next/server";
import db from "@/lib/db";
import crypto from "node:crypto";
import { recordTransactionEvent } from "@/lib/payments/tx-events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // 1. Validate session and retrieve Triton metadata
    const session = await db("payment_sessions")
      .where({ id: sessionId })
      .first();

    if (!session) {
      return Response.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    if (session.status === "COMPLETED") {
      return Response.json(
        { error: "Payment session already completed" },
        { status: 409 }
      );
    }

    const metadata = typeof session.metadata === "string"
      ? JSON.parse(session.metadata)
      : session.metadata || {};

    if (!metadata.triton_invoice_id || !metadata.triton_deposit_address) {
      return Response.json(
        { error: "No deposit address generated. Please generate an address first." },
        { status: 400 }
      );
    }

    // 2. Check for existing AUTHORIZED transaction (idempotency)
    const existingTx = await db("transactions")
      .where({
        payment_session_id: sessionId,
        method: "CRYPTO",
      })
      .whereNotIn("status", ["FAILED", "CANCELLED", "EXPIRED"])
      .first();

    if (existingTx) {
      // Already confirmed — return existing transaction
      return Response.json(
        {
          transaction_id: existingTx.id,
          tx_id_display: existingTx.tx_id_display,
          status: existingTx.status,
          amount: Number(existingTx.amount),
          currency: existingTx.currency,
          method: existingTx.method,
          message: "Payment confirmation recorded. Waiting for blockchain settlement.",
        },
        { status: 202 }
      );
    }

    // 3. Create transaction in AUTHORIZED state
    const txIdDisplay = `TX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const idempotencyKey = `crypto-confirm-${sessionId}`;

    const result = await db.transaction(async (trx) => {
      const chargeAmount = metadata.triton_total_amount ?? session.amount;
      const feeBasisAmount = metadata.triton_fee_basis_amount ?? session.amount;

      const [transaction] = await trx("transactions")
        .insert({
          tx_id_display: txIdDisplay,
          merchant_id: session.merchant_id,
          payment_session_id: sessionId,
          amount: chargeAmount,
          fee_basis_amount: feeBasisAmount,
          currency: session.currency,
          crypto_amount: metadata.triton_token_amount
            ? Number(metadata.triton_token_amount) / Math.pow(10, metadata.triton_token_decimals ?? 6)
            : null,
          crypto_currency: metadata.triton_payment_asset || null,
          method: "CRYPTO",
          rail: metadata.triton_rail || null,
          status: "AUTHORIZED",
          gateway_reference: metadata.triton_invoice_id,
          payer_wallet_address: metadata.triton_deposit_address,
          idempotency_key: idempotencyKey,
          metadata: JSON.stringify({
            session_id: sessionId,
            triton_invoice_id: metadata.triton_invoice_id,
            triton_network_id: metadata.triton_network_id,
            triton_locked_rate: metadata.triton_locked_rate,
            triton_address_lease_expires_at: metadata.triton_address_lease_expires_at,
          }),
        })
        .returning("*");

      // 4. Insert transaction_event (immutable audit trail)
      await recordTransactionEvent(trx, {
        transactionId: transaction.id,
        fromStatus: null, // first event
        toStatus: "AUTHORIZED",
        triggeredBy: "payer:checkout",
        payload: {
          triton_invoice_id: metadata.triton_invoice_id,
          deposit_address: metadata.triton_deposit_address,
          token_amount: metadata.triton_token_amount,
        },
      });

      // 5. Log the payment confirmation
      await trx("system_logs").insert({
        level: "INFO",
        source: "GATEWAY_API",
        event_description:
          `Crypto payment confirmed by payer: ${txIdDisplay} via CRYPTO ` +
          `(${metadata.triton_payment_asset}) for ${chargeAmount} ${session.currency}`,
      });

      return transaction;
    });

    return Response.json(
      {
        transaction_id: result.id,
        tx_id_display: result.tx_id_display,
        status: "AUTHORIZED",
        amount: Number(result.amount),
        currency: result.currency,
        method: result.method,
        message: "Payment confirmation recorded. Waiting for blockchain settlement.",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Crypto confirm error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
