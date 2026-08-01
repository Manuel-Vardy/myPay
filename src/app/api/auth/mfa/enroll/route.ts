// POST /api/auth/mfa/enroll — start (or restart) TOTP enrollment for the
// current user. Stores the new secret as *pending* — it only becomes the
// active two_factor_secret once confirmed with a real code, so an abandoned
// or re-run enrollment never invalidates a secret already in use.
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { requireRole } from "@/lib/guards";
import { generateTotpSecret, totpProvisioningUri } from "@/lib/mfa";

export async function POST() {
  const guard = await requireRole("ADMIN", "MERCHANT");
  if (guard.error) return guard.error;

  const user = await db<User>("users").where({ id: guard.session.userId }).first();
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const secret = generateTotpSecret();
  await db("users").where({ id: user.id }).update({ two_factor_pending_secret: secret });

  return Response.json({
    secret,
    otpauth_uri: totpProvisioningUri(user.email, secret),
  });
}
