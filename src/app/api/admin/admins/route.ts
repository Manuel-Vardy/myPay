// GET  /api/admin/admins — list admin accounts and the roles assigned to them
// POST /api/admin/admins — create a new admin account and assign it role(s)
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const roleId = request.nextUrl.searchParams.get("role_id");

    const admins = await db("admin_profiles")
      .join("users", "admin_profiles.user_id", "users.id")
      .where("users.role", "ADMIN")
      .select(
        "admin_profiles.id as admin_profile_id",
        "users.id as user_id",
        "users.email",
        "users.status",
        "users.last_login",
        "users.created_at",
        "admin_profiles.admin_id_display"
      )
      .orderBy("users.created_at", "desc");

    // Attach assigned roles to each admin
    const adminIds = admins.map((a: { admin_profile_id: string }) => a.admin_profile_id);
    const roleRows = adminIds.length
      ? await db("admin_roles")
          .join("roles", "admin_roles.role_id", "roles.id")
          .whereIn("admin_roles.admin_profile_id", adminIds)
          .select("admin_roles.admin_profile_id", "roles.id", "roles.name")
      : [];

    let result = admins.map((a: any) => ({
      ...a,
      roles: roleRows
        .filter((r: any) => r.admin_profile_id === a.admin_profile_id)
        .map((r: any) => ({ id: r.id, name: r.name })),
    }));

    // Optional filter: only admins holding a specific role
    if (roleId) {
      result = result.filter((a: any) => a.roles.some((r: any) => r.id === roleId));
    }

    return Response.json({ data: result });
  } catch (error) {
    console.error("Admin admins GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const body = await request.json();
    const { email, password } = body;
    const role_ids: string[] = Array.isArray(body.role_ids) ? body.role_ids : [];

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (typeof password !== "string" || password.length < 12) {
      return Response.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }
    if (role_ids.length === 0) {
      return Response.json(
        { error: "At least one role must be assigned" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await db("users").where({ email: normalizedEmail }).first();
    if (existing) {
      return Response.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    // Validate all supplied roles exist before creating anything
    const foundRoles = await db("roles").whereIn("id", role_ids).select("id", "name");
    if (foundRoles.length !== role_ids.length) {
      return Response.json(
        { error: "One or more roles do not exist" },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(password);

    const created = await db.transaction(async (trx) => {
      const [user] = await trx("users")
        .insert({
          email: normalizedEmail,
          password_hash,
          role: "ADMIN",
          status: "ACTIVE",
        })
        .returning("*");

      // Generate the next admin display ID (ADM-000001 …)
      const count = await trx("admin_profiles").count("id as cnt").first();
      const seq = Number(count?.cnt || 0) + 1;
      const admin_id_display = `ADM-${String(seq).padStart(6, "0")}`;

      const [admin_profile] = await trx("admin_profiles")
        .insert({ user_id: user.id, admin_id_display })
        .returning("*");

      await trx("admin_roles").insert(
        role_ids.map((role_id) => ({
          admin_profile_id: admin_profile.id,
          role_id,
        }))
      );

      await trx("system_logs").insert({
        level: "INFO",
        source: "AUTH_CORE",
        event_description: `Admin account created: ${normalizedEmail} (${admin_id_display}) with roles: ${foundRoles
          .map((r: { name: string }) => r.name)
          .join(", ")}`,
        actor_id: guard.session.userId,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      });

      return { user, admin_id_display, admin_profile_id: admin_profile.id };
    });

    return Response.json(
      {
        message: "Admin account created",
        admin: {
          user_id: created.user.id,
          email: normalizedEmail,
          admin_id_display: created.admin_id_display,
          roles: foundRoles,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin admins POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
