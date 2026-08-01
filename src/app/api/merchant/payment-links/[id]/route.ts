import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import { toMinorUnits } from "@/lib/utils";
import { expireSessionsForLink } from "@/lib/payments/controls";

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
      // null/empty clears the amount — customer enters it at checkout
      if (body.amount === null || body.amount === "") {
        updateData.amount = null;
      } else if (isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
        return Response.json({ error: "Amount must be a positive number" }, { status: 400 });
      } else {
        updateData.amount = toMinorUnits(body.amount);
      }
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

    // Deactivating a link must also close the sessions it already minted —
    // each one keeps accepting payments for its full 24h TTL otherwise.
    let sessionsExpired = 0;
    if (link.is_active && updatedLink.is_active === false) {
      sessionsExpired = await expireSessionsForLink(id);
    }

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description:
        `Payment link updated: ${updatedLink.link_id_display} (is_active=${updatedLink.is_active}) by merchant ${merchant.merchant_display_id}` +
        (sessionsExpired ? ` — ${sessionsExpired} active session(s) expired` : ""),
      actor_id: merchant.user_id,
    });

    return Response.json({ ...updatedLink, sessions_expired: sessionsExpired });
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

    // Expire the link's outstanding sessions BEFORE the row goes away — the
    // FK is ON DELETE SET NULL, so afterwards they can't be found by link.
    const sessionsExpired = await expireSessionsForLink(id);

    await db("payment_links").where({ id }).delete();

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description:
        `Payment link deleted: ${link.link_id_display} by merchant ${merchant.merchant_display_id}` +
        (sessionsExpired ? ` — ${sessionsExpired} active session(s) expired` : ""),
      actor_id: merchant.user_id,
    });

    return Response.json({
      success: true,
      message: "Payment link deleted successfully",
      sessions_expired: sessionsExpired,
    });
  } catch (error) {
    console.error("Delete payment link error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
