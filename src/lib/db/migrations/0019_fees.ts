import type { Knex } from "knex";

/**
 * Migration 0019 — Fees Subsystem (blueprint Section 13)
 *
 * fee_schedules: configurable fee rules (what to charge, to whom, how).
 * fee_ledger:    immutable record of every fee actually charged, attached
 *                to exactly one transaction XOR one settlement.
 */

export async function up(knex: Knex): Promise<void> {
  // Enums
  await knex.raw(`
    CREATE TYPE "fee_type" AS ENUM (
      'PAYMENT_PROCESSING',
      'PAYMENT_GATEWAY',
      'CROSS_BORDER',
      'CRYPTO_NETWORK_GAS',
      'THREE_DS_AUTH',
      'CHARGEBACK',
      'REFUND_PROCESSING',
      'SETTLEMENT_TRANSFER',
      'SETTLEMENT_FX',
      'EARLY_SETTLEMENT',
      'SETTLEMENT_MINIMUM_SHORTFALL',
      'MONTHLY_PLATFORM',
      'API_CALL_OVERAGE',
      'DISPUTE_MANAGEMENT',
      'KYC_VERIFICATION'
    )
  `);

  await knex.raw(`
    CREATE TYPE "fee_calculation_method" AS ENUM (
      'FLAT', 'PERCENTAGE', 'FLAT_PLUS_PERCENTAGE', 'TIERED'
    )
  `);

  await knex.raw(`
    CREATE TYPE "fee_applicability" AS ENUM (
      'ALL_MERCHANTS', 'MERCHANT_TIER', 'MERCHANT_SPECIFIC'
    )
  `);

  // -- fee_schedules --
  await knex.schema.createTable("fee_schedules", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.specificType("fee_type", "fee_type").notNullable();
    table.string("description", 500).nullable();
    table
      .specificType("calculation_method", "fee_calculation_method")
      .notNullable();

    // Flat component in minor units (pesewas). 0 if pure percentage.
    table.bigInteger("flat_amount").notNullable().defaultTo(0);
    // Percentage component e.g. 1.5000 = 1.5%. 0 if pure flat.
    table.decimal("percentage_rate", 6, 4).notNullable().defaultTo(0);

    table.string("currency", 10).notNullable().defaultTo("GHS");

    // Floor / ceiling applied after calculation (null = unbounded)
    table.bigInteger("minimum_amount").nullable();
    table.bigInteger("maximum_amount").nullable();

    table
      .specificType("applicability", "fee_applicability")
      .notNullable()
      .defaultTo("ALL_MERCHANTS");
    table.specificType("merchant_tier", "merchant_tier").nullable();
    table
      .uuid("merchant_id")
      .nullable()
      .references("id")
      .inTable("merchants")
      .onDelete("CASCADE");

    // null = all rails / all methods
    table.specificType("applicable_rails", "payment_rail[]").nullable();
    table.specificType("applicable_methods", "payment_method[]").nullable();

    // TIERED method: volume bands e.g.
    // [{"from": 0, "to": 100000, "rate": 2.0}, {"from": 100001, "to": null, "rate": 1.5}]
    table.jsonb("tiered_bands").nullable();

    table.boolean("is_active").notNullable().defaultTo(true);
    table
      .timestamp("valid_from", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp("valid_until", { useTz: true }).nullable();

    table.uuid("created_by").nullable().references("id").inTable("users");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_merchant_specific_check"
    CHECK (applicability != 'MERCHANT_SPECIFIC' OR merchant_id IS NOT NULL)
  `);
  await knex.raw(`
    ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_tier_check"
    CHECK (applicability != 'MERCHANT_TIER' OR merchant_tier IS NOT NULL)
  `);

  await knex.raw(
    `CREATE INDEX "fee_schedules_fee_type_active_index" ON "fee_schedules" ("fee_type", "is_active")`
  );
  await knex.raw(
    `CREATE INDEX "fee_schedules_merchant_id_index" ON "fee_schedules" ("merchant_id")`
  );
  await knex.raw(
    `CREATE INDEX "fee_schedules_valid_from_until_index" ON "fee_schedules" ("valid_from", "valid_until")`
  );

  // -- fee_ledger (IMMUTABLE — no updated_at) --
  await knex.schema.createTable("fee_ledger", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));

    // Which schedule generated this fee (null if manually applied)
    table
      .uuid("fee_schedule_id")
      .nullable()
      .references("id")
      .inTable("fee_schedules")
      .onDelete("RESTRICT");
    // Denormalised for query speed
    table.specificType("fee_type", "fee_type").notNullable();

    // Attach to a transaction OR a settlement — exactly one (check below)
    table
      .uuid("transaction_id")
      .nullable()
      .references("id")
      .inTable("transactions")
      .onDelete("RESTRICT");
    table
      .uuid("settlement_id")
      .nullable()
      .references("id")
      .inTable("settlements")
      .onDelete("RESTRICT");

    table
      .uuid("merchant_id")
      .notNullable()
      .references("id")
      .inTable("merchants")
      .onDelete("RESTRICT");

    // Actual fee charged in minor units
    table.bigInteger("amount").notNullable();
    table.string("currency", 10).notNullable();

    // Snapshot of the rates applied at time of charge
    table.bigInteger("flat_amount_applied").nullable();
    table.decimal("percentage_rate_applied", 6, 4).nullable();
    table.bigInteger("basis_amount").nullable();

    // Waiver: never delete/adjust the row — flag it and issue a compensating credit
    table.boolean("is_waived").notNullable().defaultTo(false);
    table.uuid("waived_by").nullable().references("id").inTable("users");
    table.string("waiver_reason", 500).nullable();

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    // NO updated_at — immutable record
  });

  await knex.raw(
    `ALTER TABLE "fee_ledger" ADD CONSTRAINT "fee_ledger_amount_non_negative" CHECK (amount >= 0)`
  );
  await knex.raw(`
    ALTER TABLE "fee_ledger" ADD CONSTRAINT "fee_ledger_one_parent_check"
    CHECK ((transaction_id IS NOT NULL)::int + (settlement_id IS NOT NULL)::int = 1)
  `);

  await knex.raw(
    `CREATE INDEX "fee_ledger_transaction_id_index" ON "fee_ledger" ("transaction_id")`
  );
  await knex.raw(
    `CREATE INDEX "fee_ledger_settlement_id_index" ON "fee_ledger" ("settlement_id")`
  );
  await knex.raw(
    `CREATE INDEX "fee_ledger_merchant_id_index" ON "fee_ledger" ("merchant_id")`
  );
  await knex.raw(
    `CREATE INDEX "fee_ledger_fee_type_index" ON "fee_ledger" ("fee_type")`
  );
  await knex.raw(
    `CREATE INDEX "fee_ledger_created_at_index" ON "fee_ledger" ("created_at")`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("fee_ledger");
  await knex.schema.dropTableIfExists("fee_schedules");
  await knex.raw(`DROP TYPE IF EXISTS "fee_applicability"`);
  await knex.raw(`DROP TYPE IF EXISTS "fee_calculation_method"`);
  await knex.raw(`DROP TYPE IF EXISTS "fee_type"`);
}
