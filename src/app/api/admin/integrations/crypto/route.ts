// GET/PATCH /api/admin/integrations/crypto — platform-wide crypto payments toggle.
// Crypto is live via Triton, so it defaults to enabled; admins can switch it
// off (e.g. during a provider incident) without a deploy.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const setting = await db("platform_settings")
      .where({ key: "crypto_payments" })
      .first();

    const value = setting?.value || { enabled: true };

    return Response.json(value);
  } catch (error) {
    console.error("Failed to fetch crypto payments config", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return Response.json({ error: "enabled must be a boolean" }, { status: 400 });
    }

    const value = JSON.stringify({ enabled });

    await db("platform_settings")
      .insert({
        key: "crypto_payments",
        value,
        updated_by: guard.session.userId,
      })
      .onConflict("key")
      .merge({
        value,
        updated_at: db.fn.now(),
        updated_by: guard.session.userId,
      });

    return Response.json({ success: true, enabled });
  } catch (error) {
    console.error("Failed to update crypto payments config", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
