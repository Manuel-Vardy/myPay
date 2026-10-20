import type { Knex } from "knex";

/**
 * Migration 0043 — backfill admin_roles for unmapped admin profiles
 *
 * When RBAC enforcement shipped (requirePermission guards on API routes),
 * admin_profiles that had no corresponding admin_roles entry were locked out
 * because getAdminPermissionsAndRoles returned isSuperAdmin: false with no
 * permissions.
 *
 * The seed file maps admin@trite.io → Super Admin, but only runs locally.
 * This migration ensures every admin profile that has *zero* role assignments
 * is granted the Super Admin role so no existing operator loses access.
 *
 * Idempotent: admins that already have at least one role are left untouched.
 */

export async function up(knex: Knex): Promise<void> {
  const superAdmin = await knex("roles")
    .where({ name: "Super Admin" })
    .first("id");

  if (!superAdmin) {
    // Role table hasn't been populated yet (migration 0042 handles that).
    // Nothing to do — the code-level fallback in guards.ts covers this.
    return;
  }

  // Find admin profiles with zero role assignments
  const unmapped: { id: string }[] = await knex("admin_profiles")
    .leftJoin("admin_roles", "admin_profiles.id", "admin_roles.admin_profile_id")
    .whereNull("admin_roles.role_id")
    .select("admin_profiles.id");

  if (unmapped.length === 0) return;

  await knex("admin_roles")
    .insert(
      unmapped.map((ap) => ({
        admin_profile_id: ap.id,
        role_id: superAdmin.id,
      }))
    )
    .onConflict(["admin_profile_id", "role_id"])
    .ignore();
}

export async function down(knex: Knex): Promise<void> {
  // Intentional no-op: removing a Super Admin grant during a rollback would
  // lock operators out of the admin portal, which is the exact problem this
  // migration fixes.
}
