import type { Knex } from "knex";

/**
 * Migration 0040 — widen kyc_records.process_time_ms to bigint
 *
 * process_time_ms stores review turnaround as `now - submitted_at` in
 * milliseconds (see PATCH /api/admin/kyc/[id]). The column was created as
 * `integer` (int4, max 2,147,483,647) in migration 0004, which caps out at
 * ~24.86 days. A KYC that sits in the queue longer than that overflows the
 * column on approve/reject and Postgres rejects the write with
 * "value ... is out of range for type integer", blocking the compliance
 * decision entirely.
 *
 * Review queues legitimately span weeks, so the millisecond turnaround needs
 * bigint headroom. Widening int4 -> int8 is a safe, lossless change.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("kyc_records", (table) => {
    table.bigInteger("process_time_ms").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Revert to integer. Any rows whose value exceeds the int4 range would fail
  // to cast, so clamp them to NULL first to keep the down migration reversible.
  await knex("kyc_records")
    .where("process_time_ms", ">", 2147483647)
    .update({ process_time_ms: null });

  await knex.schema.alterTable("kyc_records", (table) => {
    table.integer("process_time_ms").nullable().alter();
  });
}
