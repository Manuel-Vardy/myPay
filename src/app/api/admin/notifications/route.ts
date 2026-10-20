// GET   /api/admin/notifications — the signed-in admin's notification feed
// PATCH /api/admin/notifications — mark notifications read
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(request.nextUrl.searchParams.get("limit") || DEFAULT_LIMIT))
    );

    const notifications = await db("admin_notifications")
      .where({ admin_user_id: guard.session.userId })
      .orderBy("created_at", "desc")
      .limit(limit)
      .select(
        "id",
        "category",
        "severity",
        "title",
        "message",
        "metadata",
        "read_at",
        "created_at"
      );

    const unreadRow = await db("admin_notifications")
      .where({ admin_user_id: guard.session.userId })
      .whereNull("read_at")
      .count({ cnt: "*" })
      .first();

    return Response.json({
      notifications,
      unread_count: Number(unreadRow?.cnt ?? 0),
    });
  } catch (error) {
    console.error("Admin notifications GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { ids, all } = await request.json().catch(() => ({}));

    // Always scoped to the caller's own rows — an admin can't mark another
    // admin's feed as read.
    let query = db("admin_notifications")
      .where({ admin_user_id: guard.session.userId })
      .whereNull("read_at");

    if (!all) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return Response.json(
          { error: "Provide `ids` to mark read, or `all: true`" },
          { status: 400 }
        );
      }
      query = query.whereIn("id", ids);
    }

    const updated = await query.update({ read_at: db.fn.now() });

    if (updated > 0) {
      await db("system_logs").insert({
        level: "INFO",
        source: "ADMIN_NOTIFICATIONS",
        event_description: `Admin marked ${updated} notification(s) read`,
        actor_id: guard.session.userId,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      });
    }

    return Response.json({ updated });
  } catch (error) {
    console.error("Admin notifications PATCH error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
