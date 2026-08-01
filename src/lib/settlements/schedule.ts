// Platform-wide settlement payout schedule, stored in platform_settings.
//
// Payouts run at the daily payout time OR as soon as a merchant's float
// balance reaches the threshold — whichever happens first. A null threshold
// disables threshold-triggered payouts. Times are GMT (Ghana time).

import db from "@/lib/db";

export const SETTLEMENT_SCHEDULE_KEY = "settlement:schedule";

export interface SettlementSchedule {
  /** Daily payout time, "HH:MM" 24h GMT */
  payout_time: string;
  /** Instant-payout threshold in minor units; null = disabled */
  payout_threshold_minor: number | null;
  /**
   * Hours a payment credit must age in the merchant float before it becomes
   * withdrawable (manual withdrawals and auto-settlement). 0 disables aging.
   */
  withdrawal_age_hours: number;
}

export const DEFAULT_SETTLEMENT_SCHEDULE: SettlementSchedule = {
  payout_time: "18:00",
  payout_threshold_minor: null,
  withdrawal_age_hours: 24,
};

/** Max configurable aging window: 30 days. */
export const MAX_WITHDRAWAL_AGE_HOURS = 720;

export function isValidPayoutTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidWithdrawalAgeHours(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_WITHDRAWAL_AGE_HOURS
  );
}

export async function getSettlementSchedule(): Promise<SettlementSchedule> {
  const row = await db("platform_settings")
    .where({ key: SETTLEMENT_SCHEDULE_KEY })
    .first();
  if (!row) return DEFAULT_SETTLEMENT_SCHEDULE;

  const value = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
  const threshold = Number(value?.payout_threshold_minor);
  return {
    payout_time: isValidPayoutTime(value?.payout_time)
      ? value.payout_time
      : DEFAULT_SETTLEMENT_SCHEDULE.payout_time,
    payout_threshold_minor:
      value?.payout_threshold_minor != null && Number.isFinite(threshold) && threshold > 0
        ? Math.round(threshold)
        : null,
    withdrawal_age_hours: isValidWithdrawalAgeHours(value?.withdrawal_age_hours)
      ? value.withdrawal_age_hours
      : DEFAULT_SETTLEMENT_SCHEDULE.withdrawal_age_hours,
  };
}

/** Today's payout moment (GMT) for a "HH:MM" payout time. */
export function payoutTimeToday(payoutTime: string, now: Date = new Date()): Date {
  const [hours, minutes] = payoutTime.split(":").map(Number);
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes)
  );
}
