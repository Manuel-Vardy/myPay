import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- settlement_accounts ---
  await knex.schema.createTable("settlement_accounts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table
      .enum("account_type", ["BANK", "MOBILE_WALLET"], {
        useNative: true,
        enumName: "settlement_account_type",
      })
      .notNullable();
    table.string("provider_name", 100).notNullable(); // e.g. "GCB Bank", "MTN MoMo"
    table.string("account_name", 255).notNullable();
    table.string("account_number", 50).notNullable();
    table.string("branch_code", 20).nullable(); // typically for bank accounts
    table.boolean("is_default").notNullable().defaultTo(false);
    table.timestamps(true, true);
    
    table.index(["merchant_id"]);
  });

  // --- settlements table modifications ---
  await knex.schema.alterTable("settlements", (table) => {
    table
      .uuid("account_id")
      .nullable() // Nullable initially since existing data won't have it
      .references("id")
      .inTable("settlement_accounts")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("settlements", (table) => {
    table.dropColumn("account_id");
  });
  
  await knex.schema.dropTableIfExists("settlement_accounts");
  await knex.raw("DROP TYPE IF EXISTS settlement_account_type");
}
