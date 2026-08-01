import type { Knex } from "knex";

/**
 * Migration 0032 — Withdrawal Requests
 *
 * Manually initiated withdrawals (merchant dashboard "Withdraw Funds") now
 * require admin approval before they are settled. A request holds its amount
 * against the merchant's withdrawable balance while PENDING/PROCESSING so the
 * auto-settlement cron cannot sweep the funds out from under it.
 *
 * Status flow: PENDING → PROCESSING (admin approval claimed the request)
 *   → APPROVED (payout initiated via processSettlement; outcome lives on the
 *     linked settlement row)
 *   → REJECTED (admin declined; funds released back to withdrawable)
 *   → FAILED (payout provider definitively declined; funds already returned
 *     to the merchant float by processSettlement)
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE "withdrawal_request_status" AS ENUM (
      'PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'FAILED'
    )
  `);

  await knex.schema.createTable("withdrawal_requests", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("request_id_display", 80).notNullable().unique(); // e.g. WDR-20260718-A1B2C3
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table
      .uuid("settlement_account_id")
      .notNullable()
      .references("id")
      .inTable("settlement_accounts")
      .onDelete("RESTRICT");
    // Minor units (pesewas), same convention as the ledger
    table.bigInteger("amount").notNullable();
    table.string("currency", 10).notNullable().defaultTo("GHS");
    table
      .specificType("status", "withdrawal_request_status")
      .notNullable()
      .defaultTo("PENDING");
    // Set once the approval creates a settlement (payout outcome lives there)
    table
      .uuid("settlement_id")
      .nullable()
      .references("id")
      .inTable("settlements")
      .onDelete("SET NULL");
    table.uuid("reviewed_by").nullable().references("id").inTable("users");
    table.timestamp("reviewed_at", { useTz: true }).nullable();
    table.text("review_note").nullable();
    table.text("failure_reason").nullable();
    table.timestamps(true, true);

    table.index(["merchant_id", "status"]);
    table.index(["status"]);
    table.index(["created_at"]);
  });

  await knex.raw(
    `ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_amount_positive" CHECK (amount > 0)`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("withdrawal_requests");
  await knex.raw(`DROP TYPE IF EXISTS "withdrawal_request_status"`);
}
