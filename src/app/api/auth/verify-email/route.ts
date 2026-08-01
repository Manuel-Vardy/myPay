// POST /api/auth/verify-email — consume an email verification token
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { hashToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return Response.json({ error: "Token is required" }, { status: 400 });
    }

    const user = await db<User>("users")
      .where({ email_verification_token: hashToken(token) })
      .first();

    if (
      !user ||
      !user.email_verification_expires ||
      new Date(user.email_verification_expires) < new Date()
    ) {
      return Response.json(
        { error: "Verification link is invalid or has expired" },
        { status: 400 }
      );
    }

    await db("users")
      .where({ id: user.id })
      .update({
        email_verified_at: db.fn.now(),
        email_verification_token: null,
        email_verification_expires: null,
      });

    return Response.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Verify email error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
