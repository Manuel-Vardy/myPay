// POST /api/auth/mfa — verify MFA token
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, token } = body;

    if (!user_id || !token) {
      return Response.json(
        { error: "user_id and token are required" },
        { status: 400 }
      );
    }

    const user = await db<User>("users").where({ id: user_id }).first();

    if (!user || !user.two_factor_enabled) {
      return Response.json(
        { error: "Invalid user or MFA not enabled" },
        { status: 400 }
      );
    }

    // TODO: Replace with real TOTP verification via otplib
    // using user.two_factor_secret — keeping placeholder for dev/demo
    const isValid = token === "000000";

    if (!isValid) {
      await db("system_logs").insert({
        level: "WARNING",
        source: "AUTH_CORE",
        event_description: `Failed MFA attempt for user ${user.email}`,
        actor_id: user.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      });

      return Response.json(
        { error: "Invalid MFA token" },
        { status: 401 }
      );
    }

    // Update last login
    await db("users").where({ id: user.id }).update({ last_login: db.fn.now() });

    await db("system_logs").insert({
      level: "INFO",
      source: "AUTH_CORE",
      event_description: `User ${user.email} passed MFA and logged in`,
      actor_id: user.id,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    });

    // Create session after successful MFA
    const sessionToken = await createSession(user.id, user.role);

    return Response.json({
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("MFA verification error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
