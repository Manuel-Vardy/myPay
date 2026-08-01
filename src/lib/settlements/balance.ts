// Withdrawable-balance math shared by the merchant dashboard, the withdraw
// endpoint, the settlement cron, and processSettlement's phase-1 lock.
//
// A payment becomes withdrawable once it has aged in the merchant float for
// the platform's configured window (settlement:schedule → withdrawal_age_hours,
// default 24h, 0 disables aging). Withdrawable = float balance
//   − payment credits younger than the window (entries NOT tied to a
//     settlement — settlement-linked credits are reserve returns / fee
//     reversals and stay withdrawable immediately)
//   − amounts held by PENDING/PROCESSING withdrawal requests, so the
//     auto-settlement cron cannot sweep funds an approved-in-flight or
//     awaiting-approval withdrawal needs.

import type { Knex } from "knex";
import db from "@/lib/db";
import { getSettlementSchedule } from "@/lib/settlements/schedule";

/** Statuses that hold a withdrawal request's amount against the float. */
export const WITHDRAWAL_HOLD_STATUSES = ["PENDING", "PROCESSING"] as const;

/** Sum of float credits younger than the aging window (non-settlement entries). */
export async function getRecentPaymentCredits(
  knexOrTrx: Knex,
  accountId: string,
  ageHours: number
): Promise<bigint> {
  if (ageHours <= 0) return 0n;
  const row = await knexOrTrx("ledger_entries")
    .where({ account_id: accountId, entry_type: "CREDIT" })
    .whereNull("settlement_id")
    .where(
      "created_at",
      ">",
      knexOrTrx.raw("NOW() - make_interval(hours => ?)", [Math.floor(ageHours)])
    )
    .sum("amount as sum")
    .first();
  return BigInt(row?.sum ?? 0);
}

/** Total held by in-flight withdrawal requests, optionally excluding one. */
export async function getWithdrawalHoldTotal(
  knexOrTrx: Knex,
  merchantId: string,
  currency: string,
  excludeRequestId?: string
): Promise<bigint> {
  let query = knexOrTrx("withdrawal_requests")
    .where({ merchant_id: merchantId, currency })
    .whereIn("status", [...WITHDRAWAL_HOLD_STATUSES]);
  if (excludeRequestId) query = query.whereNot("id", excludeRequestId);
  const row = await query.sum("amount as sum").first();
  return BigInt(row?.sum ?? 0);
}

export interface MerchantFloatBalances {
  /** Full float balance (minor units). */
  total: bigint;
  /** Aged funds: total minus payment credits younger than the aging window. */
  aged: bigint;
  /** Held by PENDING/PROCESSING withdrawal requests. */
  withdrawalHold: bigint;
  /** What a new withdrawal (or the auto-settlement) can actually take now. */
  withdrawable: bigint;
  /** The aging window (hours) these figures were computed with. */
  ageHours: number;
}

export async function getMerchantFloatBalances(
  merchantId: string,
  currency: string
): Promise<MerchantFloatBalances> {
  const { withdrawal_age_hours: ageHours } = await getSettlementSchedule();

  const account = await db("ledger_accounts")
    .where({ owner_id: merchantId, account_type: "MERCHANT_FLOAT", currency })
    .first();
  if (!account) {
    return { total: 0n, aged: 0n, withdrawalHold: 0n, withdrawable: 0n, ageHours };
  }

  const balanceRow = await db("ledger_account_balances")
    .where({ account_id: account.id })
    .first();
  const total = BigInt(balanceRow?.balance ?? 0);

  const recentCredits = await getRecentPaymentCredits(db, account.id, ageHours);
  const withdrawalHold = await getWithdrawalHoldTotal(db, merchantId, currency);

  const aged = total - recentCredits > 0n ? total - recentCredits : 0n;
  const withdrawable = aged - withdrawalHold > 0n ? aged - withdrawalHold : 0n;

  return { total, aged, withdrawalHold, withdrawable, ageHours };
}
