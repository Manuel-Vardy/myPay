// POST /api/merchant/webhook-deliveries/[id]/redeliver — retry a delivery now
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import { attemptDelivery } from "@/lib/webhooks/deliver";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;

    const merchant = await db("merchants")
      .where({ user_id: guard.session.userId })
      .first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const { id } = await params;
    const event = await db("webhook_events")
      .where({ id, merchant_id: merchant.id })
      .first();
    if (!event) {
      return Response.json({ error: "Delivery not found" }, { status: 404 });
    }

    // Reset EXHAUSTED/FAILED (or re-poke stuck PENDING) and try immediately
    await db("webhook_events").where({ id }).update({
      status: "PENDING",
      next_retry_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    const delivered = await attemptDelivery(id);
    const updated = await db("webhook_events")
      .where({ id })
      .first("status", "attempt_count", "response_status", "last_error");

    return Response.json({ delivered, delivery: updated });
  } catch (error) {
    console.error("Webhook redeliver error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
