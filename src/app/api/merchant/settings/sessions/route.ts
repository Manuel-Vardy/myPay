// GET    /api/merchant/settings/sessions — list the user's active sessions
// DELETE /api/merchant/settings/sessions — revoke one session by id
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";

export async function GET() {
  const guard = await requireMerchant();
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const sessions = await db("user_sessions")
      .where({ user_id: session.userId })
      .whereNull("revoked_at")
      .orderBy("last_seen_at", "desc")
      .select("id", "user_agent", "ip_address", "created_at", "last_seen_at");

    return Response.json({
      data: sessions,
      current_session_id: session.sessionId ?? null,
    });
  } catch (error) {
    console.error("GET sessions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireMerchant();
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const body = await request.json();
    if (!body.session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }
    if (body.session_id === session.sessionId) {
      return Response.json(
        { error: "Use Sign Out to end your current session" },
        { status: 400 }
      );
    }

    const updated = await db("user_sessions")
      .where({ id: body.session_id, user_id: session.userId })
      .whereNull("revoked_at")
      .update({ revoked_at: db.fn.now() });

    if (!updated) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE session error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
