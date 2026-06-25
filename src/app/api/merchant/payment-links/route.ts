import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import crypto from "crypto";

// GET /api/merchant/payment-links - list payment links
export async function GET(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const { session } = guard;

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const per_page = Math.min(50, Math.max(1, Number(searchParams.get("per_page") || 10)));
    const search = searchParams.get("search");

    let query = db("payment_links").where({ merchant_id: merchant.id });

    if (search) {
      query = query.where(function () {
        this.where("title", "ilike", `%${search}%`)
          .orWhere("description", "ilike", `%${search}%`)
          .orWhere("link_id_display", "ilike", `%${search}%`);
      });
    }

    const countQuery = query.clone().count("id as cnt").first();
    const total = Number((await countQuery)?.cnt || 0);

    const paymentLinks = await query
      .orderBy("created_at", "desc")
      .limit(per_page)
      .offset((page - 1) * per_page);

    return Response.json({
      data: paymentLinks,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("Fetch payment links error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/merchant/payment-links - create a payment link
export async function POST(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const { session } = guard;

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, amount, currency = "GHS", description, redirect_url, expires_at } = body;

    if (!title || !title.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return Response.json({ error: "A valid positive amount is required" }, { status: 400 });
    }

    // Generate unique display link ID: e.g. pay_8f9d2a3c
    const linkIdDisplay = `pay_${crypto.randomBytes(4).toString("hex")}`;

    const [paymentLink] = await db("payment_links")
      .insert({
        id: crypto.randomUUID(),
        link_id_display: linkIdDisplay,
        merchant_id: merchant.id,
        title: title.trim(),
        description: description?.trim() || null,
        amount: Number(amount),
        currency: currency.toUpperCase(),
        redirect_url: redirect_url?.trim() || null,
        expires_at: expires_at ? new Date(expires_at) : null,
        is_active: true,
      })
      .returning("*");

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description: `Payment link created: ${paymentLink.link_id_display} for ${paymentLink.amount} ${paymentLink.currency} by merchant ${merchant.merchant_display_id}`,
      actor_id: merchant.user_id,
    });

    return Response.json(paymentLink, { status: 201 });
  } catch (error) {
    console.error("Create payment link error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
