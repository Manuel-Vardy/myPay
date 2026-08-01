import type { Knex } from "knex";

/**
 * Migration 0012 — Ledger System
 *
 * Creates the double-entry ledger: accounts, immutable entries, and a
 * convenience view that derives balances from entry sums.
 */

export async function up(knex: Knex): Promise<void> {
  // Enums
  await knex.raw(`
    CREATE TYPE "ledger_account_type" AS ENUM (
      'MERCHANT_FLOAT', 'PSP_FEE', 'ESCROW',
      'SETTLEMENT_PENDING', 'SUSPENSE', 'CHARGEBACK_RESERVE'
    )
  `);

  await knex.raw(`
    CREATE TYPE "ledger_entry_type" AS ENUM ('DEBIT', 'CREDIT')
  `);

  // -- ledger_accounts --
  await knex.schema.createTable("ledger_accounts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("owner_id").nullable(); // merchant id; null for system accounts
    table.specificType("account_type", "ledger_account_type").notNullable();
    table.string("currency", 10).notNullable();
    table.string("label", 255).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(["owner_id", "account_type", "currency"]);
  });

  // -- ledger_entries (IMMUTABLE — no updated_at) --
  await knex.schema.createTable("ledger_entries", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("entry_id_display", 80).notNullable().unique();
    table
      .uuid("transaction_id")
      .nullable()
      .references("id")
      .inTable("transactions")
      .onDelete("RESTRICT");
    table
      .uuid("account_id")
      .notNullable()
      .references("id")
      .inTable("ledger_accounts");
    table.specificType("entry_type", "ledger_entry_type").notNullable();
    // Fiat: minor units (pesewas/cents)
    table.bigInteger("amount").notNullable();
    table.string("currency", 10).notNullable();
    // Crypto supplement (null for fiat entries)
    table.decimal("crypto_amount", 36, 18).nullable();
    table.string("crypto_currency", 20).nullable();
    table.text("description").nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    // NO updated_at — ledger entries are immutable
  });

  await knex.raw(`CREATE INDEX "ledger_entries_account_id_index" ON "ledger_entries" ("account_id")`);
  await knex.raw(`CREATE INDEX "ledger_entries_transaction_id_index" ON "ledger_entries" ("transaction_id")`);
  await knex.raw(`CREATE INDEX "ledger_entries_created_at_index" ON "ledger_entries" ("created_at")`);

  // Check constraint: amount must be positive
  await knex.raw(`ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_amount_positive" CHECK (amount > 0)`);

  // -- ledger_account_balances VIEW --
  await knex.raw(`
    CREATE VIEW "ledger_account_balances" AS
    SELECT
      la.id               AS account_id,
      la.owner_id,
      la.account_type,
      la.currency,
      COALESCE(SUM(
        CASE
          WHEN le.entry_type = 'CREDIT' THEN le.amount
          ELSE -le.amount
        END
      ), 0)               AS balance
    FROM ledger_accounts la
    LEFT JOIN ledger_entries le ON le.account_id = la.id
    GROUP BY la.id, la.owner_id, la.account_type, la.currency
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP VIEW IF EXISTS "ledger_account_balances"`);
  await knex.schema.dropTableIfExists("ledger_entries");
  await knex.schema.dropTableIfExists("ledger_accounts");
  await knex.raw(`DROP TYPE IF EXISTS "ledger_entry_type"`);
  await knex.raw(`DROP TYPE IF EXISTS "ledger_account_type"`);
}
