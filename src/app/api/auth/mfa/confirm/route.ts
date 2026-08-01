// POST /api/auth/mfa/confirm — confirm TOTP enrollment with one live code
// from the authenticator app. Promotes the pending secret to active, issues
// backup codes (shown once), and flips two_factor_enabled on.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { requireRole } from "@/lib/guards";
import { verifyTotpToken, generateBackupCodes } from "@/lib/mfa";

export async function POST(request: NextRequest) {
  const guard = await requireRole("ADMIN", "MERCHANT");
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => ({}));
  const { token } = body;

  const user = await db<User>("users").where({ id: guard.session.userId }).first();
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.two_factor_pending_secret) {
    return Response.json(
      { error: "No enrollment in progress. Start setup again." },
      { status: 400 }
    );
  }

  const valid = await verifyTotpToken(user.two_factor_pending_secret, token || "");
  if (!valid) {
    return Response.json({ error: "Invalid code. Check your authenticator app and try again." }, { status: 400 });
  }

  const { plaintext, rows } = generateBackupCodes();

  await db("users")
    .where({ id: user.id })
    .update({
      two_factor_secret: user.two_factor_pending_secret,
      two_factor_pending_secret: null,
      two_factor_enabled: true,
      two_factor_backup_codes: JSON.stringify(rows),
    });

  await db("system_logs").insert({
    level: "INFO",
    source: "AUTH_CORE",
    event_description: `2FA enabled for ${user.email}`,
    actor_id: user.id,
  });

  return Response.json({ message: "2FA enabled.", backup_codes: plaintext });
}
