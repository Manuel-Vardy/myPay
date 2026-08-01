// POST /api/auth/mfa — verify MFA token
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import type { User } from "@/lib/types";
import { createSession } from "@/lib/session";
import { verifyTotpToken, consumeBackupCode } from "@/lib/mfa";
import { checkAuthRateLimit } from "@/lib/guards";

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

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const [byUser, byIp] = await Promise.all([
      checkAuthRateLimit(`user:${user_id}`, "mfa_verify", { limit: 5, windowSeconds: 300 }),
      checkAuthRateLimit(`ip:${ip}`, "mfa_verify", { limit: 20, windowSeconds: 300 }),
    ]);
    if (byUser.error || byIp.error) {
      // Look up the user only to attribute the log entry — actor_id has a FK
      // to users, and user_id here is attacker-controlled and may not exist.
      const knownUser = await db<User>("users").where({ id: user_id }).first("id");
      await db("system_logs").insert({
        level: "WARN",
        source: "AUTH_CORE",
        event_description: `MFA rate limit exceeded for user_id ${user_id}`,
        actor_id: knownUser?.id ?? null,
        ip_address: ip,
      });
      return byUser.error ?? byIp.error;
    }

    const user = await db<User>("users").where({ id: user_id }).first();

    if (!user || !user.two_factor_enabled) {
      return Response.json(
        { error: "Invalid user or MFA not enabled" },
        { status: 400 }
      );
    }

    // Data-integrity guard: an account can end up with two_factor_enabled=true
    // but no secret (e.g. legacy/seed rows from before real TOTP existed).
    // That combination is an unrecoverable lockout, not a valid MFA state —
    // self-heal by treating it as not actually enabled rather than demanding
    // a code the user could never have received.
    if (!user.two_factor_secret) {
      await db("users").where({ id: user.id }).update({ two_factor_enabled: false });
      await db("system_logs").insert({
        level: "WARN",
        source: "AUTH_CORE",
        event_description: `${user.email} had two_factor_enabled with no secret configured — auto-disabled`,
        actor_id: user.id,
      });
      return Response.json(
        { error: "MFA was not fully configured on this account and has been disabled. Please sign in again." },
        { status: 400 }
      );
    }

    let isValid = await verifyTotpToken(user.two_factor_secret, token);
    let usedBackupCode = false;

    if (!isValid) {
      const updatedCodes = consumeBackupCode(user.two_factor_backup_codes, token);
      if (updatedCodes) {
        isValid = true;
        usedBackupCode = true;
        await db("users")
          .where({ id: user.id })
          .update({ two_factor_backup_codes: JSON.stringify(updatedCodes) });
      }
    }

    if (!isValid) {
      await db("system_logs").insert({
        level: "WARN",
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

    if (usedBackupCode) {
      await db("system_logs").insert({
        level: "WARN",
        source: "AUTH_CORE",
        event_description: `User ${user.email} logged in with a backup code`,
        actor_id: user.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      });
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

    // Track the session so the user can review/revoke it later
    const [sessionRow] = await db("user_sessions")
      .insert({
        user_id: user.id,
        user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      })
      .returning("id");

    // Create session after successful MFA
    const sessionToken = await createSession(user.id, user.role, sessionRow.id);

    return Response.json({
      token: sessionToken,
      backup_code_used: usedBackupCode,
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
