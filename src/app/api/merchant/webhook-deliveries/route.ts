// GET /api/merchant/webhook-deliveries — recent outbound webhook attempts
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";

export async function GET() {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant = guard.merchant;

    const deliveries = await db("webhook_events")
      .where({ merchant_id: merchant.id })
      .orderBy("created_at", "desc")
      .limit(25)
      .select(
        "id",
        "event_type",
        "status",
        "attempt_count",
        "response_status",
        "last_error",
        "next_retry_at",
        "delivered_at",
        "created_at"
      );

    return Response.json({ deliveries });
  } catch (error) {
    console.error("Webhook deliveries GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
