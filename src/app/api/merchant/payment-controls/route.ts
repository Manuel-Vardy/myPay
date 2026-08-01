// GET/PATCH /api/merchant/payment-controls — the merchant's own "stop taking
// payments" switch. Pausing blocks new sessions on every channel (API,
// payment links, hosted checkout) AND expires the sessions already minted,
// which is the only thing that actually stops money arriving.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import {
  pauseMerchantPayments,
  resumeMerchantPayments,
} from "@/lib/payments/controls";

export async function GET() {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;

    const merchant = await db("merchants")
      .where({ user_id: guard.session.userId })
      .first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const pausedBy = merchant.payments_paused_by
      ? await db("users")
          .where({ id: merchant.payments_paused_by })
          .first("id", "role")
      : null;

    const activeSessions = await db("payment_sessions")
      .where({ merchant_id: merchant.id, status: "ACTIVE" })
      .count("id as cnt")
      .first();

    return Response.json({
      paused: Boolean(merchant.payments_paused_at),
      paused_at: merchant.payments_paused_at,
      reason: merchant.payments_paused_reason,
      // Surfaced so the portal can say "paused by Trite — contact support"
      // instead of offering a resume button the merchant can't use.
      paused_by_admin: pausedBy?.role === "ADMIN",
      active_sessions: Number(activeSessions?.cnt || 0),
    });
  } catch (error) {
    console.error("Payment controls GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;

    const merchant = await db("merchants")
      .where({ user_id: guard.session.userId })
      .first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
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
        source: "MERCHANT_PORTAL",
        reason: reason ?? null,
      });
      return Response.json({ success: true, paused: true, sessions_expired: sessionsExpired });
    }

    // An admin-imposed pause can only be lifted by an admin.
    if (merchant.payments_paused_by && merchant.payments_paused_by !== guard.session.userId) {
      const pausedBy = await db("users")
        .where({ id: merchant.payments_paused_by })
        .first("role");
      if (pausedBy?.role === "ADMIN") {
        return Response.json(
          { error: "Payments were paused by Trite. Please contact support to resume." },
          { status: 403 }
        );
      }
    }

    await resumeMerchantPayments({
      merchantId: merchant.id,
      actorId: guard.session.userId,
      source: "MERCHANT_PORTAL",
    });
    return Response.json({ success: true, paused: false });
  } catch (error) {
    console.error("Payment controls PATCH error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
