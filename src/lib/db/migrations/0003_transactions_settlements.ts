import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- transactions ---
  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("tx_id_display", 80).notNullable().unique(); // e.g. TX-8492049...
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("RESTRICT");
    table
      .uuid("customer_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.decimal("amount", 18, 6).notNullable();
    table.string("currency", 10).notNullable(); // USD, EUR, GBP, GHS
    table.decimal("stablecoin_amount", 18, 6).nullable(); // USDT equivalent
    table.string("stablecoin_currency", 10).nullable().defaultTo("USDT");
    table
      .enum("method", ["CARD", "CRYPTO", "ACH", "SWIFT", "MOBILE_MONEY", "BANK_TRANSFER", "DIGITAL_WALLET"], {
        useNative: true,
        enumName: "payment_method",
      })
      .notNullable();
    table
      .enum("status", ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "REFUNDED"], {
        useNative: true,
        enumName: "transaction_status",
      })
      .notNullable()
      .defaultTo("PENDING");
    table
      .enum("flag_level", ["NONE", "LOW", "MEDIUM", "HIGH"], {
        useNative: true,
        enumName: "flag_level",
      })
      .notNullable()
      .defaultTo("NONE");
    table.string("gateway_node", 100).nullable(); // e.g. US-EAST-1
    table.string("network_hash", 255).nullable(); // blockchain tx hash
    table.decimal("processing_fee", 18, 6).notNullable().defaultTo(0);
    table.decimal("network_gas", 18, 6).notNullable().defaultTo(0);
    table.string("payer_email", 255).nullable();
    table.string("payer_wallet_address", 255).nullable();
    table.jsonb("metadata").notNullable().defaultTo("{}");
    table.timestamps(true, true);

    // Indexes for common query patterns
    table.index(["merchant_id", "status"]);
    table.index(["created_at"]);
    table.index(["method"]);
  });

  // --- settlements ---
  await knex.schema.createTable("settlements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("settlement_id_display", 80).notNullable().unique(); // e.g. STL-20250401-001
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("RESTRICT");
    table.decimal("gross_amount", 18, 6).notNullable();
    table.decimal("fees", 18, 6).notNullable().defaultTo(0);
    table.decimal("net_amount", 18, 6).notNullable();
    table.string("currency", 10).notNullable().defaultTo("USDT");
    table
      .enum("status", ["PENDING", "COMPLETED", "FAILED"], {
        useNative: true,
        enumName: "settlement_status",
      })
      .notNullable()
      .defaultTo("PENDING");
    table.timestamp("date_range_start").notNullable();
    table.timestamp("date_range_end").notNullable();
    table.integer("transaction_count").notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index(["merchant_id", "status"]);
    table.index(["created_at"]);
  });

  // --- payment_sessions (public payment links) ---
  await knex.schema.createTable("payment_sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("RESTRICT");
    table.decimal("amount", 18, 6).notNullable();
    table.string("currency", 10).notNullable().defaultTo("USD");
    table.string("description", 500).nullable();
    table.string("redirect_url", 2048).nullable();
    table
      .enum("status", ["ACTIVE", "COMPLETED", "EXPIRED"], {
        useNative: true,
        enumName: "session_status",
      })
      .notNullable()
      .defaultTo("ACTIVE");
    table
      .uuid("transaction_id")
      .nullable()
      .references("id")
      .inTable("transactions")
      .onDelete("SET NULL");
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("payment_sessions");
  await knex.schema.dropTableIfExists("settlements");
  await knex.schema.dropTableIfExists("transactions");
  await knex.raw("DROP TYPE IF EXISTS session_status");
  await knex.raw("DROP TYPE IF EXISTS settlement_status");
  await knex.raw("DROP TYPE IF EXISTS flag_level");
  await knex.raw("DROP TYPE IF EXISTS transaction_status");
  await knex.raw("DROP TYPE IF EXISTS payment_method");
}
