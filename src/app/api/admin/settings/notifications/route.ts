import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/guards";
import db from "@/lib/db";

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { session } = guard;

  try {
    const notificationSettings = await request.json();

    await db("admin_profiles")
      .where({ user_id: session.userId })
      .update({
        notification_settings: JSON.stringify(notificationSettings),
        updated_at: new Date(),
      });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Notifications update error:", error);
    return Response.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}
