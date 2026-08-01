import type { Knex } from "knex";

/**
 * Migration 0025 — settlement_account_type gains BANK
 *
 * 0011 recreated the enum as (BANK_ACCOUNT, MOBILE_MONEY, CRYPTO_WALLET),
 * dropping the original BANK value. 0020 restored MOBILE_WALLET but missed
 * BANK, so creating a bank settlement account has been failing with an
 * enum error ever since — the app (merchant settlements UI, withdraw flow)
 * writes BANK, never BANK_ACCOUNT.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TYPE "settlement_account_type" ADD VALUE IF NOT EXISTS 'BANK'`
  );
}

export async function down(): Promise<void> {
  // PG cannot drop enum values; BANK stays.
}
