import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/guards";
import db from "@/lib/db";

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { session } = guard;

  try {
    const { first_name, last_name } = await request.json();

    if (!first_name || !last_name) {
      return Response.json({ error: "First name and last name are required" }, { status: 400 });
    }

    await db("users")
      .where({ id: session.userId })
      .update({
        first_name,
        last_name,
        updated_at: new Date(),
      });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
