import type { Knex } from "knex";

/**
 * Migration 0011 — Schema Alignment
 *
 * Drops and recreates all enums whose values changed between the V1 MVP
 * migrations and the target psp_schema.sql. Alters column types from
 * decimal(18,6) to bigint (minor units). Adds missing columns, renames
 * columns, and drops deprecated ones.
 *
 * Safe to run destructively because the platform is not live and all
 * tables are truncated.
 */

// ---------------------------------------------------------------------------
// Helper: drop an enum that is used by one or more columns, then recreate it
// with new values and re-attach it.  Because the tables are truncated we can
// ALTER COLUMN TYPE … USING directly.
// ---------------------------------------------------------------------------
async function recreateEnum(
  knex: Knex,
  enumName: string,
  newValues: string[],
  usages: { table: string; column: string; defaultValue?: string }[]
) {
  const valueList = newValues.map((v) => `'${v}'`).join(", ");

  // 1. Detach: set columns to text temporarily
  for (const u of usages) {
    await knex.raw(
      `ALTER TABLE "${u.table}" ALTER COLUMN "${u.column}" TYPE text USING "${u.column}"::text`
    );
    // Drop any default that references the old enum
    await knex.raw(
      `ALTER TABLE "${u.table}" ALTER COLUMN "${u.column}" DROP DEFAULT`
    );
  }

  // 2. Drop old enum
  await knex.raw(`DROP TYPE IF EXISTS "${enumName}"`);

  // 3. Create new enum
  await knex.raw(`CREATE TYPE "${enumName}" AS ENUM (${valueList})`);

  // 4. Re-attach columns
  for (const u of usages) {
    await knex.raw(
      `ALTER TABLE "${u.table}" ALTER COLUMN "${u.column}" TYPE "${enumName}" USING "${u.column}"::"${enumName}"`
    );
    if (u.defaultValue) {
      await knex.raw(
        `ALTER TABLE "${u.table}" ALTER COLUMN "${u.column}" SET DEFAULT '${u.defaultValue}'`
      );
    }
  }
}

export async function up(knex: Knex): Promise<void> {
  // Truncate tables first to avoid foreign key and enum type casting failures
  const tablesToTruncate = [
    "system_logs",
    "support_tickets",
    "kyc_records",
    "settlements",
    "transactions",
    "payment_sessions",
    "payment_links",
    "customers",
    "settlement_accounts",
    "admin_profiles",
    "merchants",
    "users"
  ];
  for (const table of tablesToTruncate) {
    await knex.raw(`TRUNCATE TABLE "${table}" CASCADE`);
  }

  // =========================================================================
  // ENUM OVERHAUL
  // =========================================================================

  await recreateEnum(knex, "user_role", ["SUPER_ADMIN", "ADMIN", "MERCHANT", "CUSTOMER", "SUPPORT"], [
    { table: "users", column: "role" },
  ]);

  await recreateEnum(knex, "user_status", ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "DEACTIVATED", "FLAGGED"], [
    { table: "users", column: "status", defaultValue: "ACTIVE" },
  ]);

  await recreateEnum(knex, "merchant_tier", ["STANDARD", "PREMIUM", "ENTERPRISE"], [
    { table: "merchants", column: "tier", defaultValue: "STANDARD" },
  ]);

  await recreateEnum(knex, "customer_tier", ["STANDARD", "PREMIUM"], [
    { table: "customers", column: "tier", defaultValue: "STANDARD" },
  ]);

  await recreateEnum(knex, "customer_status", ["ACTIVE", "BLOCKED"], [
    { table: "customers", column: "status", defaultValue: "ACTIVE" },
  ]);

  await recreateEnum(
    knex,
    "payment_method",
    ["CARD", "MOBILE_MONEY", "BANK_TRANSFER", "USSD", "CRYPTO"],
    [{ table: "transactions", column: "method" }]
  );

  await recreateEnum(
    knex,
    "transaction_status",
    [
      "INITIATED", "PENDING_AUTH", "AUTHENTICATED", "AUTHORIZED",
      "CAPTURED", "PARTIALLY_CAPTURED", "PENDING_SETTLEMENT", "SETTLED",
      "FAILED", "CANCELLED", "EXPIRED", "REVERSED",
    ],
    [{ table: "transactions", column: "status", defaultValue: "INITIATED" }]
  );

  await recreateEnum(knex, "session_status", ["ACTIVE", "COMPLETED", "EXPIRED", "CANCELLED"], [
    { table: "payment_sessions", column: "status", defaultValue: "ACTIVE" },
  ]);

  await recreateEnum(
    knex,
    "settlement_status",
    ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
    [{ table: "settlements", column: "status", defaultValue: "PENDING" }]
  );

  await recreateEnum(
    knex,
    "settlement_account_type",
    ["BANK_ACCOUNT", "MOBILE_MONEY", "CRYPTO_WALLET"],
    [{ table: "settlement_accounts", column: "account_type" }]
  );

  await recreateEnum(knex, "kyc_tier", ["STANDARD", "ENHANCED", "PREMIUM"], [
    { table: "kyc_records", column: "tier", defaultValue: "STANDARD" },
  ]);

  await recreateEnum(
    knex,
    "kyc_status",
    ["PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "EXPIRED"],
    [{ table: "kyc_records", column: "status", defaultValue: "PENDING" }]
  );

  await recreateEnum(knex, "flag_level", ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"], [
    { table: "transactions", column: "flag_level", defaultValue: "NONE" },
  ]);

  await recreateEnum(
    knex,
    "ticket_issue_type",
    ["PAYMENT_DISPUTE", "SETTLEMENT_ISSUE", "ACCOUNT_ACCESS", "KYC_QUERY", "INTEGRATION_SUPPORT", "CHARGEBACK", "OTHER"],
    [{ table: "support_tickets", column: "issue_type" }]
  );

  await recreateEnum(
    knex,
    "ticket_status",
    ["OPEN", "IN_PROGRESS", "AWAITING_MERCHANT", "RESOLVED", "CLOSED"],
    [{ table: "support_tickets", column: "status", defaultValue: "OPEN" }]
  );

  await recreateEnum(knex, "log_level", ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"], [
    { table: "system_logs", column: "level" },
  ]);

  // New enums (not replacing existing ones)
  await knex.raw(`
    CREATE TYPE "payment_rail" AS ENUM (
      'VISA', 'MASTERCARD', 'MTN_MOMO', 'AT_MONEY', 'TELECEL_CASH',
      'GHIPSS_NIP', 'USDT_TRC20', 'USDT_ERC20', 'USDC_ERC20'
    )
  `);

  // =========================================================================
  // COLUMN TYPE CHANGES: decimal(18,6) → bigint
  // =========================================================================

  // transactions
  for (const col of ["amount", "processing_fee", "network_gas"]) {
    await knex.raw(
      `ALTER TABLE "transactions" ALTER COLUMN "${col}" TYPE bigint USING "${col}"::bigint`
    );
  }

  // settlements
  for (const col of ["gross_amount", "fees", "net_amount"]) {
    await knex.raw(
      `ALTER TABLE "settlements" ALTER COLUMN "${col}" TYPE bigint USING "${col}"::bigint`
    );
  }

  // payment_sessions
  await knex.raw(
    `ALTER TABLE "payment_sessions" ALTER COLUMN "amount" TYPE bigint USING "amount"::bigint`
  );

  // payment_links
  await knex.raw(
    `ALTER TABLE "payment_links" ALTER COLUMN "amount" TYPE bigint USING "amount"::bigint`
  );

  // customers
  await knex.raw(
    `ALTER TABLE "customers" ALTER COLUMN "total_spent" TYPE bigint USING "total_spent"::bigint`
  );

  // =========================================================================
  // COLUMN RENAMES
  // =========================================================================

  await knex.schema.alterTable("transactions", (table) => {
    table.renameColumn("network_hash", "crypto_network_hash");
    table.renameColumn("stablecoin_amount", "crypto_amount");
    table.renameColumn("stablecoin_currency", "crypto_currency");
  });

  // =========================================================================
  // DROP DEPRECATED COLUMNS
  // =========================================================================

  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("available_balance");
    table.dropColumn("balance_currency");
  });

  // Drop payment_sessions.transaction_id FK (transactions reference sessions now, not the other way)
  await knex.schema.alterTable("payment_sessions", (table) => {
    table.dropColumn("transaction_id");
  });

  // =========================================================================
  // NEW COLUMNS ON EXISTING TABLES
  // =========================================================================

  // -- transactions --
  await knex.schema.alterTable("transactions", (table) => {
    table
      .uuid("payment_session_id")
      .nullable()
      .references("id")
      .inTable("payment_sessions")
      .onDelete("RESTRICT");
    table.specificType("rail", "payment_rail").nullable();
    table.string("gateway_reference", 255).nullable();
    table.string("payer_phone", 20).nullable();
    table.string("card_token", 255).nullable();
    table.string("card_last_four", 4).nullable();
    table.string("card_brand", 20).nullable();
    table.string("momo_reference", 100).nullable();
    table.string("three_ds_session_id", 255).nullable();
    table.string("three_ds_status", 50).nullable();
    table.string("idempotency_key", 255).nullable();
  });

  await knex.raw(
    `CREATE INDEX "transactions_payment_session_id_index" ON "transactions" ("payment_session_id")`
  );
  await knex.raw(
    `CREATE INDEX "transactions_idempotency_key_index" ON "transactions" ("idempotency_key")`
  );

  // -- payment_sessions --
  await knex.schema.alterTable("payment_sessions", (table) => {
    table.string("cancel_url", 2048).nullable();
    table.jsonb("metadata").notNullable().defaultTo("{}");
  });

  await knex.raw(
    `CREATE INDEX "payment_sessions_status_index" ON "payment_sessions" ("status")`
  );

  // -- payment_links --
  await knex.schema.alterTable("payment_links", (table) => {
    table.integer("usage_limit").nullable();
    table.integer("usage_count").notNullable().defaultTo(0);
  });

  // -- settlements --
  await knex.schema.alterTable("settlements", (table) => {
    table.string("bank_reference", 255).nullable();
    table.string("failure_reason", 500).nullable();
  });

  // -- settlement_accounts --
  await knex.schema.alterTable("settlement_accounts", (table) => {
    table.boolean("is_verified").notNullable().defaultTo(false);
  });

  // -- support_tickets --
  await knex.schema.alterTable("support_tickets", (table) => {
    table
      .uuid("transaction_id")
      .nullable()
      .references("id")
      .inTable("transactions")
      .onDelete("SET NULL");
    table.timestamp("resolved_at").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Reverse new columns
  await knex.schema.alterTable("support_tickets", (table) => {
    table.dropColumn("resolved_at");
    table.dropColumn("transaction_id");
  });
  await knex.schema.alterTable("settlement_accounts", (table) => {
    table.dropColumn("is_verified");
  });
  await knex.schema.alterTable("settlements", (table) => {
    table.dropColumn("failure_reason");
    table.dropColumn("bank_reference");
  });
  await knex.schema.alterTable("payment_links", (table) => {
    table.dropColumn("usage_count");
    table.dropColumn("usage_limit");
  });
  await knex.schema.alterTable("payment_sessions", (table) => {
    table.dropColumn("metadata");
    table.dropColumn("cancel_url");
  });
  await knex.raw(`DROP INDEX IF EXISTS "transactions_idempotency_key_index"`);
  await knex.raw(`DROP INDEX IF EXISTS "transactions_payment_session_id_index"`);
  await knex.raw(`DROP INDEX IF EXISTS "payment_sessions_status_index"`);
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("idempotency_key");
    table.dropColumn("three_ds_status");
    table.dropColumn("three_ds_session_id");
    table.dropColumn("momo_reference");
    table.dropColumn("card_brand");
    table.dropColumn("card_last_four");
    table.dropColumn("card_token");
    table.dropColumn("payer_phone");
    table.dropColumn("gateway_reference");
    table.dropColumn("rail");
    table.dropColumn("payment_session_id");
  });

  // Restore dropped columns
  await knex.schema.alterTable("payment_sessions", (table) => {
    table.uuid("transaction_id").nullable().references("id").inTable("transactions").onDelete("SET NULL");
  });
  await knex.schema.alterTable("merchants", (table) => {
    table.decimal("available_balance", 18, 6).notNullable().defaultTo(0);
    table.string("balance_currency", 10).notNullable().defaultTo("USDT");
  });

  // Reverse renames
  await knex.schema.alterTable("transactions", (table) => {
    table.renameColumn("crypto_currency", "stablecoin_currency");
    table.renameColumn("crypto_amount", "stablecoin_amount");
    table.renameColumn("crypto_network_hash", "network_hash");
  });

  // Reverse bigint → decimal
  for (const col of ["amount", "processing_fee", "network_gas"]) {
    await knex.raw(`ALTER TABLE "transactions" ALTER COLUMN "${col}" TYPE decimal(18,6)`);
  }
  for (const col of ["gross_amount", "fees", "net_amount"]) {
    await knex.raw(`ALTER TABLE "settlements" ALTER COLUMN "${col}" TYPE decimal(18,6)`);
  }
  await knex.raw(`ALTER TABLE "payment_sessions" ALTER COLUMN "amount" TYPE decimal(18,6)`);
  await knex.raw(`ALTER TABLE "payment_links" ALTER COLUMN "amount" TYPE decimal(18,6)`);
  await knex.raw(`ALTER TABLE "customers" ALTER COLUMN "total_spent" TYPE decimal(18,6)`);

  // Drop new enum
  await knex.raw(`DROP TYPE IF EXISTS "payment_rail"`);

  // NOTE: Enum rollbacks are destructive. The old enum values would need to be
  // manually restored if this down() is ever run. Since the platform is not live
  // this is acceptable.
}
