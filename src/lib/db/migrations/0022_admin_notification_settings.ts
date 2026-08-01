import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("admin_profiles", (table) => {
    table.jsonb("notification_settings").defaultTo(JSON.stringify({
      systemAlerts: true,
      newRegistrations: true,
      complianceFlags: true,
      largeTransactions: true
    }));
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("admin_profiles", (table) => {
    table.dropColumn("notification_settings");
  });
}
