import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.jsonb("notification_settings").defaultTo(JSON.stringify({
      transactions: true,
      systemUpdates: true,
      marketing: false
    }));
  });

  await knex.schema.alterTable("users", (table) => {
    table.jsonb("passkeys").defaultTo(JSON.stringify([]));
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("notification_settings");
  });

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("passkeys");
  });
}
