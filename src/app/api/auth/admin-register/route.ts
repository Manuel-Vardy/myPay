// POST /api/auth/admin-register — admin institutional access request
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, institution, phone, designated_role } = body;

    if (!email || !password || !institution || !designated_role) {
      return Response.json(
        { error: "Email, password, institution name, and designated role are required" },
        { status: 400 }
      );
    }

    if (password.length < 16) {
      return Response.json(
        { error: "Passphrase must be at least 16 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db("users").where({ email }).first();
    if (existing) {
      return Response.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);

    // Create admin user with PENDING status — requires existing admin approval
    const result = await db.transaction(async (trx) => {
      const [user] = await trx("users")
        .insert({
          email,
          password_hash,
          role: "ADMIN",
          status: "PENDING", // requires approval from existing admin
        })
        .returning("*");

      // Generate admin display ID
      const count = await trx("admin_profiles").count("id as cnt").first();
      const seq = Number(count?.cnt || 0) + 1;
      const admin_id_display = `ADM-${String(seq).padStart(6, "0")}`;

      await trx("admin_profiles").insert({
        user_id: user.id,
        admin_id_display,
      });

      // Create a KYC record for the admin application
      const identity_id = `TR-ADM-${String(seq).padStart(4, "0")}-KYC`;
      await trx("kyc_records").insert({
        user_id: user.id,
        identity_id,
        tier: "STANDARD",
        status: "PENDING",
      });

      // Log the event
      await trx("system_logs").insert({
        level: "INFO",
        source: "AUTH_CORE",
        event_description: `Admin access requested: ${institution} — ${email} (${designated_role})`,
        actor_id: user.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      });

      return { user, admin_id_display };
    });

    return Response.json(
      {
        message: "Application submitted. Your access request is pending review.",
        admin_id: result.admin_id_display,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin registration error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
