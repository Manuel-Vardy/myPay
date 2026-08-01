import type { Knex } from "knex";

/**
 * Migration 0020 — Schema drift fixes vs knowledge/schema/psp_schema.sql
 *
 * - transactions.crypto_amount widened to numeric(36,18) (blueprint precision)
 * - transactions.crypto_currency widened to varchar(20), 'USDT' default dropped
 *   (application code sets the currency explicitly)
 * - payment_sessions.currency / settlements.currency defaults aligned to 'GHS'
 * - settlement_account_type gains MOBILE_WALLET (the value the app writes;
 *   0011 recreated the enum without it)
 * - missing indexes from the blueprint
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE "transactions" ALTER COLUMN "crypto_amount" TYPE numeric(36, 18)`
  );
  await knex.raw(
    `ALTER TABLE "transactions" ALTER COLUMN "crypto_currency" TYPE varchar(20)`
  );
  await knex.raw(
    `ALTER TABLE "transactions" ALTER COLUMN "crypto_currency" DROP DEFAULT`
  );

  await knex.raw(
    `ALTER TABLE "payment_sessions" ALTER COLUMN "currency" SET DEFAULT 'GHS'`
  );
  await knex.raw(
    `ALTER TABLE "settlements" ALTER COLUMN "currency" SET DEFAULT 'GHS'`
  );

  await knex.raw(
    `ALTER TYPE "settlement_account_type" ADD VALUE IF NOT EXISTS 'MOBILE_WALLET'`
  );

  await knex.raw(
    `CREATE INDEX IF NOT EXISTS "transactions_merchant_id_created_at_index" ON "transactions" ("merchant_id", "created_at")`
  );
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS "system_logs_actor_id_index" ON "system_logs" ("actor_id")`
  );
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS "payment_sessions_merchant_id_index" ON "payment_sessions" ("merchant_id")`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "payment_sessions_merchant_id_index"`);
  await knex.raw(`DROP INDEX IF EXISTS "system_logs_actor_id_index"`);
  await knex.raw(
    `DROP INDEX IF EXISTS "transactions_merchant_id_created_at_index"`
  );

  await knex.raw(
    `ALTER TABLE "settlements" ALTER COLUMN "currency" SET DEFAULT 'USDT'`
  );
  await knex.raw(
    `ALTER TABLE "payment_sessions" ALTER COLUMN "currency" SET DEFAULT 'USD'`
  );

  await knex.raw(
    `ALTER TABLE "transactions" ALTER COLUMN "crypto_currency" SET DEFAULT 'USDT'`
  );
  await knex.raw(
    `ALTER TABLE "transactions" ALTER COLUMN "crypto_currency" TYPE varchar(10)`
  );
  await knex.raw(
    `ALTER TABLE "transactions" ALTER COLUMN "crypto_amount" TYPE numeric(18, 6)`
  );

  // settlement_account_type: PG cannot drop enum values; MOBILE_WALLET stays.
}
