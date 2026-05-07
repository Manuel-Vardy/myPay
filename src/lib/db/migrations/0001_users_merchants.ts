import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- Enable uuid-ossp extension ---
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // --- users ---
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table
      .enum("role", ["ADMIN", "MERCHANT", "USER"], {
        useNative: true,
        enumName: "user_role",
      })
      .notNullable();
    table.boolean("two_factor_enabled").notNullable().defaultTo(false);
    table.string("two_factor_secret", 255).nullable();
    table
      .enum("status", ["ACTIVE", "SUSPENDED", "PENDING"], {
        useNative: true,
        enumName: "user_status",
      })
      .notNullable()
      .defaultTo("ACTIVE");
    table.timestamp("last_login").nullable();
    table.timestamps(true, true); // created_at, updated_at
  });

  // --- admin_profiles ---
  await knex.schema.createTable("admin_profiles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("admin_id_display", 50).notNullable().unique(); // e.g. ADM-000001
    table.timestamps(true, true);
  });

  // --- merchants ---
  await knex.schema.createTable("merchants", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("business_name", 255).notNullable();
    table.string("merchant_display_id", 50).notNullable().unique(); // e.g. MID-9832-XP
    table
      .enum("tier", ["STANDARD", "PREMIUM", "ENTERPRISE", "INSTITUTIONAL"], {
        useNative: true,
        enumName: "merchant_tier",
      })
      .notNullable()
      .defaultTo("STANDARD");
    table.string("region", 100).nullable(); // e.g. GH, NG, US
    table.decimal("available_balance", 18, 6).notNullable().defaultTo(0);
    table.string("balance_currency", 10).notNullable().defaultTo("USDT");
    table.jsonb("api_keys").notNullable().defaultTo("[]"); // array of key objects
    table.jsonb("webhook_config").notNullable().defaultTo("{}");
    table.string("notification_email", 255).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("merchants");
  await knex.schema.dropTableIfExists("admin_profiles");
  await knex.schema.dropTableIfExists("users");
  await knex.raw("DROP TYPE IF EXISTS merchant_tier");
  await knex.raw("DROP TYPE IF EXISTS user_status");
  await knex.raw("DROP TYPE IF EXISTS user_role");
}
