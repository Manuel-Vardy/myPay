// GET /api/payments/[sessionId]/route.ts — fetch payment session details for the public payer UI
import { type NextRequest } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // If session ID starts with "test-ui-", return mock data for UI testing
    if (sessionId.startsWith("test-ui-")) {
      return Response.json({
        session_id: sessionId,
        merchant_name: "Test Merchant Store",
        amount: 125.50,
        currency: "USD",
        description: "Sample payment for UI testing - 2x Premium Products",
        stablecoin_equivalent: 125.50,
        processing_fee: 0.0,
        network_gas: "Included",
        available_methods: [
          "CRYPTO",
          "MOBILE_MONEY",
          "CARD",
          "BANK_TRANSFER",
          "DIGITAL_WALLET",
        ],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        redirect_url: null,
      });
    }

    const session = await db("payment_sessions")
      .where({ "payment_sessions.id": sessionId })
      .join("merchants", "payment_sessions.merchant_id", "merchants.id")
      .select(
        "payment_sessions.*",
        "merchants.business_name"
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

    // Calculate stablecoin equivalent (1:1 for USD → USDT, simplified)
    const stablecoinEquivalent = session.amount; // TODO: use live exchange rate

    return Response.json({
      session_id: session.id,
      merchant_name: session.business_name,
      amount: Number(session.amount),
      currency: session.currency,
      description: session.description,
      stablecoin_equivalent: stablecoinEquivalent,
      processing_fee: 0.0, // $0.00 as per wireframe
      network_gas: "Included",
      available_methods: [
        "CRYPTO",
        "MOBILE_MONEY",
        "CARD",
        "BANK_TRANSFER",
        "DIGITAL_WALLET",
      ],
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
