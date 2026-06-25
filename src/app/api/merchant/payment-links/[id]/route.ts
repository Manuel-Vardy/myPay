import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";

// PATCH /api/merchant/payment-links/[id] - update payment link details or toggle status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const { session } = guard;

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const { id } = await params;

    // Check ownership
    const link = await db("payment_links")
      .where({ id, merchant_id: merchant.id })
      .first();

    if (!link) {
      return Response.json({ error: "Payment link not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return Response.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.amount !== undefined) {
      if (isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
        return Response.json({ error: "Amount must be a positive number" }, { status: 400 });
      }
      updateData.amount = Number(body.amount);
    }

    if (body.currency !== undefined) {
      updateData.currency = body.currency.toUpperCase();
    }

    if (body.redirect_url !== undefined) {
      updateData.redirect_url = body.redirect_url?.trim() || null;
    }

    if (body.expires_at !== undefined) {
      updateData.expires_at = body.expires_at ? new Date(body.expires_at) : null;
    }

    if (body.is_active !== undefined) {
      updateData.is_active = Boolean(body.is_active);
    }

    updateData.updated_at = db.fn.now();

    const [updatedLink] = await db("payment_links")
      .where({ id })
      .update(updateData)
      .returning("*");

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description: `Payment link updated: ${updatedLink.link_id_display} (is_active=${updatedLink.is_active}) by merchant ${merchant.merchant_display_id}`,
      actor_id: merchant.user_id,
    });

    return Response.json(updatedLink);
  } catch (error) {
    console.error("Update payment link error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/merchant/payment-links/[id] - delete payment link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const { session } = guard;

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const { id } = await params;

    // Check ownership
    const link = await db("payment_links")
      .where({ id, merchant_id: merchant.id })
      .first();

    if (!link) {
      return Response.json({ error: "Payment link not found" }, { status: 404 });
    }

    await db("payment_links").where({ id }).delete();

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description: `Payment link deleted: ${link.link_id_display} by merchant ${merchant.merchant_display_id}`,
      actor_id: merchant.user_id,
    });

    return Response.json({ success: true, message: "Payment link deleted successfully" });
  } catch (error) {
    console.error("Delete payment link error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
