import type { Knex } from "knex";

/**
 * Migration 0031 — Optional payment link amounts
 *
 * A NULL payment_links.amount means the customer enters the amount at
 * checkout (link currency applies, defaulting to GHS). The payment_session
 * created from such a link still always has a concrete amount — it is
 * collected before the session exists.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE "payment_links" ALTER COLUMN "amount" DROP NOT NULL`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex("payment_links").whereNull("amount").update({ amount: 0 });
  await knex.raw(
    `ALTER TABLE "payment_links" ALTER COLUMN "amount" SET NOT NULL`
  );
}
