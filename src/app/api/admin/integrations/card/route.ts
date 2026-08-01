// GET/PATCH /api/admin/integrations/card — platform-wide card payments toggle.
// Cards aren't wired to an acquiring bank yet, so they default to disabled;
// the admin flips this on when the bank integration is live.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const setting = await db("platform_settings")
      .where({ key: "card_payments" })
      .first();

    const value = setting?.value || { enabled: false };

    return Response.json(value);
  } catch (error) {
    console.error("Failed to fetch card payments config", error);
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
        key: "card_payments",
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
    console.error("Failed to update card payments config", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
