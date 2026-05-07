// GET /api/admin/roles — list all roles with their permissions
// PUT /api/admin/roles — update role permissions
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const roles = await db("roles")
      .select("roles.*")
      .orderBy("roles.name");

    // Fetch permissions for each role
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role: { id: string }) => {
        const permissions = await db("role_permissions")
          .join("permissions", "role_permissions.permission_id", "permissions.id")
          .where("role_permissions.role_id", role.id)
          .select("permissions.id", "permissions.name", "permissions.description");
        return { ...role, permissions };
      })
    );

    // Also return all available permissions for the UI
    const allPermissions = await db("permissions").select("*").orderBy("name");

    return Response.json({
      roles: rolesWithPermissions,
      available_permissions: allPermissions,
    });
  } catch (error) {
    console.error("Admin roles GET error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const body = await request.json();
    const { role_id, permission_ids } = body;

    if (!role_id || !Array.isArray(permission_ids)) {
      return Response.json(
        { error: "role_id and permission_ids (array) are required" },
        { status: 400 }
      );
    }

    const role = await db("roles").where({ id: role_id }).first();
    if (!role) {
      return Response.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Replace all permissions for this role
    await db.transaction(async (trx) => {
      await trx("role_permissions").where({ role_id }).del();
      if (permission_ids.length > 0) {
        await trx("role_permissions").insert(
          permission_ids.map((pid: string) => ({
            role_id,
            permission_id: pid,
          }))
        );
      }

      await trx("system_logs").insert({
        level: "INFO",
        source: "AUTH_CORE",
        event_description: `Permissions updated for role "${role.name}" (${permission_ids.length} permissions)`,
      });
    });

    return Response.json({
      message: `Permissions updated for role "${role.name}"`,
    });
  } catch (error) {
    console.error("Admin roles PUT error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
