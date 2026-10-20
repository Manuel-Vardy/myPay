import type { Knex } from "knex";

/**
 * Migration 0033 — mobile number verification
 *
 * `users.mobile_number` already exists (migration 0005). This adds the
 * verification timestamp, mirroring `email_verified_at` (0027). It is null
 * until the merchant confirms the SMS code sent via Arkesel OTP. Merchant
 * signup now collects a mobile number, and the dashboard is hard-gated behind
 * this being set (see requireVerifiedMerchant / merchant layout redirect).
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamp("mobile_verified_at", { useTz: true }).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("mobile_verified_at");
  });
}
