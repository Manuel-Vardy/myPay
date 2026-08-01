import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/guards";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { session } = guard;

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json({ error: "Current password and new password are required" }, { status: 400 });
    }

    const user = await db("users").where({ id: session.userId }).select("password_hash").first();
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return Response.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db("users")
      .where({ id: session.userId })
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date(),
      });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    return Response.json({ error: "Failed to update password" }, { status: 500 });
  }
}
