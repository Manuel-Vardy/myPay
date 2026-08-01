// POST /api/auth/reset-password — consume a reset token and set a new password
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { hashPassword } from "@/lib/auth";
import { hashToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return Response.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const user = await db<User>("users")
      .where({ password_reset_token: hashToken(token) })
      .first();

    if (!user || !user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
      return Response.json(
        { error: "Reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(password);

    await db("users")
      .where({ id: user.id })
      .update({
        password_hash,
        password_reset_token: null,
        password_reset_expires: null,
      });

    await db("system_logs").insert({
      level: "INFO",
      source: "AUTH_CORE",
      event_description: `Password reset completed for ${user.email}`,
      actor_id: user.id,
    });

    return Response.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
