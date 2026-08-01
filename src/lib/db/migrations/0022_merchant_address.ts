import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.string("business_address_line1", 255).nullable();
    table.string("business_address_line2", 255).nullable();
    table.string("business_city", 100).nullable();
    table.string("business_region", 100).nullable();
    table.string("business_country", 100).nullable().defaultTo("GH");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("business_country");
    table.dropColumn("business_region");
    table.dropColumn("business_city");
    table.dropColumn("business_address_line2");
    table.dropColumn("business_address_line1");
  });
}
