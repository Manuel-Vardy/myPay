import type { Knex } from "knex";

/**
 * Default platform-wide fee schedules. Rates are starting values —
 * admins manage them from Settings → Fees.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex("fee_ledger").del();
  await knex("fee_schedules").del();

  await knex("fee_schedules").insert([
    {
      fee_type: "PAYMENT_PROCESSING",
      description: "Platform processing fee on all captured payments",
      calculation_method: "PERCENTAGE",
      flat_amount: 0,
      percentage_rate: 1.5,
      currency: "GHS",
      applicability: "ALL_MERCHANTS",
      is_active: true,
    },
    {
      fee_type: "SETTLEMENT_TRANSFER",
      description: "Payout transfer fee per settlement batch",
      calculation_method: "FLAT_PLUS_PERCENTAGE",
      flat_amount: 100, // GHS 1.00 in pesewas
      percentage_rate: 0.25,
      currency: "GHS",
      applicability: "ALL_MERCHANTS",
      is_active: true,
    },
  ]);
}
