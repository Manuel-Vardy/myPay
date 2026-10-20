import type { Knex } from "knex";

/**
 * Migration 0048 — Merchant KYC Compliance Fields & Company Type Gating
 *
 * Adds statutory KYC compliance structures:
 * - merchants: business_type, logo_url, gps_address, company_phone
 * - kyc_records: business_type, directors (jsonb), beneficial_owners (jsonb), current_step
 * - kyc_doc_type enum: FORM_A, FORM_3, FORM_A_3, BENEFICIAL_OWNER_PROFILE, COMPANY_LOGO, DIRECTOR_GHANA_CARD
 */

export async function up(knex: Knex): Promise<void> {
  // 1. Extend kyc_doc_type enum
  const newEnumValues = [
    "FORM_A",
    "FORM_3",
    "FORM_A_3",
    "BENEFICIAL_OWNER_PROFILE",
    "COMPANY_LOGO",
    "DIRECTOR_GHANA_CARD",
  ];

  for (const val of newEnumValues) {
    await knex.raw(`ALTER TYPE "kyc_doc_type" ADD VALUE IF NOT EXISTS '${val}'`);
  }

  // 2. Extend merchants table
  await knex.schema.alterTable("merchants", (table) => {
    table.string("business_type", 50).nullable(); // LIMITED_LIABILITY, SOLE_PROPRIETORSHIP, PARTNERSHIP
    table.string("logo_url", 500).nullable();
    table.string("gps_address", 50).nullable(); // e.g. GA-183-9024
    table.string("company_phone", 50).nullable();
  });

  // 3. Extend kyc_records table
  await knex.schema.alterTable("kyc_records", (table) => {
    table.string("business_type", 50).nullable();
    table.jsonb("directors").notNullable().defaultTo("[]");
    table.jsonb("beneficial_owners").notNullable().defaultTo("[]");
    table.integer("current_step").notNullable().defaultTo(1);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("kyc_records", (table) => {
    table.dropColumn("current_step");
    table.dropColumn("beneficial_owners");
    table.dropColumn("directors");
    table.dropColumn("business_type");
  });

  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("company_phone");
    table.dropColumn("gps_address");
    table.dropColumn("logo_url");
    table.dropColumn("business_type");
  });
}
