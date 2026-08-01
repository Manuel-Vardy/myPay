// PATCH /api/admin/merchants/[id]/payment-controls — platform-side switch to
// stop a merchant taking payments (fraud, compliance hold, incident).
// Same mechanics as the merchant's own control: blocks new sessions on every
// channel and expires the outstanding ones.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import {
  pauseMerchantPayments,
  resumeMerchantPayments,
} from "@/lib/payments/controls";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;

    // [id] is the merchant's USER id here, matching the sibling
    // /api/admin/merchants/[id] route. Fall back to the merchants.id so a
    // caller holding either identifier works.
    const merchant =
      (await db("merchants").where({ user_id: id }).first()) ??
      (await db("merchants").where({ id }).first());
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { paused, reason } = body as { paused?: boolean; reason?: string };

    if (typeof paused !== "boolean") {
      return Response.json({ error: "paused must be a boolean" }, { status: 400 });
    }

    if (paused) {
      const { sessionsExpired } = await pauseMerchantPayments({
        merchantId: merchant.id,
        actorId: guard.session.userId,
        source: "ADMIN_ACTION",
        reason: reason ?? null,
      });
      return Response.json({
        success: true,
        paused: true,
        sessions_expired: sessionsExpired,
      });
    }

    await resumeMerchantPayments({
      merchantId: merchant.id,
      actorId: guard.session.userId,
      source: "ADMIN_ACTION",
    });
    return Response.json({ success: true, paused: false });
  } catch (error) {
    console.error("Admin payment controls error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
