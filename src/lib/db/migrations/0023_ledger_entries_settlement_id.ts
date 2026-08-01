import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("ledger_entries", (table) => {
    table
      .uuid("settlement_id")
      .nullable()
      .references("id")
      .inTable("settlements")
      .onDelete("RESTRICT");
  });

  await knex.raw(`CREATE INDEX "ledger_entries_settlement_id_index" ON "ledger_entries" ("settlement_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "ledger_entries_settlement_id_index"`);
  await knex.schema.alterTable("ledger_entries", (table) => {
    table.dropColumn("settlement_id");
  });
}
