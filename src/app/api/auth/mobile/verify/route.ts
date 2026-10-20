// POST /api/auth/mobile/verify — confirm the SMS code and mark the number verified
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { requireMerchant, checkAuthRateLimit } from "@/lib/guards";
import { checkPhoneVerification } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;

    const { code } = await request.json().catch(() => ({}));
    if (!code || typeof code !== "string") {
      return Response.json({ error: "Verification code is required" }, { status: 400 });
    }

    // Cap check attempts to blunt brute-forcing the 6-digit code.
    const limited = await checkAuthRateLimit(
      `user:${guard.session.userId}`,
      "mobile_verify",
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

    if (!user.mobile_number) {
      return Response.json(
        { error: "No mobile number on file. Update it in settings first." },
        { status: 400 }
      );
    }

    const approved = await checkPhoneVerification(user.mobile_number, code.trim(), user.id);
    if (!approved) {
      return Response.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    await db("users")
      .where({ id: user.id })
      .update({ mobile_verified_at: db.fn.now() });

    await db("system_logs").insert({
      level: "INFO",
      source: "AUTH_CORE",
      event_description: `Mobile number verified for ${user.email}`,
      actor_id: user.id,
    });

    return Response.json({ message: "Mobile number verified." });
  } catch (error) {
    console.error("Mobile verify error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
