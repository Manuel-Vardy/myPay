import "server-only";
import crypto from "crypto";
import type { Knex } from "knex";

/**
 * Enqueue an outbound merchant webhook inside the SAME transaction as the
 * state change it announces — same discipline as recordTransactionEvent.
 * Delivery happens after commit (see deliver.ts); never do HTTP in here.
 */

export const MERCHANT_EVENT_TYPES = [
  "payment.success",
  "payment.failed",
  "payout.success",
  "payout.failed",
] as const;

export type MerchantEventType = (typeof MERCHANT_EVENT_TYPES)[number];

export interface EnqueueParams {
  merchantId: string;
  transactionId?: string | null;
  eventType: MerchantEventType;
  data: Record<string, unknown>;
}

/**
 * Returns the webhook_events row id to deliver post-commit, or null when the
 * merchant has no active endpoint or isn't subscribed to this event type.
 */
export async function enqueueMerchantWebhook(
  trx: Knex.Transaction,
  params: EnqueueParams
): Promise<string | null> {
  const { merchantId, transactionId, eventType, data } = params;

  const endpoint = await trx("webhook_endpoints")
    .where({ merchant_id: merchantId, is_active: true })
    .first();
  if (!endpoint) return null;

  const events: string[] = endpoint.events || [];
  if (!events.includes(eventType)) return null;

  const eventId = crypto.randomUUID();
  await trx("webhook_events").insert({
    id: eventId,
    merchant_id: merchantId,
    transaction_id: transactionId || null,
    event_type: eventType,
    endpoint_url: endpoint.url,
    payload: JSON.stringify({
      id: `evt_${eventId.replace(/-/g, "")}`,
      type: eventType,
      created_at: new Date().toISOString(),
      data,
    }),
    status: "PENDING",
    next_retry_at: new Date(),
  });

  return eventId;
}
