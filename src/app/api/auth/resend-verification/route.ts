// POST /api/auth/resend-verification — re-send the signup verification email
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { requireMerchant } from "@/lib/guards";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendVerificationEmail, DASHBOARD_BASE_URL } from "@/lib/email";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST() {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;

    const user = await db<User>("users").where({ id: guard.session.userId }).first();
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email_verified_at) {
      return Response.json({ message: "Email is already verified." });
    }

    const token = generateToken();
    await db("users")
      .where({ id: user.id })
      .update({
        email_verification_token: hashToken(token),
        email_verification_expires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      });

    const verifyUrl = `${DASHBOARD_BASE_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verifyUrl);

    return Response.json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Resend verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
