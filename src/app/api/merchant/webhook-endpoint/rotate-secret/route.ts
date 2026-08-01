// POST /api/merchant/webhook-endpoint/rotate-secret — issue a new signing secret
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import { generateWebhookSecret } from "@/lib/api-keys";

export async function POST() {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;

    const merchant = await db("merchants")
      .where({ user_id: guard.session.userId })
      .first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const endpoint = await db("webhook_endpoints")
      .where({ merchant_id: merchant.id })
      .first();
    if (!endpoint) {
      return Response.json({ error: "No webhook endpoint configured" }, { status: 404 });
    }

    const secret = generateWebhookSecret();
    await db("webhook_endpoints").where({ id: endpoint.id }).update({
      secret,
      secret_rotated_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description: `Webhook signing secret rotated by merchant ${merchant.merchant_display_id}`,
      actor_id: guard.session.userId,
    });

    return Response.json({ secret, secret_rotated_at: new Date().toISOString() });
  } catch (error) {
    console.error("Webhook secret rotate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
