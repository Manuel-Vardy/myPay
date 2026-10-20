import type { Knex } from "knex";

/**
 * Migration 0050 — Enforce lowercase users.email
 *
 * Email lookups use equality (`where({ email })`) against the unique index, so
 * a mixed-case row would be unreachable from login and would let `Foo@x.com`
 * and `foo@x.com` register as separate accounts. App code normalizes with
 * `normalizeEmail` (src/lib/email-validation.ts); this makes it a hard
 * guarantee. NULL (phone-only payer accounts) passes the check.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE users ADD CONSTRAINT users_email_lowercase CHECK (email = lower(email))"
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_lowercase");
}
