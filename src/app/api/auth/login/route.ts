// POST /api/auth/login — authenticate admin or merchant
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { checkAuthRateLimit } from "@/lib/guards";

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

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const [byEmail, byIp] = await Promise.all([
      checkAuthRateLimit(`email:${email.toLowerCase()}`, "login", { limit: 5, windowSeconds: 300 }),
      checkAuthRateLimit(`ip:${ip}`, "login", { limit: 20, windowSeconds: 300 }),
    ]);
    if (byEmail.error || byIp.error) {
      await db("system_logs").insert({
        level: "WARN",
        source: "AUTH_CORE",
        event_description: `Login rate limit exceeded for ${email}`,
        ip_address: ip,
      });
      return byEmail.error ?? byIp.error;
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

    // Check if MFA is enabled. Guard against two_factor_enabled=true with no
    // secret configured (legacy/seed data predating real TOTP) — that state
    // can never produce a valid code, so self-heal it rather than locking
    // the account out at the MFA prompt.
    if (user.two_factor_enabled && !user.two_factor_secret) {
      await db("users").where({ id: user.id }).update({ two_factor_enabled: false });
      user.two_factor_enabled = false;
    }

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

    // Track the session so the user can review/revoke it later
    const [sessionRow] = await db("user_sessions")
      .insert({
        user_id: user.id,
        user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      })
      .returning("id");

    // Create session and return token
    const token = await createSession(user.id, user.role, sessionRow.id);

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
