import type { Knex } from "knex";

/**
 * Migration 0028 — real TOTP support for MFA
 *
 * `two_factor_secret` already existed but was never populated (login only
 * ever checked a hardcoded "000000"). Splits enrollment into a pending
 * secret so an in-progress (or abandoned) re-enrollment never invalidates
 * the currently-active secret before the user confirms the new one.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.string("two_factor_pending_secret", 255).nullable();
    table.jsonb("two_factor_backup_codes").nullable(); // [{ hash, used_at }]
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("two_factor_pending_secret");
    table.dropColumn("two_factor_backup_codes");
  });
}
