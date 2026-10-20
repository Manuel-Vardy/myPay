// POST /api/auth/mobile/send — send (or resend) the SMS verification code
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { requireMerchant, checkAuthRateLimit } from "@/lib/guards";
import { sendPhoneVerification, isValidE164 } from "@/lib/sms";

export async function POST() {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;

    // Cap sends per user so a stuck client can't burn SMS credits / Arkesel balance.
    const limited = await checkAuthRateLimit(
      `user:${guard.session.userId}`,
      "mobile_send",
      { limit: 5, windowSeconds: 300 }
    );
    if (limited.error) return limited.error;

    const user = await db<User>("users")
      .where({ id: guard.session.userId })
      .first();
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.mobile_verified_at) {
      return Response.json({ message: "Mobile number is already verified." });
    }

    if (!user.mobile_number || !isValidE164(user.mobile_number)) {
      return Response.json(
        { error: "No valid mobile number on file. Update it in settings first." },
        { status: 400 }
      );
    }

    await sendPhoneVerification(user.mobile_number, user.id);

    return Response.json({ message: "Verification code sent." });
  } catch (error) {
    console.error("Mobile send error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
