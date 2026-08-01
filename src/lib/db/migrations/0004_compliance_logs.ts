import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- kyc_records ---
  await knex.schema.createTable("kyc_records", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("identity_id", 80).notNullable().unique(); // e.g. TR-8829-KYC-9
    table
      .enum("tier", ["STANDARD", "PREMIUM", "MERCHANT"], {
        useNative: true,
        enumName: "kyc_tier",
      })
      .notNullable()
      .defaultTo("STANDARD");
    table
      .enum("status", ["PENDING", "APPROVED", "REJECTED", "FLAGGED", "EXPIRED"], {
        useNative: true,
        enumName: "kyc_status",
      })
      .notNullable()
      .defaultTo("PENDING");
    table.jsonb("documents").notNullable().defaultTo("[]"); // array of { type, url, uploaded_at }
    table.integer("process_time_ms").nullable(); // avg processing time
    table.string("region", 100).nullable(); // e.g. GH, NG for compliance limits
    table.text("review_notes").nullable();
    table.uuid("reviewed_by").nullable().references("id").inTable("users");
    table.timestamp("submitted_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("reviewed_at").nullable();
    table.timestamps(true, true);

    table.index(["status"]);
    table.index(["user_id"]);
  });

  // --- support_tickets ---
  await knex.schema.createTable("support_tickets", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("ticket_id_display", 80).notNullable().unique(); // e.g. TKT-00421
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");
    table.uuid("assigned_to").nullable().references("id").inTable("users");
    table
      .enum("issue_type", ["GATEWAY_TIMEOUT", "KYC_UPLOAD", "PAYMENT", "SETTLEMENT", "ACCOUNT", "OTHER"], {
        useNative: true,
        enumName: "ticket_issue_type",
      })
      .notNullable();
    table
      .enum("priority", ["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
        useNative: true,
        enumName: "ticket_priority",
      })
      .notNullable()
      .defaultTo("MEDIUM");
    table
      .enum("status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], {
        useNative: true,
        enumName: "ticket_status",
      })
      .notNullable()
      .defaultTo("OPEN");
    table.text("description").nullable();
    table.jsonb("messages").notNullable().defaultTo("[]"); // thread of messages
    table.timestamps(true, true);

    table.index(["merchant_id"]);
    table.index(["status"]);
  });

  // --- system_logs ---
  await knex.schema.createTable("system_logs", (table) => {
    table.bigIncrements("id").primary();
    table
      .enum("level", ["INFO", "WARN", "ERROR", "CRITICAL"], {
        useNative: true,
        enumName: "log_level",
      })
      .notNullable();
    table.string("source", 100).notNullable(); // e.g. AUTH_CORE, GATEWAY_API, KYC_ENGINE
    table.text("event_description").notNullable();
    table.uuid("actor_id").nullable().references("id").inTable("users");
    table.string("ip_address", 45).nullable();
    table.jsonb("metadata").notNullable().defaultTo("{}");
    table.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());

    table.index(["level"]);
    table.index(["source"]);
    table.index(["timestamp"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("system_logs");
  await knex.schema.dropTableIfExists("support_tickets");
  await knex.schema.dropTableIfExists("kyc_records");
  await knex.raw("DROP TYPE IF EXISTS log_level");
  await knex.raw("DROP TYPE IF EXISTS ticket_status");
  await knex.raw("DROP TYPE IF EXISTS ticket_priority");
  await knex.raw("DROP TYPE IF EXISTS ticket_issue_type");
  await knex.raw("DROP TYPE IF EXISTS kyc_status");
  await knex.raw("DROP TYPE IF EXISTS kyc_tier");
}
