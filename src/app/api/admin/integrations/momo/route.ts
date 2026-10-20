import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";

export async function GET(request: NextRequest) {
  const guard = await requirePermission("manage-integrations");
  if (guard.error) return guard.error;

  try {
    const setting = await db("platform_settings")
      .where({ key: "active_momo_provider" })
      .first();

    const value = setting?.value || { provider: "moolre", fallback_enabled: false };

    return Response.json(value);
  } catch (error) {
    console.error("Failed to fetch momo provider config", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requirePermission("manage-integrations");
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const { provider, fallback_enabled } = body;

    if (!["moolre", "anm", "paystack"].includes(provider)) {
      return Response.json({ error: "Invalid provider" }, { status: 400 });
    }

    const value = JSON.stringify({
      provider,
      fallback_enabled: !!fallback_enabled,
    });

    await db("platform_settings")
      .insert({
        key: "active_momo_provider",
        value,
        updated_by: guard.session.userId,
      })
      .onConflict("key")
      .merge({
        value,
        updated_at: db.fn.now(),
        updated_by: guard.session.userId,
      });

    await db("system_logs").insert({
      level: "WARN",
      source: "ADMIN_INTEGRATIONS",
      event_description: `MoMo active provider set to ${provider} (fallback=${fallback_enabled ? "true" : "false"})`,
      actor_id: guard.session.userId,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    });

    return Response.json({ success: true, provider, fallback_enabled });
  } catch (error: any) {
    console.error("Failed to update momo provider config", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
