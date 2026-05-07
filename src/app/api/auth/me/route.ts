// GET /api/auth/me — return current authenticated user
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import type { User, Merchant, AdminProfile } from "@/lib/types";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await db<User>("users")
    .where({ id: session.userId })
    .select("id", "email", "first_name", "last_name", "role", "status", "last_login", "created_at")
    .first();

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Attach role-specific profile data
  let profile: Record<string, unknown> = {};

  if (user.role === "MERCHANT") {
    const merchant = await db<Merchant>("merchants")
      .where({ user_id: user.id })
      .select(
        "id",
        "business_name",
        "merchant_display_id",
        "tier",
        "region",
        "available_balance",
        "balance_currency"
      )
      .first();
    profile = { merchant };
  } else if (user.role === "ADMIN") {
    const admin = await db<AdminProfile>("admin_profiles")
      .where({ user_id: user.id })
      .select("id", "admin_id_display")
      .first();
    profile = { admin };
  }

  return Response.json({ user, ...profile });
}
