import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- roles ---
  await knex.schema.createTable("roles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name", 100).notNullable().unique(); // e.g. Super Admin, Compliance Officer
    table.string("description", 500).nullable();
    table.boolean("is_system_role").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });

  // --- permissions ---
  await knex.schema.createTable("permissions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name", 100).notNullable().unique(); // e.g. MANAGE_USERS, APPROVE_KYC
    table.string("description", 500).nullable();
    table.timestamps(true, true);
  });

  // --- role_permissions (join table) ---
  await knex.schema.createTable("role_permissions", (table) => {
    table
      .uuid("role_id")
      .notNullable()
      .references("id")
      .inTable("roles")
      .onDelete("CASCADE");
    table
      .uuid("permission_id")
      .notNullable()
      .references("id")
      .inTable("permissions")
      .onDelete("CASCADE");
    table.primary(["role_id", "permission_id"]);
    table.timestamps(true, true);
  });

  // --- admin_roles (maps admins to roles) ---
  await knex.schema.createTable("admin_roles", (table) => {
    table
      .uuid("admin_profile_id")
      .notNullable()
      .references("id")
      .inTable("admin_profiles")
      .onDelete("CASCADE");
    table
      .uuid("role_id")
      .notNullable()
      .references("id")
      .inTable("roles")
      .onDelete("CASCADE");
    table.primary(["admin_profile_id", "role_id"]);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("admin_roles");
  await knex.schema.dropTableIfExists("role_permissions");
  await knex.schema.dropTableIfExists("permissions");
  await knex.schema.dropTableIfExists("roles");
}
