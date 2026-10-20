import type { Knex } from "knex";

/**
 * Migration 0035 — System ledger account uniqueness
 *
 * ledger_accounts has UNIQUE (owner_id, account_type, currency), but Postgres
 * treats NULLs as distinct, so that constraint does NOT cover system accounts
 * (ESCROW / PSP_FEE / SETTLEMENT_PENDING, which all have owner_id IS NULL).
 * ensureLedgerAccount is a read-then-insert, so two concurrent settlements
 * that both miss on the SELECT could each insert a system account, splitting
 * that account's balance across duplicate rows.
 *
 * This consolidates any duplicates that already exist (keeping the oldest row
 * and repointing its entries) and adds a partial unique index so the race
 * becomes a no-op conflict instead of a duplicate row.
 *
 * Merchant-owned accounts were never at risk — owner_id is non-null there, so
 * the original constraint applies.
 */

export async function up(knex: Knex): Promise<void> {
  // 1. Repoint entries from duplicate system accounts onto the survivor
  //    (oldest row per account_type+currency).
  await knex.raw(`
    WITH ranked AS (
      SELECT
        id,
        account_type,
        currency,
        FIRST_VALUE(id) OVER (
          PARTITION BY account_type, currency
          ORDER BY created_at, id
        ) AS keep_id
      FROM ledger_accounts
      WHERE owner_id IS NULL
    )
    UPDATE ledger_entries le
    SET account_id = r.keep_id
    FROM ranked r
    WHERE le.account_id = r.id
      AND r.id <> r.keep_id
  `);

  // 2. Drop the now-empty duplicates.
  await knex.raw(`
    WITH ranked AS (
      SELECT
        id,
        FIRST_VALUE(id) OVER (
          PARTITION BY account_type, currency
          ORDER BY created_at, id
        ) AS keep_id
      FROM ledger_accounts
      WHERE owner_id IS NULL
    )
    DELETE FROM ledger_accounts la
    USING ranked r
    WHERE la.id = r.id
      AND r.id <> r.keep_id
  `);

  // 3. Close the gap: one system account per (account_type, currency).
  await knex.raw(`
    CREATE UNIQUE INDEX "ledger_accounts_system_unique"
    ON "ledger_accounts" ("account_type", "currency")
    WHERE "owner_id" IS NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "ledger_accounts_system_unique"`);
}
