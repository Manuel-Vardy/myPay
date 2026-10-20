import type { Knex } from "knex";

/**
 * Migration 0039 — kyc_records.submitted_at means "actually submitted"
 *
 * The column was NOT NULL DEFAULT CURRENT_TIMESTAMP, so it was stamped the
 * moment the record was created — at registration (api/auth/register) or on
 * the merchant's first document upload (api/merchant/kyc/upload). Nothing
 * therefore distinguished "record exists, merchant is still uploading" from
 * "merchant submitted, awaiting review", since both sit in status PENDING
 * with a submitted_at set.
 *
 * Two things broke on that ambiguity:
 *  - The merchant KYC tab disabled "Submit for Review" on status === PENDING,
 *    which was true from registration onward, so submission was unreachable.
 *  - The admin KYC queue lists by status, so every registered merchant showed
 *    up as pending review before uploading anything.
 *
 * Making the column nullable lets submit/ be the only writer, so a NULL means
 * "not submitted yet".
 *
 * Backfill: PENDING records are reset to NULL. Submission has never been
 * reachable through the UI, so a PENDING row cannot represent a real
 * submission. Records an admin has already acted on (IN_REVIEW / APPROVED /
 * REJECTED) keep their timestamp.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("kyc_records", (table) => {
    table.timestamp("submitted_at", { useTz: true }).nullable().alter();
  });

  // .alter() above rewrites the column definition and drops the default with
  // it; assert it explicitly so the intent survives a knex behaviour change.
  await knex.raw(`ALTER TABLE kyc_records ALTER COLUMN submitted_at DROP DEFAULT`);

  await knex("kyc_records").where({ status: "PENDING" }).update({ submitted_at: null });
}

export async function down(knex: Knex): Promise<void> {
  // NOT NULL cannot be restored while the rows this migration cleared are
  // still NULL, so refill them before tightening the column back up.
  await knex("kyc_records")
    .whereNull("submitted_at")
    .update({ submitted_at: knex.fn.now() });

  await knex.schema.alterTable("kyc_records", (table) => {
    table
      .timestamp("submitted_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
      .alter();
  });
}
