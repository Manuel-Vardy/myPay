import type { Knex } from "knex";

/**
 * Migration 0047 — Attribute a payment session to the credential behind it.
 *
 * A session has only ever recorded its merchant, so a leaked API key could
 * not be traced to the payments it minted: revoking the key stopped future
 * requests but left "what did it already create?" unanswerable. Two columns
 * close that, and they have to be read together:
 *
 * 1. `api_key_id` — the key that created the session, for sessions created
 *    over the public API. Keys are revoked, never deleted (see the DELETE
 *    handler in /api/merchant/api-keys/[keyId]), so this stays resolvable
 *    for the life of the merchant; ON DELETE SET NULL only covers the
 *    merchant-deletion cascade.
 *
 * 2. `origin` — how the session was created. A NULL `api_key_id` on its own
 *    is ambiguous: a payment link a merchant shares by WhatsApp has no key
 *    behind it and never will, and that is not the same fact as a session
 *    whose key is unknown. `origin` separates "no key by design" from "key
 *    not recorded", which is what makes the column safe to query.
 *
 * Nullable `origin`, not NOT NULL: job-migrate runs before the service
 * rollout, so the previous revision keeps inserting sessions (over all three
 * channels) for the length of the rollout. A DEFAULT would stamp those link
 * sessions 'API' — silently wrong data of exactly the kind this migration
 * exists to prevent — so they land NULL, meaning "created before attribution
 * shipped". A later migration can SET NOT NULL once no deployed revision
 * writes sessions without it.
 *
 * The CHECK is one-directional for the same reason: a key may only appear on
 * an API-origin session, but an API-origin session is not required to carry
 * a key (backfilled and rollout-window rows have none).
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE "payment_session_origin" AS ENUM (
      'API',           -- POST /api/v1/payments/{initiate,charge}, authenticated by an API key
      'PAYMENT_LINK',  -- /lnk/[slug] resolver or /api/payments/link-session; no key exists
      'DASHBOARD'      -- reserved: a merchant creating a one-off checkout from the portal
    )
  `);

  await knex.schema.alterTable("payment_sessions", (table) => {
    table
      .uuid("api_key_id")
      .nullable()
      .references("id")
      .inTable("api_keys")
      .onDelete("SET NULL");
    table.specificType("origin", "payment_session_origin").nullable();
  });

  // Backfill what the existing data already proves: a session carrying a
  // payment_link_id came from a link. Everything else came over the API —
  // by which key is unrecoverable, so those keep a NULL api_key_id.
  await knex.raw(`
    UPDATE "payment_sessions"
       SET "origin" = CASE
             WHEN "payment_link_id" IS NOT NULL THEN 'PAYMENT_LINK'::payment_session_origin
             ELSE 'API'::payment_session_origin
           END
  `);

  await knex.raw(`
    ALTER TABLE "payment_sessions"
      ADD CONSTRAINT "payment_sessions_api_key_origin_check"
      CHECK ("api_key_id" IS NULL OR "origin" = 'API')
  `);

  // The blast-radius query ("every session this key created") is the only
  // reader, and it never asks about NULLs — keep the index off the
  // overwhelming majority of rows, which are link and legacy sessions.
  await knex.raw(`
    CREATE INDEX "payment_sessions_api_key_id_index"
      ON "payment_sessions" ("api_key_id")
      WHERE "api_key_id" IS NOT NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "payment_sessions_api_key_id_index"`);
  await knex.raw(`
    ALTER TABLE "payment_sessions"
      DROP CONSTRAINT IF EXISTS "payment_sessions_api_key_origin_check"
  `);
  await knex.schema.alterTable("payment_sessions", (table) => {
    table.dropColumn("origin");
    table.dropColumn("api_key_id");
  });
  await knex.raw(`DROP TYPE IF EXISTS "payment_session_origin"`);
}
