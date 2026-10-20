// Application-wide constants (API endpoints, config values, etc.)
import type { SettlementStatus } from "@/lib/types";

export const APP_NAME = "TRITE PSP";

/**
 * Runtime whitelist for the `settlement_status` enum. Postgres raises
 * `invalid input value for enum settlement_status` on an unknown value, so any
 * caller-supplied status must be checked against this before it reaches a
 * query. `satisfies` keeps it honest against the SettlementStatus union.
 */
export const SETTLEMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const satisfies readonly SettlementStatus[];

export function isSettlementStatus(value: string): value is SettlementStatus {
  return (SETTLEMENT_STATUSES as readonly string[]).includes(value);
}
