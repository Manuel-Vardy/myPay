// GET /api/payments/[sessionId]/route.ts — fetch payment session details for the public payer UI
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { fromMinorUnits } from "@/lib/utils";
import { quoteFee } from "@/lib/fees";
import { isCardPaymentsEnabled, isCryptoPaymentsEnabled } from "@/lib/payments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await db("payment_sessions")
      .where({ "payment_sessions.id": sessionId })
      .join("merchants", "payment_sessions.merchant_id", "merchants.id")
      .select(
        "payment_sessions.*",
        "merchants.business_name",
        "merchants.tier as merchant_tier",
        "merchants.fee_bearer as fee_bearer"
      )
      .first();

    if (!session) {
      return Response.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await db("payment_sessions")
        .where({ id: sessionId })
        .update({ status: "EXPIRED" });

      return Response.json(
        { error: "Payment session has expired" },
        { status: 410 }
      );
    }

    if (session.status === "COMPLETED") {
      return Response.json(
        { error: "Payment session already completed" },
        { status: 409 }
      );
    }

    const majorAmount = fromMinorUnits(session.amount);
    // Calculate stablecoin equivalent (1:1 for USD → USDT, simplified)
    const stablecoinEquivalent = session.currency === 'USD' ? majorAmount : 0; // TODO: use live exchange rate

    // Quote the platform processing fee from the active fee schedule
    // (method-agnostic at this point — the payer hasn't picked one yet).
    const processingFee = await quoteFee(
      "PAYMENT_PROCESSING",
      {
        merchantId: session.merchant_id,
        merchantTier: session.merchant_tier,
        currency: session.currency,
      },
      BigInt(String(session.amount))
    );

    const totalAmount =
      session.fee_bearer === "CUSTOMER"
        ? fromMinorUnits(BigInt(String(session.amount)) + processingFee)
        : majorAmount;

    const [cardEnabled, cryptoEnabled] = await Promise.all([
      isCardPaymentsEnabled(),
      isCryptoPaymentsEnabled(),
    ]);
    const availableMethods = [
      ...(cryptoEnabled ? ["CRYPTO"] : []),
      "MOBILE_MONEY",
      ...(cardEnabled ? ["CARD"] : []),
      "BANK_TRANSFER",
      "DIGITAL_WALLET",
    ];

    return Response.json({
      session_id: session.id,
      merchant_name: session.business_name,
      amount: majorAmount,
      currency: session.currency,
      description: session.description,
      stablecoin_equivalent: stablecoinEquivalent,
      processing_fee: fromMinorUnits(processingFee),
      fee_bearer: session.fee_bearer,
      total_amount: totalAmount,
      network_gas: "Included",
      card_enabled: cardEnabled,
      crypto_enabled: cryptoEnabled,
      available_methods: availableMethods,
      expires_at: session.expires_at,
      redirect_url: session.redirect_url || null,
    });
  } catch (error) {
    console.error("Payment session fetch error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
