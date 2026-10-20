import type { Knex } from "knex";

/**
 * Migration 0042 — admin roles and permissions as deployable data
 *
 * `permissions` and `roles` are created empty by 0002; every row has only ever
 * come from `seeds/02_platform_data.ts`. Prod runs `knex migrate:latest` and
 * never seeds, and that seed cannot be run there anyway — it opens by deleting
 * transactions, settlements, kyc_records, admin_roles, role_permissions,
 * permissions and roles, which against prod destroys live payment data.
 *
 * So when RBAC enforcement shipped, the permission names the routes check for
 * had no path into the production database. Every route gated on a name that
 * isn't there returns 403 to everyone except Super Admin (who bypasses the
 * check), and the roles UI has no rows to offer for assignment.
 *
 * This makes the reference data deployable. Prod currently holds the six
 * permissions that predate RBAC enforcement (manage-merchants, approve-kyc,
 * refund-transactions, view-logs, manage-roles, settlement-monitoring) and is
 * missing manage-customers, manage-fees and manage-integrations. It is still
 * written to converge from any starting state — empty, partially seeded, or
 * fully seeded — so it stays correct as environments drift apart:
 *
 * - Rows are matched by name (unique on both tables), never by id, so ids
 *   already in use are preserved and existing grants keep working.
 * - Inserts are ON CONFLICT DO NOTHING, so re-running changes nothing.
 * - Descriptions of existing permissions are left alone. An operator may have
 *   edited them; this migration's job is to guarantee the row exists, not to
 *   impose wording.
 * - Grants are only added, never revoked. If someone has deliberately narrowed
 *   a role in production, that decision survives.
 *
 * Keep in step with seeds/02_platform_data.ts — the seed remains the source of
 * truth for a fresh local database, this is how the same data reaches prod.
 */

const ROLES: { name: string; description: string; is_system_role: boolean }[] = [
  { name: "Super Admin", description: "Unrestricted platform-wide access", is_system_role: true },
  { name: "Compliance Officer", description: "KYC approval and regulatory monitoring", is_system_role: true },
  { name: "Support Agent", description: "Ticket resolution and transaction view", is_system_role: true },
  { name: "Read-only Audit", description: "Observer access for external auditors", is_system_role: false },
];

const PERMISSIONS: { name: string; description: string }[] = [
  { name: "manage-merchants", description: "Add, edit, suspend, or manage merchant accounts." },
  { name: "manage-customers", description: "View and manage end-payer customer profiles." },
  { name: "approve-kyc", description: "Review identity documents and verify profiles." },
  { name: "refund-transactions", description: "Authorize reversal of funds." },
  { name: "view-logs", description: "Access detailed activity history." },
  { name: "manage-roles", description: "Create or modify permission groups." },
  { name: "settlement-monitoring", description: "Real-time view of bank transfer flows." },
  { name: "manage-fees", description: "Configure platform revenue models and fee structures." },
  { name: "manage-integrations", description: "Configure external provider credentials." },
];

/** Super Admin is granted everything, so it is derived rather than listed. */
const ROLE_GRANTS: Record<string, string[]> = {
  "Compliance Officer": [
    "manage-merchants",
    "manage-customers",
    "approve-kyc",
    "view-logs",
    "settlement-monitoring",
  ],
  "Support Agent": ["view-logs", "manage-customers"],
  "Read-only Audit": ["view-logs"],
};

export async function up(knex: Knex): Promise<void> {
  await knex("roles")
    .insert(ROLES)
    .onConflict("name")
    .ignore();

  await knex("permissions")
    .insert(PERMISSIONS)
    .onConflict("name")
    .ignore();

  // Re-read: rows that already existed keep their original ids, and those are
  // the ids the grants have to reference.
  const roleIds = new Map<string, string>(
    (await knex("roles").select("id", "name")).map((r) => [r.name, r.id])
  );
  const permissionIds = new Map<string, string>(
    (await knex("permissions").select("id", "name")).map((p) => [p.name, p.id])
  );

  const grants: { role_id: string; permission_id: string }[] = [];

  const superAdminId = roleIds.get("Super Admin");
  if (superAdminId) {
    for (const { name } of PERMISSIONS) {
      const permissionId = permissionIds.get(name);
      if (permissionId) grants.push({ role_id: superAdminId, permission_id: permissionId });
    }
  }

  for (const [roleName, permissionNames] of Object.entries(ROLE_GRANTS)) {
    const roleId = roleIds.get(roleName);
    if (!roleId) continue;
    for (const permissionName of permissionNames) {
      const permissionId = permissionIds.get(permissionName);
      if (permissionId) grants.push({ role_id: roleId, permission_id: permissionId });
    }
  }

  if (grants.length > 0) {
    await knex("role_permissions")
      .insert(grants)
      .onConflict(["role_id", "permission_id"])
      .ignore();
  }
}

export async function down(knex: Knex): Promise<void> {
  // Only the permissions this migration introduced are removed. The older four
  // predate it, and dropping roles or their grants would revoke access an
  // operator may have assigned by hand since — a rollback should not lock
  // people out of the admin portal.
  const introduced = ["manage-fees", "manage-integrations", "manage-customers"];

  const ids = (
    await knex("permissions").whereIn("name", introduced).select("id")
  ).map((p: { id: string }) => p.id);

  if (ids.length > 0) {
    // role_permissions cascades on permission delete (0002).
    await knex("permissions").whereIn("id", ids).del();
  }
}
