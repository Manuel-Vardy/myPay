import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.string("first_name", 255).nullable();
    table.string("last_name", 255).nullable();
    table.string("mobile_number", 15).nullable();
    table.string("city", 40).nullable();
    table.string("country", 100).nullable();
  });

  await knex.schema.alterTable("merchants", (table) => {
    table.string("legal_entity", 255).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("legal_entity");
  });

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("first_name");
    table.dropColumn("last_name");
    table.dropColumn("mobile_number");
    table.dropColumn("city");
    table.dropColumn("country");
  });
}
