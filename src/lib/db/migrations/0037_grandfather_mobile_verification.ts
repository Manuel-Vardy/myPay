import type { Knex } from "knex";

/**
 * Migration 0037 — grandfather pre-existing merchants past the mobile gate
 *
 * Renumbered from 0034, which collided with 0034_payment_controls. A merge
 * briefly resurrected the 0034-numbered copy, so this backfill ran twice in
 * some environments; if you see merchants stamped as verified who never
 * received an SMS, that is why.
 *
 * 0033 added `mobile_verified_at` as NULL for every row, and the dashboard
 * hard-gates merchants whose number isn't verified. That locked out every
 * merchant who registered before mobile collection existed: they were bounced
 * to /verify-phone, and those with no `mobile_number` on file had no way to
 * send themselves a code — a dead end.
 *
 * Mobile verification is a signup step, so it should only ever apply to
 * accounts created after it shipped. This stamps every merchant that exists
 * at migration time as verified. The timestamp records when the account was
 * grandfathered, NOT a real SMS confirmation — nothing was sent for these.
 * Accounts created after this runs get NULL and go through /verify-phone.
 */
export async function up(knex: Knex): Promise<void> {
  await knex("users")
    .where({ role: "MERCHANT" })
    .whereNull("mobile_verified_at")
    .update({ mobile_verified_at: knex.fn.now() });
}

export async function down(): Promise<void> {
  // No-op: grandfathered rows are indistinguishable from genuinely verified
  // ones, so re-nulling them would revoke real verifications too.
}
