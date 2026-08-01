import type { Knex } from "knex";

/**
 * Migration 0015 — Webhooks & Rate Limiting
 *
 * Creates the webhook event log (with retry queue fields) and
 * per-merchant sliding-window rate limit counters.
 */

export async function up(knex: Knex): Promise<void> {
  // Enum
  await knex.raw(`
    CREATE TYPE "webhook_status" AS ENUM (
      'PENDING', 'DELIVERED', 'FAILED', 'EXHAUSTED'
    )
  `);

  // -- webhook_events --
  await knex.schema.createTable("webhook_events", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table
      .uuid("transaction_id")
      .nullable()
      .references("id")
      .inTable("transactions")
      .onDelete("SET NULL");
    table.string("event_type", 100).notNullable(); // e.g. 'payment.completed'
    table.jsonb("payload").notNullable();
    table.string("endpoint_url", 2048).notNullable();
    table.specificType("status", "webhook_status").notNullable().defaultTo("PENDING");
    table.integer("attempt_count").notNullable().defaultTo(0);
    table.timestamp("last_attempt_at", { useTz: true }).nullable();
    table.timestamp("next_retry_at", { useTz: true }).nullable();
    table.timestamp("delivered_at", { useTz: true }).nullable();
    table.text("last_error").nullable();
    table.timestamps(true, true);
  });

  await knex.raw(`CREATE INDEX "webhook_events_merchant_id_index" ON "webhook_events" ("merchant_id")`);
  await knex.raw(`CREATE INDEX "webhook_events_status_next_retry_index" ON "webhook_events" ("status", "next_retry_at")`);
  await knex.raw(`CREATE INDEX "webhook_events_transaction_id_index" ON "webhook_events" ("transaction_id")`);

  // -- rate_limit_counters --
  await knex.schema.createTable("rate_limit_counters", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table.string("endpoint", 200).notNullable();
    table.timestamp("window_start", { useTz: true }).notNullable();
    table.integer("request_count").notNullable().defaultTo(1);

    table.unique(["merchant_id", "endpoint", "window_start"]);
  });

  await knex.raw(
    `CREATE INDEX "rate_limit_counters_window_start_index" ON "rate_limit_counters" ("window_start")`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("rate_limit_counters");
  await knex.schema.dropTableIfExists("webhook_events");
  await knex.raw(`DROP TYPE IF EXISTS "webhook_status"`);
}
