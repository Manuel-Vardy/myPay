// DELETE /api/merchant/api-keys/[keyId] — revoke an API key (soft; never deleted)
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
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

    const { keyId } = await params;
    const key = await db("api_keys")
      .where({ id: keyId, merchant_id: merchant.id })
      .first();
    if (!key) {
      return Response.json({ error: "API key not found" }, { status: 404 });
    }
    if (key.revoked_at) {
      return Response.json({ error: "API key is already revoked" }, { status: 409 });
    }

    await db("api_keys")
      .where({ id: keyId })
      .update({ revoked_at: db.fn.now(), updated_at: db.fn.now() });

    await db("system_logs").insert({
      level: "INFO",
      source: "MERCHANT_PORTAL",
      event_description: `API key revoked (${key.prefix}..., id ${key.id}) by merchant ${merchant.merchant_display_id}`,
      actor_id: guard.session.userId,
    });

    return Response.json({ message: "API key revoked" });
  } catch (error) {
    console.error("API key revoke error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
