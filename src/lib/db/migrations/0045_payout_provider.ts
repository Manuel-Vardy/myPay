import type { Knex } from "knex";

/**
 * Record which PSP executed a payout, and cache the provider-side handles a
 * payout needs.
 *
 * Until now Moolre was the only payout rail, so "who paid this out" was
 * implicit. With payouts following `platform_settings.active_momo_provider`
 * that is no longer recoverable from the data — and the payout reconciler
 * and the Paystack transfer webhook both have to talk to whoever actually
 * holds the transfer, not whoever is primary today.
 *
 * Columns only: 0044 installed UPDATE/DELETE triggers on `ledger_entries`,
 * so nothing here may touch the ledger.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("settlements", (table) => {
    // The adapter name as reported by the provider (`Moolre`, `Paystack`),
    // matching what `transactions.metadata.provider` stores for collections.
    table.string("payout_provider", 50).nullable();
    // Provider handles and raw transfer response: transfer_code,
    // payout_initiated_at, and whatever the adapter echoed back.
    table.jsonb("provider_metadata").nullable();
  });

  // The reconciler sweeps PROCESSING settlements oldest-window-first; the
  // existing indexes are (merchant_id, status) and (created_at).
  await knex.schema.alterTable("settlements", (table) => {
    table.index(["status", "created_at"], "settlements_status_created_at_index");
  });

  await knex.schema.alterTable("settlement_accounts", (table) => {
    // Cached per-provider handles for this payee, e.g.
    // { paystack: { recipient_code: "RCP_..." } }.
    table.jsonb("provider_metadata").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("settlement_accounts", (table) => {
    table.dropColumn("provider_metadata");
  });

  await knex.schema.alterTable("settlements", (table) => {
    table.dropIndex(["status", "created_at"], "settlements_status_created_at_index");
    table.dropColumn("provider_metadata");
    table.dropColumn("payout_provider");
  });
}
