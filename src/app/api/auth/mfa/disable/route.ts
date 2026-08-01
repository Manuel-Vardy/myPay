// POST /api/auth/mfa/disable — turn off 2FA. Requires the current password
// since this lowers account security; anyone with an active session
// shouldn't be able to strip 2FA with a single click.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { requireRole } from "@/lib/guards";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const guard = await requireRole("ADMIN", "MERCHANT");
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!password) {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  const user = await db<User>("users").where({ id: guard.session.userId }).first();
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  await db("users")
    .where({ id: user.id })
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_pending_secret: null,
      two_factor_backup_codes: null,
    });

  await db("system_logs").insert({
    level: "WARN",
    source: "AUTH_CORE",
    event_description: `2FA disabled for ${user.email}`,
    actor_id: user.id,
  });

  return Response.json({ message: "2FA disabled." });
}
