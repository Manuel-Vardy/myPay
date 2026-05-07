// POST /api/payments/initiate — merchant creates a payment session to share with a payer
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, amount, currency = "USD", description, redirect_url } = body;

    if (!merchant_id || !amount) {
      return Response.json(
        { error: "merchant_id and amount are required" },
        { status: 400 }
      );
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return Response.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const merchant = await db("merchants").where({ id: merchant_id }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const [session] = await db("payment_sessions")
      .insert({
        id: crypto.randomUUID(),
        merchant_id,
        amount: Number(amount),
        currency,
        description: description || null,
        redirect_url: redirect_url || null,
        status: "ACTIVE",
        expires_at: expiresAt,
      })
      .returning("*");

    await db("system_logs").insert({
      level: "INFO",
      source: "GATEWAY_API",
      event_description: `Payment session created: ${session.id} for ${amount} ${currency} by merchant ${merchant.merchant_display_id}`,
      actor_id: merchant.user_id,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return Response.json(
      {
        session_id: session.id,
        payment_url: `${baseUrl}/pay/${session.id}`,
        amount: Number(session.amount),
        currency: session.currency,
        expires_at: session.expires_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment initiate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
