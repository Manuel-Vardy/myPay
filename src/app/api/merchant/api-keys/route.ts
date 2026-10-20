// GET  /api/merchant/api-keys — list the merchant's API keys (masked), each
//      with the number of payment sessions it created
// POST /api/merchant/api-keys — create a key; the full key is returned once
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant, requireActiveMerchant } from "@/lib/guards";
import { generateApiKey } from "@/lib/api-keys";
import { sessionUsageByApiKey } from "@/lib/payments/sessions";

export async function GET() {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const { merchant } = guard;

    const keys = await db("api_keys")
      .where({ merchant_id: merchant.id })
      .orderBy("created_at", "desc")
      .select("id", "label", "prefix", "last_used_at", "revoked_at", "created_at");

    // What each key has actually created: session_count is the blast radius
    // if the key leaked, live_session_count the part still able to take money
    // (revoking a key does not expire the sessions it already minted).
    const usage = await sessionUsageByApiKey(keys.map((k) => k.id));

    return Response.json({
      api_keys: keys.map((k) => ({
        ...k,
        session_count: usage.get(k.id)?.session_count ?? 0,
        live_session_count: usage.get(k.id)?.live_session_count ?? 0,
      })),
      active_key_count: keys.filter((k) => !k.revoked_at).length,
    });
  } catch (error) {
    console.error("API keys GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireActiveMerchant();
    if (guard.error) return guard.error;
    const { merchant } = guard;

    const body = await request.json().catch(() => ({}));
    const label =
      typeof body.label === "string" && body.label.trim()
        ? body.label.trim().slice(0, 100)
        : "API key";

    const { rawKey, keyHash, prefix } = generateApiKey();

    const [key] = await db("api_keys")
      .insert({
        merchant_id: merchant.id,
        key_hash: keyHash,
        prefix,
        label,
      })
      .returning(["id", "label", "prefix", "created_at"]);

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description: `API key created (${prefix}..., id ${key.id}) by merchant ${merchant.merchant_display_id}`,
      actor_id: guard.session.userId,
    });

    // rawKey is returned exactly once and never persisted
    return Response.json({ key, full_key: rawKey }, { status: 201 });
  } catch (error) {
    console.error("API keys POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
