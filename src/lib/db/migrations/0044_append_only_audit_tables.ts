import type { Knex } from "knex";

/**
 * Migration 0044 — Append-only enforcement for audit evidence tables
 *
 * `system_logs` and `ledger_entries` are both described as immutable in the
 * BoG compliance response (control point CP-5), but until now that was a
 * convention: the schema simply omitted `updated_at` and the application
 * happened never to issue an UPDATE. Convention is not a control. A stray
 * query, a careless migration, or a compromised application role could
 * silently rewrite audit history and nothing would object.
 *
 * This adds the engine-level guard: UPDATE, DELETE and TRUNCATE all raise
 * insufficient_privilege on both tables. Corrections to the ledger are made
 * the way double-entry accounting has always made them — by posting a
 * reversing entry, never by editing the original.
 *
 * ## The escape hatch, and why it exists
 *
 * The guard yields when `trite.allow_immutable_writes` is set to 'on' for the
 * current transaction. Two legitimate callers need this:
 *
 *   1. Seeds, which truncate the world to rebuild a known fixture state.
 *      Note that `TRUNCATE transactions CASCADE` reaches `ledger_entries`
 *      through its foreign key, so seeds trip this guard even where they
 *      never name the table.
 *   2. Future data-retention purges, once a retention schedule exists.
 *
 * Any future migration that needs to backfill these tables must set it too
 * (migration 0035 rewrote `ledger_entries` and would be blocked today).
 * Always use `SET LOCAL` inside an explicit transaction — a plain `SET` binds
 * to one pooled connection and will not reliably apply to the next statement.
 *
 * ## What this does and does not prove
 *
 * This stops the application role from rewriting history, which is the
 * realistic threat and the one an auditor asks about. It is a rail, not a
 * cryptographic guarantee: anyone who can open a psql session can set the GUC
 * or drop the trigger outright. Closing that gap needs the two follow-ups
 * tracked for Q4 2026 — a restricted application role that does not own these
 * tables (so `REVOKE UPDATE, DELETE` actually binds), and export to Cloud
 * Logging under a retention lock so a second copy sits outside the database
 * entirely. Hash-chaining rows is the third option if non-repudiation ever has
 * to survive a hostile DBA.
 */

const GUARDED_TABLES = ["system_logs", "ledger_entries"] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION trite_enforce_append_only()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      -- Deliberate, transaction-scoped bypass for seeds, retention purges and
      -- backfill migrations. Unset (NULL) is the normal case and falls through.
      IF current_setting('trite.allow_immutable_writes', true) = 'on' THEN
        IF TG_OP = 'UPDATE' THEN RETURN NEW; END IF;
        IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
        RETURN NULL; -- TRUNCATE fires statement-level; return value unused
      END IF;

      RAISE EXCEPTION
        'append-only violation: % on "%" is not permitted', TG_OP, TG_TABLE_NAME
        USING
          ERRCODE = 'insufficient_privilege',
          HINT = 'These rows are audit evidence and cannot be altered. '
                 'Correct a ledger entry by posting a reversing entry. '
                 'For seeds or a retention purge, open a transaction and '
                 'SET LOCAL trite.allow_immutable_writes = ''on''.';
    END;
    $$;
  `);

  for (const table of GUARDED_TABLES) {
    // Row-level: catches UPDATE and DELETE, including cascaded deletes.
    await knex.raw(`
      CREATE TRIGGER "${table}_append_only"
        BEFORE UPDATE OR DELETE ON "${table}"
        FOR EACH ROW
        EXECUTE FUNCTION trite_enforce_append_only()
    `);

    // Statement-level: TRUNCATE bypasses row triggers entirely and would
    // otherwise empty the table without firing anything above.
    await knex.raw(`
      CREATE TRIGGER "${table}_no_truncate"
        BEFORE TRUNCATE ON "${table}"
        FOR EACH STATEMENT
        EXECUTE FUNCTION trite_enforce_append_only()
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  for (const table of GUARDED_TABLES) {
    await knex.raw(`DROP TRIGGER IF EXISTS "${table}_no_truncate" ON "${table}"`);
    await knex.raw(`DROP TRIGGER IF EXISTS "${table}_append_only" ON "${table}"`);
  }

  await knex.raw(`DROP FUNCTION IF EXISTS trite_enforce_append_only()`);
}
