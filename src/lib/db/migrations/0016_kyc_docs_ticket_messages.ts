import type { Knex } from "knex";

/**
 * Migration 0016 — KYC Documents & Ticket Messages
 *
 * Normalizes two JSONB-based data stores into proper relational tables:
 *  - kyc_records.documents  →  kyc_documents table
 *  - support_tickets.messages  →  ticket_messages table
 *
 * Both new tables are append-only (no updated_at).
 * The old JSONB columns are dropped since tables are truncated.
 */

export async function up(knex: Knex): Promise<void> {
  // Enums
  await knex.raw(`
    CREATE TYPE "kyc_doc_type" AS ENUM (
      'GHANA_CARD', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTERS_ID',
      'UTILITY_BILL', 'BANK_STATEMENT', 'BUSINESS_REGISTRATION', 'TAX_CERTIFICATE'
    )
  `);

  await knex.raw(`
    CREATE TYPE "kyc_doc_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED')
  `);

  // -- kyc_documents (append-only — no updated_at) --
  await knex.schema.createTable("kyc_documents", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("kyc_id")
      .notNullable()
      .references("id")
      .inTable("kyc_records")
      .onDelete("CASCADE");
    table.specificType("doc_type", "kyc_doc_type").notNullable();
    table.string("storage_key", 500).notNullable(); // S3/R2 object key, never a public URL
    table.specificType("status", "kyc_doc_status").notNullable().defaultTo("PENDING");
    table.string("rejection_reason", 500).nullable();
    table.timestamp("reviewed_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    // intentionally no updated_at: append new row on re-submission
  });

  await knex.raw(`CREATE INDEX "kyc_documents_kyc_id_index" ON "kyc_documents" ("kyc_id")`);

  // Drop old JSONB column
  await knex.schema.alterTable("kyc_records", (table) => {
    table.dropColumn("documents");
  });

  // -- ticket_messages (immutable — no updated_at) --
  await knex.schema.createTable("ticket_messages", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("ticket_id")
      .notNullable()
      .references("id")
      .inTable("support_tickets")
      .onDelete("CASCADE");
    table
      .uuid("sender_id")
      .notNullable()
      .references("id")
      .inTable("users");
    table.text("body").notNullable();
    table.jsonb("attachments").defaultTo("[]"); // storage keys only
    table.boolean("is_internal").notNullable().defaultTo(false); // internal admin notes
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    // intentionally no updated_at: messages are immutable once sent
  });

  await knex.raw(`CREATE INDEX "ticket_messages_ticket_id_index" ON "ticket_messages" ("ticket_id")`);

  // Drop old JSONB column
  await knex.schema.alterTable("support_tickets", (table) => {
    table.dropColumn("messages");
  });
}

export async function down(knex: Knex): Promise<void> {
  // Restore old JSONB columns
  await knex.schema.alterTable("support_tickets", (table) => {
    table.jsonb("messages").notNullable().defaultTo("[]");
  });

  await knex.schema.dropTableIfExists("ticket_messages");

  await knex.schema.alterTable("kyc_records", (table) => {
    table.jsonb("documents").notNullable().defaultTo("[]");
  });

  await knex.schema.dropTableIfExists("kyc_documents");

  await knex.raw(`DROP TYPE IF EXISTS "kyc_doc_status"`);
  await knex.raw(`DROP TYPE IF EXISTS "kyc_doc_type"`);
}
