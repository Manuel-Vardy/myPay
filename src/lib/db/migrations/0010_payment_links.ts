import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("payment_links", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("link_id_display", 80).notNullable().unique();
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("RESTRICT");
    table.string("title", 100).notNullable();
    table.string("description", 500).nullable();
    table.decimal("amount", 18, 6).notNullable();
    table.string("currency", 10).notNullable().defaultTo("GHS");
    table.string("redirect_url", 2048).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("expires_at").nullable();
    table.timestamps(true, true);

    table.index(["merchant_id", "is_active"]);
    table.index(["created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("payment_links");
}
