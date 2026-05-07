// POST /api/auth/login — authenticate admin or merchant
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db<User>("users").where({ email }).first();

    if (!user) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.status === "SUSPENDED") {
      return Response.json(
        { error: "Account is suspended. Contact support." },
        { status: 403 }
      );
    }

    // Verify password against bcrypt hash
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if MFA is enabled
    if (user.two_factor_enabled) {
      return Response.json({
        mfa_required: true,
        user_id: user.id,
        message: "MFA verification required",
      });
    }

    // Update last login
    await db("users").where({ id: user.id }).update({ last_login: db.fn.now() });

    // Log the event
    await db("system_logs").insert({
      level: "INFO",
      source: "AUTH_CORE",
      event_description: `User ${user.email} logged in successfully`,
      actor_id: user.id,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    });

    // Create session and return token
    const token = await createSession(user.id, user.role);

    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
