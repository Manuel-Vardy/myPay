import type { Knex } from "knex";

/**
 * "Needs attention" — payouts stuck in flight.
 *
 * A settlement sits at PROCESSING while a transfer is in flight. Past this
 * age it is no longer in flight in any meaningful sense: either the provider
 * lost it, or there is no usable provider recorded and nothing can poll it.
 * Funds stay reserved and the merchant cannot be paid again until someone
 * resolves it, so these have to be visible.
 *
 * The reconcile-payouts cron alerts off this same threshold. Both read it
 * from here so an alert can never point at a settlement the admin UI hides.
 */
export const STALE_PAYOUT_HOURS = 48;

export function stalePayoutCutoff(hours: number = STALE_PAYOUT_HOURS): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

/**
 * Narrow a settlements query to the stuck ones. Deliberately ignores any
 * date-range filter the caller applied: a stuck payout is urgent precisely
 * because it is old, so a "last 30 days" window is the one thing that must
 * not hide it.
 */
export function whereNeedsAttention<T extends Knex.QueryBuilder>(
  query: T,
  hours: number = STALE_PAYOUT_HOURS
): T {
  return query
    .where("settlements.status", "PROCESSING")
    .where("settlements.created_at", "<=", stalePayoutCutoff(hours)) as T;
}
