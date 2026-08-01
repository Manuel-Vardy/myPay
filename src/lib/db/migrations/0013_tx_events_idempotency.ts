import type { Knex } from "knex";

/**
 * Migration 0013 — Transaction Events & Idempotency
 *
 * Creates the immutable transaction event audit trail and the
 * idempotency key table for preventing duplicate payment processing.
 */

export async function up(knex: Knex): Promise<void> {
  // -- transaction_events (IMMUTABLE — no updated_at) --
  await knex.schema.createTable("transaction_events", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("transaction_id")
      .notNullable()
      .references("id")
      .inTable("transactions")
      .onDelete("RESTRICT");
    table.specificType("from_status", "transaction_status").nullable(); // null on first INITIATED event
    table.specificType("to_status", "transaction_status").notNullable();
    table.string("triggered_by", 100).notNullable(); // 'system' | 'webhook' | 'admin:{user_id}'
    table.jsonb("raw_payload").nullable(); // raw bank/MNO response at this step
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    // NO updated_at — immutable
  });

  await knex.raw(
    `CREATE INDEX "transaction_events_transaction_id_index" ON "transaction_events" ("transaction_id")`
  );

  // -- idempotency_keys --
  await knex.schema.createTable("idempotency_keys", (table) => {
    table.string("key", 255).primary();
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table.string("request_hash", 255).notNullable(); // SHA-256 of request body
    table.jsonb("response_body").nullable();
    table.integer("status_code").nullable();
    table.timestamp("locked_at", { useTz: true }).nullable(); // row locked during processing
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("expires_at", { useTz: true }).notNullable(); // TTL, typically 24h
  });

  await knex.raw(
    `CREATE INDEX "idempotency_keys_merchant_id_index" ON "idempotency_keys" ("merchant_id")`
  );
  await knex.raw(
    `CREATE INDEX "idempotency_keys_expires_at_index" ON "idempotency_keys" ("expires_at")`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("idempotency_keys");
  await knex.schema.dropTableIfExists("transaction_events");
}
