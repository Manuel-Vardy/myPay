import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- customer_tier enum ---
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE customer_tier AS ENUM ('standard', 'enterprise', 'institutional');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);

  // --- customer_status enum ---
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE customer_status AS ENUM ('active', 'inactive');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);

  // --- customers table ---
  // Global customer record linked to the users table.
  // Personal info (email, name, phone, etc.) lives on the `users` row.
  // This table holds merchant-specific relationship data (tier, notes, spend).
  await knex.schema.createTable("customers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .specificType("tier", "customer_tier")
      .notNullable()
      .defaultTo("standard");
    table
      .specificType("status", "customer_status")
      .notNullable()
      .defaultTo("active");
    table.decimal("total_spent", 18, 6).notNullable().defaultTo(0);
    table.integer("transaction_count").notNullable().defaultTo(0);
    table.timestamp("last_transaction_at").nullable();
    table.text("notes").nullable();
    table.timestamps(true, true);

    // One customer record per user per merchant
    table.unique(["merchant_id", "user_id"]);
    table.index(["merchant_id", "created_at"]);
    table.index(["user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("customers");
  await knex.raw("DROP TYPE IF EXISTS customer_status");
  await knex.raw("DROP TYPE IF EXISTS customer_tier");
}
