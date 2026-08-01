import type { Knex } from "knex";

/**
 * Migration 0027 — email verification & password reset tokens
 *
 * email_verified_at is independent of `users.status`, which stays driven by
 * KYC approval (see admin/kyc/[id] route). Verifying an email does not
 * activate an account on its own — it only clears the dashboard reminder.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamp("email_verified_at", { useTz: true }).nullable();
    table.string("email_verification_token", 64).nullable(); // sha256 hex
    table.timestamp("email_verification_expires", { useTz: true }).nullable();

    table.string("password_reset_token", 64).nullable(); // sha256 hex
    table.timestamp("password_reset_expires", { useTz: true }).nullable();
  });

  await knex.raw(
    `CREATE INDEX "users_email_verification_token_index" ON "users" ("email_verification_token")`
  );
  await knex.raw(
    `CREATE INDEX "users_password_reset_token_index" ON "users" ("password_reset_token")`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("email_verified_at");
    table.dropColumn("email_verification_token");
    table.dropColumn("email_verification_expires");
    table.dropColumn("password_reset_token");
    table.dropColumn("password_reset_expires");
  });
}
