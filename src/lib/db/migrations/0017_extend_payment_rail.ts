import type { Knex } from "knex";

/**
 * Extend the payment_rail enum with new network-specific values
 * returned by the Triton /tokens catalog.
 *
 * Existing values are preserved for backward compatibility:
 *   USDT_TRC20, USDT_ERC20, USDC_ERC20
 *
 * New values added (token_NETWORK pattern):
 *   USDC_BASE, USDC_BSC, USDC_ETHEREUM, USDC_SOLANA
 *   USDT_BASE, USDT_BSC, USDT_ETHEREUM, USDT_SOLANA
 */

const NEW_RAILS = [
  "USDC_BASE",
  "USDC_BSC",
  "USDC_ETHEREUM",
  "USDC_SOLANA",
  "USDT_BASE",
  "USDT_BSC",
  "USDT_ETHEREUM",
  "USDT_SOLANA",
];

export async function up(knex: Knex): Promise<void> {
  for (const rail of NEW_RAILS) {
    // ADD VALUE is idempotent-safe in PG 13+ with IF NOT EXISTS
    await knex.raw(
      `ALTER TYPE "payment_rail" ADD VALUE IF NOT EXISTS '${rail}'`
    );
  }
}

export async function down(knex: Knex): Promise<void> {
  // PostgreSQL does not support DROP VALUE from an enum.
  // To truly revert, you'd need to recreate the type — not worth it.
  // Leaving the values in place is harmless.
}
