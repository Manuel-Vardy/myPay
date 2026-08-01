// POST /api/auth/forgot-password — issue a password reset link by email
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendPasswordResetEmail, DASHBOARD_BASE_URL, ADMIN_BASE_URL } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const genericResponse = {
      message: "If an account exists for that email, a password reset link has been sent.",
    };

    const user = await db<User>("users").where({ email }).first();

    // Don't reveal whether the email exists — always look identical to the caller.
    if (!user) {
      return Response.json(genericResponse);
    }

    const token = generateToken();
    await db("users")
      .where({ id: user.id })
      .update({
        password_reset_token: hashToken(token),
        password_reset_expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      });

    // Derive admin-ness from the account itself, not client input — the
    // caller only controls which email to look up, not which domain/label
    // the reset link uses.
    const isAdmin = user.role === "ADMIN";
    const baseUrl = isAdmin ? ADMIN_BASE_URL : DASHBOARD_BASE_URL;
    const resetUrl = `${baseUrl}/reset-password?token=${token}${isAdmin ? "&admin=true" : ""}`;
    // Don't let an email provider outage turn into a 500 that reveals this address is registered.
    await sendPasswordResetEmail(user.email, resetUrl).catch((err) =>
      console.error("Failed to send password reset email:", err)
    );

    await db("system_logs").insert({
      level: "INFO",
      source: "AUTH_CORE",
      event_description: `Password reset requested for ${user.email}`,
      actor_id: user.id,
    });

    return Response.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
