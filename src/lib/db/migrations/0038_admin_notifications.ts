import type { Knex } from "knex";

/**
 * Migration 0038 — durable admin notification feed
 *
 * `admin_profiles.notification_settings` (0022) already lets each admin opt
 * into systemAlerts / newRegistrations / complianceFlags / largeTransactions,
 * but nothing ever produced a notification — the portal's bell rendered a
 * hardcoded list. This is the store behind it.
 *
 * Rows are per-admin rather than global so read state is per person, and the
 * feed survives an email outage: when the alert is *about* email delivery
 * failing, this table is the only channel that still works.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("admin_notifications", (table) => {
    table.bigIncrements("id").primary();
    table
      .uuid("admin_user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    // Maps to a key in admin_profiles.notification_settings, so an admin only
    // receives categories they've opted into.
    table.string("category", 50).notNullable();
    table.string("severity", 20).notNullable().defaultTo("INFO");
    table.string("title", 200).notNullable();
    table.text("message").notNullable();
    // Collapses repeats of the same underlying fault (e.g. a provider outage
    // firing on every signup) into one notification per window.
    table.string("dedupe_key", 200).nullable();
    table.jsonb("metadata").notNullable().defaultTo("{}");
    table.timestamp("read_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(["admin_user_id", "read_at"]);
    table.index(["dedupe_key", "created_at"]);
    table.index(["created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("admin_notifications");
}
