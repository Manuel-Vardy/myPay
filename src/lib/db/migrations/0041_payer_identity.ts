import type { Knex } from "knex";

/**
 * Migration 0041 — payer identity
 *
 * Groundwork for turning a settled payment into a customer record. Four
 * separate gaps, all of which have to close together for that to be possible:
 *
 * 1. `customers.user_id` is NOT NULL, so a payer must become a `users` row —
 *    but `users.email` is NOT NULL and hosted checkout only ever collects a
 *    mobile money number. Email becomes nullable, and a normalised MSISDN
 *    becomes the identity key. The existing `users_email_unique` constraint
 *    needs no change: Postgres treats NULLs as distinct, so any number of
 *    phone-only payers coexist under it.
 *
 * 2. `payment_sessions` carries nothing about the customer, so a merchant
 *    integrating over the API had no way to tell us who is paying — the one
 *    identity source that also works for crypto, where the payer is otherwise
 *    anonymous (Triton reports no sender address).
 *
 * 3. `transactions.payer_phone` has been written raw since the charge API
 *    landed, so the same payer is stored as `0244...` on one payment and
 *    `233244...` on the next. Matching on that would fragment one person into
 *    several customers, so existing rows are normalised here.
 *
 * 4. `customers.total_spent` / `transaction_count` / `last_transaction_at`
 *    are dropped rather than populated. They are denormalised counters that
 *    would have to be incremented at settlement, and settlement is not
 *    perfectly idempotent (settleMomoPayment guards only against an already
 *    SETTLED row), so a re-settle would corrupt them permanently. A single
 *    bigint also cannot hold GHS and USD spend without summing currencies
 *    that don't add up. They are computed from `transactions` instead — every
 *    row is 0/NULL today, so nothing is lost.
 *
 * The MSISDN uniqueness index is scoped to role = 'CUSTOMER': merchants and
 * admins share numbers with support staff often enough that a global
 * constraint would reject legitimate signups, and only payer identity needs
 * to be unique.
 */

/**
 * Normalise a phone column to bare international digits, mirroring
 * `normalizeMsisdn` in src/lib/utils.ts. Kept as inline SQL rather than an
 * import so the migration stays runnable by the knex CLI on its own.
 *
 * Leaves the value untouched when it doesn't look like a phone number —
 * a migration should never silently discard data it can't interpret.
 */
function normalizeSql(column: string): string {
  const digits = `regexp_replace(regexp_replace(${column}, '\\D', '', 'g'), '^00', '')`;
  return `
    CASE
      WHEN length(${digits}) = 12 AND left(${digits}, 3) = '233' THEN ${digits}
      WHEN length(${digits}) = 10 AND left(${digits}, 1) = '0'   THEN '233' || right(${digits}, 9)
      WHEN length(${digits}) = 9                                  THEN '233' || ${digits}
      WHEN length(${digits}) BETWEEN 10 AND 15
       AND left(${digits}, 1) <> '0'                              THEN ${digits}
      ELSE ${column}
    END
  `;
}

export async function up(knex: Knex): Promise<void> {
  // --- 1. users: email optional, MSISDN as the identity key ---
  await knex.raw(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);

  await knex.raw(`
    UPDATE "users"
    SET "mobile_number" = ${normalizeSql(`"mobile_number"`)}
    WHERE "role" = 'CUSTOMER' AND "mobile_number" IS NOT NULL
  `);

  // Normalising can merge two spellings of the same number into a genuine
  // duplicate. Fail loudly and let an operator decide which row survives
  // rather than deleting or renaming someone's account automatically.
  await knex.raw(`
    DO $$
    DECLARE dupes text;
    BEGIN
      SELECT string_agg(mobile_number, ', ') INTO dupes
      FROM (
        SELECT mobile_number
        FROM users
        WHERE role = 'CUSTOMER' AND mobile_number IS NOT NULL
        GROUP BY mobile_number
        HAVING count(*) > 1
      ) d;

      IF dupes IS NOT NULL THEN
        RAISE EXCEPTION
          'Duplicate CUSTOMER mobile_number values (%). Merge these accounts before migrating.', dupes;
      END IF;
    END $$;
  `);

  await knex.raw(`
    CREATE UNIQUE INDEX "users_customer_msisdn_unique"
    ON "users" ("mobile_number")
    WHERE "mobile_number" IS NOT NULL AND "role" = 'CUSTOMER'
  `);

  // --- 2. payment_sessions: merchant-supplied customer identity ---
  await knex.schema.alterTable("payment_sessions", (table) => {
    table.string("customer_email", 255).nullable();
    table.string("customer_name", 255).nullable();
    table.string("customer_phone", 15).nullable();
  });

  // --- 3. transactions: payer name, normalised phone, lookup index ---
  await knex.schema.alterTable("transactions", (table) => {
    table.string("payer_name", 255).nullable();
  });

  await knex.raw(`
    UPDATE "transactions"
    SET "payer_phone" = ${normalizeSql(`"payer_phone"`)}
    WHERE "payer_phone" IS NOT NULL
  `);

  // Serves the customer directory's per-customer spend aggregate.
  await knex.raw(`
    CREATE INDEX "transactions_merchant_customer_status_index"
    ON "transactions" ("merchant_id", "customer_id", "status")
    WHERE "customer_id" IS NOT NULL
  `);

  // --- 4. customers: drop the counters, they're computed from now on ---
  await knex.schema.alterTable("customers", (table) => {
    table.dropColumn("total_spent");
    table.dropColumn("transaction_count");
    table.dropColumn("last_transaction_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("customers", (table) => {
    table.bigInteger("total_spent").notNullable().defaultTo(0);
    table.integer("transaction_count").notNullable().defaultTo(0);
    table.timestamp("last_transaction_at").nullable();
  });

  await knex.raw(`DROP INDEX IF EXISTS "transactions_merchant_customer_status_index"`);
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("payer_name");
  });

  await knex.schema.alterTable("payment_sessions", (table) => {
    table.dropColumn("customer_phone");
    table.dropColumn("customer_name");
    table.dropColumn("customer_email");
  });

  await knex.raw(`DROP INDEX IF EXISTS "users_customer_msisdn_unique"`);

  // Re-imposing NOT NULL would fail on any phone-only payer created while the
  // column was nullable, so those rows get a placeholder derived from their
  // id — unique, obviously synthetic, and never deliverable.
  await knex.raw(`
    UPDATE "users"
    SET "email" = 'payer+' || "id" || '@invalid.local'
    WHERE "email" IS NULL
  `);
  await knex.raw(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);

  // Phone normalisation is not reversed: the original spellings are gone, and
  // the normalised form is still a valid value for every one of those rows.
}
