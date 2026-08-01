import type { Knex } from "knex";

/**
 * Migration 0021 — transactions.failure_reason
 *
 * Human-readable summary of why a transaction FAILED/EXPIRED, set at the
 * moment of the terminal transition. Consistent with the failure_reason
 * columns on settlements and refunds. The full step-by-step history
 * (including raw provider payloads) lives in transaction_events.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.string("failure_reason", 500).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("failure_reason");
  });
}
