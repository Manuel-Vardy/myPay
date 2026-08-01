// POST /api/payments/link-session — create a checkout session from an
// amount-less payment link, with the payer-entered amount. Fixed-amount
// links never hit this endpoint (the /lnk/[slug] resolver creates their
// session directly); we refuse them so the link amount can't be overridden.
import { type NextRequest } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { toMinorUnits } from "@/lib/utils";
import { isMerchantPaused } from "@/lib/payments/controls";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, amount } = body as { slug?: string; amount?: number | string };

    if (!slug || typeof slug !== "string") {
      return Response.json({ error: "slug is required" }, { status: 400 });
    }
    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return Response.json(
        { error: "A valid positive amount is required" },
        { status: 400 }
      );
    }

    const link = await db("payment_links")
      .where({ link_id_display: slug })
      .first();

    if (!link || !link.is_active) {
      return Response.json(
        { error: "Payment link not found or inactive" },
        { status: 404 }
      );
    }
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return Response.json(
        { error: "This payment link has expired" },
        { status: 410 }
      );
    }
    if (link.amount !== null) {
      return Response.json(
        { error: "This payment link has a fixed amount" },
        { status: 400 }
      );
    }

    const merchant = await db("merchants").where({ id: link.merchant_id }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 500 });
    }

    if (isMerchantPaused(merchant)) {
      return Response.json(
        { error: "This merchant is not currently accepting payments" },
        { status: 403 }
      );
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const sessionDescription = link.description
      ? `${link.title} - ${link.description}`
      : link.title;

    await db("payment_sessions").insert({
      id: sessionId,
      merchant_id: link.merchant_id,
      payment_link_id: link.id,
      amount: toMinorUnits(Number(amount)),
      currency: link.currency,
      description: sessionDescription,
      redirect_url: link.redirect_url,
      status: "ACTIVE",
      expires_at: expiresAt,
    });

    await db("system_logs").insert({
      level: "INFO",
      source: "GATEWAY_API",
      event_description: `Payment session ${sessionId} initialized via payment link ${link.link_id_display} with customer-entered amount ${Number(amount)} ${link.currency}`,
      actor_id: merchant.user_id,
    });

    return Response.json({ session_id: sessionId }, { status: 201 });
  } catch (error) {
    console.error("Link session creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
