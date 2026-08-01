import type { Knex } from "knex";
import crypto from "crypto";

/**
 * Migration 0026 — API keys & webhook endpoints (extracted from merchants JSONB)
 *
 * Creates real tables for merchant API credentials and webhook configuration,
 * replacing the merchants.api_keys / merchants.webhook_config JSONB columns.
 * Additive only: the JSONB columns are dropped in a later migration once no
 * deployed revision reads them (job-migrate runs before service rollout).
 *
 * Legacy JSONB api_keys entries are NOT backfilled — the raw secrets were
 * never stored, so no existing key can ever authenticate. Merchants generate
 * fresh keys through the updated dashboard.
 *
 * webhook_config IS backfilled (url + events are real merchant config); each
 * backfilled endpoint gets a freshly generated signing secret.
 */

export async function up(knex: Knex): Promise<void> {
  // -- api_keys --
  await knex.schema.createTable("api_keys", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table.string("key_hash", 64).notNullable().unique(); // sha256 hex of the raw key
    table.string("prefix", 20).notNullable(); // display-only, e.g. "trite_sk_a1b2c3d"
    table.string("label", 100).notNullable();
    table.timestamp("last_used_at", { useTz: true }).nullable();
    table.timestamp("revoked_at", { useTz: true }).nullable(); // NULL = active
    table.timestamps(true, true);
  });

  await knex.raw(
    `CREATE INDEX "api_keys_merchant_id_index" ON "api_keys" ("merchant_id")`
  );

  // -- webhook_endpoints (one per merchant for now) --
  await knex.schema.createTable("webhook_endpoints", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("merchant_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table.string("url", 2048).notNullable();
    table.string("secret", 100).notNullable(); // whsec_<hex>; plaintext — needed to sign payloads
    table.specificType("events", "text[]").notNullable().defaultTo("{}");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("secret_rotated_at", { useTz: true }).nullable();
    table.timestamps(true, true);
  });

  // -- webhook_events: record the receiver's HTTP status for observability --
  await knex.schema.alterTable("webhook_events", (table) => {
    table.integer("response_status").nullable();
  });

  // -- Backfill webhook endpoints from merchants.webhook_config JSONB --
  const rows: Array<{ id: string; webhook_config: unknown }> = await knex(
    "merchants"
  ).select("id", "webhook_config");

  for (const row of rows) {
    const config =
      typeof row.webhook_config === "string"
        ? JSON.parse(row.webhook_config)
        : row.webhook_config || {};
    const url = typeof config.url === "string" ? config.url.trim() : "";
    if (!url) continue;

    const events: string[] = Array.isArray(config.events)
      ? config.events.filter((e: unknown) => typeof e === "string")
      : [];

    await knex("webhook_endpoints").insert({
      merchant_id: row.id,
      url,
      secret: `whsec_${crypto.randomBytes(24).toString("hex")}`,
      events,
      is_active: true,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("webhook_events", (table) => {
    table.dropColumn("response_status");
  });
  await knex.schema.dropTableIfExists("webhook_endpoints");
  await knex.schema.dropTableIfExists("api_keys");
}
