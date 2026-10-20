import type { Knex } from "knex";

/**
 * Migration 0046 — TMOS integration boundary
 *
 * TMOS (the opt-in shop management system) lives in its own repo and its own
 * Postgres schema inside this same database. This migration establishes the
 * boundary between the two:
 *
 *   public  — owned by Trite. TMOS never writes here.
 *   tmos    — owned by TMOS, which runs its own knex chain against it
 *             (migrations: { schemaName: "tmos" }).
 *
 * TMOS reads Trite data through the read-only views below rather than through
 * table grants, so that:
 *   - the column set TMOS depends on is an explicit, reviewable contract, and
 *     Trite can refactor the underlying tables freely;
 *   - credentials and payer identity are unreachable by construction —
 *     password_hash, two_factor_secret, api_keys.key_hash, payer_email,
 *     payer_phone, card_* and metadata are all absent from the views;
 *   - settlement account numbers arrive pre-masked. TMOS displays accounts and
 *     assigns them to branches; it never transacts on one. Payouts carry
 *     settlement_account_id and Trite resolves the real number server-side.
 *
 * Writes back into Trite (creating a payment session, filing a withdrawal
 * request) go through the public API with a merchant API key — never SQL.
 *
 * The grants are wrapped in a role-existence check so this runs unchanged on a
 * local database where tmos_app has not been provisioned. The role itself is
 * created out-of-band (see knowledge/tmos_integration.md in the TMOS repo) so
 * that no password ever lands in a migration file.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS tmos`);

  // --- Merchant standing -------------------------------------------------
  // Drives both the handoff gate and TMOS's ongoing re-check: KYC can be
  // revoked or expire, and a user can be suspended, long after a staff
  // session was issued.
  await knex.raw(`
    CREATE OR REPLACE VIEW public.v_tmos_merchant AS
      SELECT
        m.id                  AS merchant_id,
        m.user_id,
        m.merchant_display_id,
        m.business_name,
        m.tier,
        m.region,
        m.payments_paused_at,
        u.status              AS user_status,
        u.email_verified_at,
        u.mobile_verified_at,
        k.status              AS kyc_status
      FROM merchants m
      JOIN users u ON u.id = m.user_id
      LEFT JOIN kyc_records k ON k.user_id = m.user_id
  `);

  // --- Transactions ------------------------------------------------------
  // Amounts and status only. TMOS attributes these to its own branches via
  // its own sales rows (payment_session_id / transaction_id), so no branch
  // dimension is added here — branch stays a TMOS concept.
  await knex.raw(`
    CREATE OR REPLACE VIEW public.v_tmos_transactions AS
      SELECT
        t.id,
        t.tx_id_display,
        t.merchant_id,
        t.amount,
        t.currency,
        t.method,
        t.rail,
        t.status,
        t.processing_fee,
        t.payment_session_id,
        t.created_at,
        t.updated_at
      FROM transactions t
  `);

  await knex.raw(`
    CREATE OR REPLACE VIEW public.v_tmos_settlements AS
      SELECT
        s.id,
        s.settlement_id_display,
        s.merchant_id,
        s.account_id            AS settlement_account_id,
        s.gross_amount,
        s.fees,
        s.net_amount,
        s.currency,
        s.status,
        s.date_range_start,
        s.date_range_end,
        s.transaction_count,
        s.created_at
      FROM settlements s
  `);

  // --- Settlement accounts ----------------------------------------------
  // Account numbers are masked here, not in application code, so there is no
  // code path by which TMOS can read a full one.
  await knex.raw(`
    CREATE OR REPLACE VIEW public.v_tmos_settlement_accounts AS
      SELECT
        sa.id,
        sa.merchant_id,
        sa.account_type,
        sa.provider_name,
        sa.account_name,
        '****' || right(sa.account_number, 4) AS account_number_masked,
        sa.branch_code,
        sa.is_default,
        sa.created_at
      FROM settlement_accounts sa
  `);

  // --- Grants ------------------------------------------------------------
  // REFERENCES on merchants and settlement_accounts lets tmos.companies and
  // tmos.branches carry real cross-schema foreign keys. A view cannot be the
  // target of a foreign key, so integrity points at the tables while reads go
  // through the views.
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tmos_app') THEN
        GRANT USAGE, CREATE ON SCHEMA tmos TO tmos_app;
        GRANT USAGE ON SCHEMA public TO tmos_app;

        GRANT SELECT ON
          public.v_tmos_merchant,
          public.v_tmos_transactions,
          public.v_tmos_settlements,
          public.v_tmos_settlement_accounts
        TO tmos_app;

        GRANT REFERENCES ON public.merchants TO tmos_app;
        GRANT REFERENCES ON public.settlement_accounts TO tmos_app;
      END IF;
    END $$;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP VIEW IF EXISTS public.v_tmos_settlement_accounts`);
  await knex.raw(`DROP VIEW IF EXISTS public.v_tmos_settlements`);
  await knex.raw(`DROP VIEW IF EXISTS public.v_tmos_transactions`);
  await knex.raw(`DROP VIEW IF EXISTS public.v_tmos_merchant`);
  // The tmos schema is dropped only if TMOS has already dropped its own
  // tables — never cascade a schema full of another system's data.
  await knex.raw(`DROP SCHEMA IF EXISTS tmos RESTRICT`);
}
