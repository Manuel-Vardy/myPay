// PATCH /api/merchant/settings/keys/[keyId] — revoke (deactivate) a specific API key
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { ApiKeyEntry } from "@/lib/types";

import { getSession } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const { keyId } = await params;
    
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }
    const merchant_id = merchantUser.id;

    const merchant = await db("merchants").where({ id: merchant_id }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    const keys: ApiKeyEntry[] = merchant.api_keys || [];
    const keyIndex = keys.findIndex((k) => k.key_id === keyId);

    if (keyIndex === -1) {
      return Response.json({ error: "API key not found" }, { status: 404 });
    }

    if (!keys[keyIndex].is_active) {
      return Response.json({ error: "API key is already revoked" }, { status: 409 });
    }

    keys[keyIndex] = { ...keys[keyIndex], is_active: false };

    await db("merchants")
      .where({ id: merchant_id })
      .update({ api_keys: JSON.stringify(keys), updated_at: db.fn.now() });

    return Response.json({ message: "API key revoked", key_id: keyId });
  } catch (error) {
    console.error("Key revoke error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
