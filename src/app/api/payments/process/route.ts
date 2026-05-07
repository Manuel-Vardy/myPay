// POST /api/payments/process — process a payment from the public payer
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, method, payer_email, wallet_address, mobile_money_number } = body;

    if (!session_id || !method) {
      return Response.json(
        { error: "session_id and method are required" },
        { status: 400 }
      );
    }

    // Validate session
    const session = await db("payment_sessions")
      .where({ id: session_id, status: "ACTIVE" })
      .first();

    if (!session) {
      return Response.json(
        { error: "Invalid or inactive payment session" },
        { status: 400 }
      );
    }

    if (new Date(session.expires_at) < new Date()) {
      await db("payment_sessions")
        .where({ id: session_id })
        .update({ status: "EXPIRED" });
      return Response.json(
        { error: "Payment session has expired" },
        { status: 410 }
      );
    }

    // Create the transaction record
    const txIdDisplay = `TX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const result = await db.transaction(async (trx) => {
      const [transaction] = await trx("transactions")
        .insert({
          tx_id_display: txIdDisplay,
          merchant_id: session.merchant_id,
          amount: session.amount,
          currency: session.currency,
          stablecoin_amount: session.amount, // 1:1 simplified
          stablecoin_currency: "USDT",
          method,
          status: "PROCESSING",
          payer_email: payer_email || null,
          payer_wallet_address: wallet_address || null,
          metadata: JSON.stringify({
            session_id,
            mobile_money_number: mobile_money_number || null,
          }),
        })
        .returning("*");

      // Link transaction to session
      await trx("payment_sessions")
        .where({ id: session_id })
        .update({ transaction_id: transaction.id });

      // Log the payment attempt
      await trx("system_logs").insert({
        level: "INFO",
        source: "GATEWAY_API",
        event_description: `Payment initiated: ${txIdDisplay} via ${method} for ${session.amount} ${session.currency}`,
      });

      return transaction;
    });

    // TODO: Dispatch to actual payment processor (Turnkey/Alchemy for crypto,
    // MTN/Telcel for mobile money, card processor for cards)
    // For now, we simulate processing

    return Response.json(
      {
        transaction_id: result.id,
        tx_id_display: result.tx_id_display,
        status: result.status,
        amount: Number(result.amount),
        currency: result.currency,
        method: result.method,
        message: "Payment is being processed",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Payment process error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
