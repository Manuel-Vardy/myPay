import type { Knex } from "knex";

/**
 * Migration 0049 — Widen merchants.logo_url to TEXT
 *
 * Signed URLs (GCS / S3) and CDN URLs can easily exceed 500 characters
 * with authentication queries, credentials, and signatures. Widen column
 * to TEXT to eliminate length constraints.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.text("logo_url").alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.string("logo_url", 500).alter();
  });
}
