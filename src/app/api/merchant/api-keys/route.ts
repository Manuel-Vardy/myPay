// GET  /api/merchant/api-keys — list the merchant's API keys (masked)
// POST /api/merchant/api-keys — create a key; the full key is returned once
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant, requireActiveMerchant } from "@/lib/guards";
import { generateApiKey } from "@/lib/api-keys";

export async function GET() {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const { merchant } = guard;

    const keys = await db("api_keys")
      .where({ merchant_id: merchant.id })
      .orderBy("created_at", "desc")
      .select("id", "label", "prefix", "last_used_at", "revoked_at", "created_at");

    return Response.json({
      api_keys: keys,
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
