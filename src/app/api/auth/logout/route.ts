// POST /api/auth/logout — destroy session
import db from "@/lib/db";
import { deleteSession, getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (session?.sessionId) {
    await db("user_sessions")
      .where({ id: session.sessionId })
      .update({ revoked_at: db.fn.now() })
      .catch(() => null);
  }
  await deleteSession();
  return Response.json({ success: true });
}
