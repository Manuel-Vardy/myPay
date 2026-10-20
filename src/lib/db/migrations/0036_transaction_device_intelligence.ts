import type { Knex } from "knex";

/**
 * Migration 0036 — device intelligence on transactions
 *
 * On hosted checkout the payer is unauthenticated and every field they submit
 * (email, phone, wallet) is attacker-controlled and free to rotate per attempt,
 * so none of it supports a velocity rule. The Fingerprint device identifier is
 * the one value that survives that rotation, which is what makes card testing
 * ("one device, fifty payer numbers") detectable at all.
 *
 * device_visitor_id is resolved server-side from the identification event —
 * never read from the request body, see lib/payments/device-risk.ts.
 * device_event_id is kept so an analyst can pull the full signal set for a
 * given payment out of the Fingerprint dashboard after the fact.
 *
 * The partial index serves the velocity lookup on the checkout hot path;
 * partial because the column is null for every transaction predating this
 * migration and for any payment where identification failed open.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.string("device_visitor_id", 64).nullable();
    table.string("device_event_id", 64).nullable();
  });

  await knex.raw(
    `CREATE INDEX "transactions_device_visitor_id_created_at_index"
     ON "transactions" ("device_visitor_id", "created_at")
     WHERE "device_visitor_id" IS NOT NULL`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `DROP INDEX IF EXISTS "transactions_device_visitor_id_created_at_index"`
  );
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("device_event_id");
    table.dropColumn("device_visitor_id");
  });
}
