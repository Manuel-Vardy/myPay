import type { Knex } from "knex";

/**
 * Migration 0034 — Payment controls
 *
 * Two gaps this closes, both found when a merchant revoked their only API
 * key (and later deleted their payment link) and payments kept arriving:
 *
 * 1. payment_sessions.payment_link_id — sessions carried no reference to the
 *    link that spawned them, so deactivating or deleting a link could not
 *    reach the sessions already minted from it. Those stayed ACTIVE for the
 *    full 24h TTL and kept accepting payments. ON DELETE SET NULL so a link
 *    can still be hard-deleted (callers expire its sessions first).
 *
 * 2. merchants.payments_paused_at — there was no single control that stops a
 *    merchant taking money. Revoking keys blocks only the API channel; links
 *    and hosted checkout are separate channels. NULL = accepting payments.
 *    Settable by the merchant themselves or by an admin (payments_paused_by
 *    records which user, so the portal can show who to talk to).
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("payment_sessions", (table) => {
    table
      .uuid("payment_link_id")
      .nullable()
      .references("id")
      .inTable("payment_links")
      .onDelete("SET NULL");
  });

  await knex.raw(
    `CREATE INDEX "payment_sessions_payment_link_id_index"
     ON "payment_sessions" ("payment_link_id")`
  );

  await knex.schema.alterTable("merchants", (table) => {
    table.timestamp("payments_paused_at", { useTz: true }).nullable();
    table
      .uuid("payments_paused_by")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.string("payments_paused_reason", 500).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("merchants", (table) => {
    table.dropColumn("payments_paused_reason");
    table.dropColumn("payments_paused_by");
    table.dropColumn("payments_paused_at");
  });

  await knex.raw(`DROP INDEX IF EXISTS "payment_sessions_payment_link_id_index"`);
  await knex.schema.alterTable("payment_sessions", (table) => {
    table.dropColumn("payment_link_id");
  });
}
