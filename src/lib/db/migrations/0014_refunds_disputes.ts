import type { Knex } from "knex";

/**
 * Migration 0014 — Refunds, Disputes & Settlement Batching
 *
 * Creates the refunds and disputes tables for chargeback management,
 * and the settlement_transactions join table that links individual
 * transactions to settlement batches.
 */

export async function up(knex: Knex): Promise<void> {
  // Enums
  await knex.raw(`
    CREATE TYPE "refund_status" AS ENUM (
      'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED'
    )
  `);

  await knex.raw(`
    CREATE TYPE "dispute_status" AS ENUM (
      'OPEN', 'UNDER_REVIEW', 'EVIDENCE_SUBMITTED',
      'WON', 'LOST', 'ACCEPTED', 'EXPIRED'
    )
  `);

  // -- refunds --
  await knex.schema.createTable("refunds", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("refund_id_display", 80).notNullable().unique();
    table
      .uuid("transaction_id")
      .notNullable()
      .references("id")
      .inTable("transactions")
      .onDelete("RESTRICT");
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("RESTRICT");
    table.bigInteger("amount").notNullable(); // minor units
    table.string("currency", 10).notNullable();
    table.string("reason", 500).nullable();
    table.specificType("status", "refund_status").notNullable().defaultTo("PENDING");
    table.uuid("initiated_by").nullable().references("id").inTable("users");
    table.string("gateway_ref", 255).nullable();
    table.string("failure_reason", 500).nullable();
    table.timestamps(true, true);
  });

  await knex.raw(`CREATE INDEX "refunds_transaction_id_index" ON "refunds" ("transaction_id")`);
  await knex.raw(`CREATE INDEX "refunds_merchant_id_index" ON "refunds" ("merchant_id")`);

  // -- disputes --
  await knex.schema.createTable("disputes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("dispute_id_display", 80).notNullable().unique();
    table
      .uuid("transaction_id")
      .notNullable()
      .references("id")
      .inTable("transactions")
      .onDelete("RESTRICT");
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("RESTRICT");
    table.bigInteger("amount").notNullable(); // disputed amount in minor units
    table.string("currency", 10).notNullable();
    table.string("reason_code", 50).nullable(); // Visa/MC chargeback reason code
    table.string("reason_description", 500).nullable();
    table.specificType("status", "dispute_status").notNullable().defaultTo("OPEN");
    table.jsonb("evidence").defaultTo("[]"); // storage keys of uploaded docs
    table.uuid("assigned_to").nullable().references("id").inTable("users");
    table.timestamp("due_date", { useTz: true }).nullable(); // respond-by deadline
    table.timestamp("resolved_at", { useTz: true }).nullable();
    table.text("resolution_notes").nullable();
    table.timestamps(true, true);
  });

  await knex.raw(`CREATE INDEX "disputes_transaction_id_index" ON "disputes" ("transaction_id")`);
  await knex.raw(`CREATE INDEX "disputes_merchant_id_status_index" ON "disputes" ("merchant_id", "status")`);
  await knex.raw(`CREATE INDEX "disputes_due_date_index" ON "disputes" ("due_date")`);

  // -- settlement_transactions (join table) --
  await knex.schema.createTable("settlement_transactions", (table) => {
    table
      .uuid("settlement_id")
      .notNullable()
      .references("id")
      .inTable("settlements")
      .onDelete("RESTRICT");
    table
      .uuid("transaction_id")
      .notNullable()
      .references("id")
      .inTable("transactions")
      .onDelete("RESTRICT");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.primary(["settlement_id", "transaction_id"]);
  });

  await knex.raw(
    `CREATE INDEX "settlement_transactions_transaction_id_index" ON "settlement_transactions" ("transaction_id")`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("settlement_transactions");
  await knex.schema.dropTableIfExists("disputes");
  await knex.schema.dropTableIfExists("refunds");
  await knex.raw(`DROP TYPE IF EXISTS "dispute_status"`);
  await knex.raw(`DROP TYPE IF EXISTS "refund_status"`);
}
