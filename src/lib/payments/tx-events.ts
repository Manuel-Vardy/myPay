// Immutable transaction status audit trail (transaction_events, migration
// 0013). Record an event for EVERY status transition, inside the same knex
// transaction as the status update itself.

import type { Knex } from "knex";
import type { TransactionStatus } from "@/lib/types";

export interface TransactionEventParams {
  transactionId: string;
  /** null on the very first (INITIATED / AUTHORIZED-on-insert) event. */
  fromStatus: TransactionStatus | null;
  toStatus: TransactionStatus;
  /** e.g. "payer:checkout", "webhook:moolre", "status_poll", "admin:{id}" */
  triggeredBy: string;
  /** Raw provider response / context captured at this step. */
  payload?: Record<string, unknown> | null;
}

export async function recordTransactionEvent(
  trx: Knex.Transaction,
  params: TransactionEventParams
): Promise<void> {
  await trx("transaction_events").insert({
    transaction_id: params.transactionId,
    from_status: params.fromStatus,
    to_status: params.toStatus,
    triggered_by: params.triggeredBy,
    raw_payload: params.payload ? JSON.stringify(params.payload) : null,
  });
}
