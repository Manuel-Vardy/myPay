import type { Knex } from "knex";

/**
 * Migration 0030 — Fee bearer
 *
 * Lets a merchant choose whether the platform processing fee is absorbed
 * by the merchant (default, current behavior) or passed on to the payer
 * at checkout. transactions.fee_basis_amount freezes the pre-fee order
 * amount so chargeTransactionFee keeps computing the fee off the right
 * basis even when `amount` was inflated to include a customer-paid fee.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE TYPE "fee_bearer" AS ENUM ('MERCHANT', 'CUSTOMER')`);

  await knex.schema.alterTable("merchants", (table) => {
    table
      .specificType("fee_bearer", "fee_bearer")
      .notNullable()
      .defaultTo("MERCHANT");
  });

  await knex.schema.alterTable("transactions", (table) => {
    table.bigInteger("fee_basis_amount").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("fee_basis_amount");
  });
  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("fee_bearer");
  });
  await knex.raw(`DROP TYPE IF EXISTS "fee_bearer"`);
}
