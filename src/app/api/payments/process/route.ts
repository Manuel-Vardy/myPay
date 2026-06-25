// POST /api/payments/process — process a payment from the public payer
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";
import { getMobileMoneyProvider } from "@/lib/payments";
import type { MobileMoneyNetwork } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      method,
      payer_email,
      wallet_address,
      mobile_money_number,
      mobile_money_network,
      otp_code,
    } = body;

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

    // Mobile money specific validation
    if (method === "MOBILE_MONEY") {
      if (!mobile_money_number) {
        return Response.json(
          { error: "mobile_money_number is required for mobile money payments" },
          { status: 400 }
        );
      }
      if (!mobile_money_network || !["MTN", "TELECEL", "AT"].includes(mobile_money_network)) {
        return Response.json(
          { error: "mobile_money_network must be one of: MTN, TELECEL, AT" },
          { status: 400 }
        );
      }
    }

    // ---- OTP retry detection ----
    // If an otp_code is provided AND a PROCESSING transaction already exists
    // for this session, this is a retry of the same Moolre initiate call.
    // We must reuse the existing transaction (and its externalref / tx_id_display)
    // so Moolre receives the same externalref it saw on the first call.
    let result;
    let isOtpRetry = false;

    if (otp_code && session.transaction_id) {
      const existingTx = await db("transactions")
        .where({ id: session.transaction_id, status: "PROCESSING" })
        .first();

      if (existingTx) {
        result = existingTx;
        isOtpRetry = true;
      }
    }

    // ---- Create transaction (only on first attempt) ----
    if (!isOtpRetry) {
      const txIdDisplay = `TX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      result = await db.transaction(async (trx) => {
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
              mobile_money_network: mobile_money_network || null,
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
    }

    // ---------- Dispatch to payment provider ----------

    if (method === "MOBILE_MONEY") {
      const provider = getMobileMoneyProvider();
      const providerResult = await provider.initiatePayment({
        network: mobile_money_network as MobileMoneyNetwork,
        phoneNumber: mobile_money_number,
        amount: String(session.amount),
        currency: session.currency,
        externalRef: result.tx_id_display,
        reference: session.description || undefined,
        otpCode: otp_code || undefined,
      });

        console.log('providerResult')
        console.log(providerResult)

      // Store provider response in metadata
      const currentMetadata = typeof result.metadata === 'string'
        ? JSON.parse(result.metadata)
        : (result.metadata || {});

      await db("transactions")
        .where({ id: result.id })
        .update({
          metadata: JSON.stringify({
            ...currentMetadata,
            provider: provider.name,
            provider_ref: providerResult.providerRef || null,
            provider_response: providerResult.rawResponse,
          }),
        });

      // OTP required — tell the frontend to collect and retry
      if (providerResult.requiresOtp) {
        return Response.json(
          {
            transaction_id: result.id,
            tx_id_display: result.tx_id_display,
            status: "OTP_REQUIRED",
            message: providerResult.message || "Please enter the OTP sent to your phone",
          },
          { status: 202 }
        );
      }

      // Provider-side failure — mark transaction failed
      if (!providerResult.success) {
        await db("transactions")
          .where({ id: result.id })
          .update({ status: "FAILED" });

        return Response.json(
          {
            transaction_id: result.id,
            tx_id_display: result.tx_id_display,
            status: "FAILED",
            message: providerResult.message || "Payment initiation failed",
          },
          { status: 422 }
        );
      }

      // Successfully initiated — payer should see a USSD prompt
      return Response.json(
        {
          transaction_id: result.id,
          tx_id_display: result.tx_id_display,
          status: "PROCESSING",
          amount: Number(result.amount),
          currency: result.currency,
          method: result.method,
          message: "Payment prompt sent to your phone. Please approve it.",
        },
        { status: 202 }
      );
    }

    // TODO: Dispatch to actual payment processor for other methods
    // (Turnkey/Alchemy for crypto, card processor for cards)
    // For now, non-mobile-money methods return a simulated processing state

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
