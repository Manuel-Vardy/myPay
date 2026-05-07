// POST /api/auth/register — merchant self-serve registration
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, business_name, first_name, last_name, legal_entity, region } = body;

    if (!email || !password || !business_name || !first_name || !last_name || !legal_entity) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db("users").where({ email }).first();
    if (existing) {
      return Response.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const password_hash = await hashPassword(password);

    // Create user + merchant in a transaction
    const result = await db.transaction(async (trx) => {
      const [user] = await trx("users")
        .insert({
          email,
          password_hash,
          first_name,
          last_name,
          role: "MERCHANT",
          status: "PENDING", // requires KYC approval
        })
        .returning("*");

      // Generate merchant display ID
      const count = await trx("merchants").count("id as cnt").first();
      const seq = Number(count?.cnt || 0) + 1;
      const merchant_display_id = `MID-${String(seq).padStart(4, "0")}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      const [merchant] = await trx("merchants")
        .insert({
          user_id: user.id,
          business_name,
          legal_entity,
          merchant_display_id,
          region: region || null,
        })
        .returning("*");

      // Create a KYC record for the new merchant
      const identity_id = `TR-${String(seq).padStart(4, "0")}-KYC-${Math.floor(Math.random() * 100)}`;
      await trx("kyc_records").insert({
        user_id: user.id,
        identity_id,
        tier: "MERCHANT",
        status: "PENDING",
      });

      // Log the event
      await trx("system_logs").insert({
        level: "INFO",
        source: "AUTH_CORE",
        event_description: `New merchant registered: ${business_name} (${email})`,
        actor_id: user.id,
      });

      return { user, merchant };
    });

    // Create session for the new user
    const token = await createSession(result.user.id, result.user.role);

    return Response.json(
      {
        message: "Registration successful. Account is pending KYC verification.",
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
        },
        merchant: {
          id: result.merchant.id,
          merchant_display_id: result.merchant.merchant_display_id,
          business_name: result.merchant.business_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
