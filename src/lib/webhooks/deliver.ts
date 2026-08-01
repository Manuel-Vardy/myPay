import "server-only";
import crypto from "crypto";
import db from "@/lib/db";

/**
 * Outbound merchant webhook delivery.
 *
 * Signing mirrors the inbound provider pattern (see /api/webhooks/triton):
 * X-Trite-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of `${t}.${body}`>
 * Receivers recompute the HMAC with their whsec_ secret and compare
 * timing-safely, rejecting stale timestamps.
 */

const BACKOFF_MINUTES = [1, 5, 30, 120, 480, 1440]; // 1m 5m 30m 2h 8h 24h
const MAX_ATTEMPTS = BACKOFF_MINUTES.length;
const DELIVERY_TIMEOUT_MS = 10_000;

export function signWebhookPayload(
  secret: string,
  timestamp: number,
  body: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

/**
 * Attempt delivery of one webhook_events row. Safe to call fire-and-forget
 * post-commit and from the cron drain. Re-reads the endpoint's CURRENT url +
 * secret so secret rotation and fixed URLs apply to redeliveries.
 */
export async function attemptDelivery(eventId: string): Promise<boolean> {
  const event = await db("webhook_events").where({ id: eventId }).first();
  if (!event) return false;
  if (event.status === "DELIVERED" || event.status === "EXHAUSTED") return false;

  const endpoint = await db("webhook_endpoints")
    .where({ merchant_id: event.merchant_id, is_active: true })
    .first();
  if (!endpoint) {
    await db("webhook_events").where({ id: eventId }).update({
      status: "EXHAUSTED",
      last_error: "No active webhook endpoint",
      last_attempt_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    return false;
  }

  const body =
    typeof event.payload === "string"
      ? event.payload
      : JSON.stringify(event.payload);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signWebhookPayload(endpoint.secret, timestamp, body);

  let responseStatus: number | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Trite-Signature": `t=${timestamp},v1=${signature}`,
        "X-Trite-Event": event.event_type,
        "User-Agent": "TRITE-Webhooks/1.0",
      },
      body,
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
      redirect: "error",
    });
    responseStatus = res.status;
    if (res.ok) {
      await db("webhook_events").where({ id: eventId }).update({
        status: "DELIVERED",
        attempt_count: event.attempt_count + 1,
        last_attempt_at: db.fn.now(),
        delivered_at: db.fn.now(),
        response_status: responseStatus,
        last_error: null,
        updated_at: db.fn.now(),
      });
      return true;
    }
    errorMessage = `Receiver responded ${res.status}`;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Delivery failed";
  }

  const attempts = event.attempt_count + 1;
  const exhausted = attempts >= MAX_ATTEMPTS;
  const nextRetryAt = exhausted
    ? null
    : new Date(Date.now() + BACKOFF_MINUTES[attempts] * 60_000);

  await db("webhook_events").where({ id: eventId }).update({
    status: exhausted ? "EXHAUSTED" : "FAILED",
    attempt_count: attempts,
    last_attempt_at: db.fn.now(),
    next_retry_at: nextRetryAt,
    response_status: responseStatus,
    last_error: errorMessage,
    updated_at: db.fn.now(),
  });
  return false;
}

/**
 * Deliver due PENDING/FAILED events. Rows are claimed with FOR UPDATE SKIP
 * LOCKED so concurrent drains (cron overlap, multiple instances) don't
 * double-send.
 */
export async function drainPendingWebhooks(opts?: {
  batch?: number;
}): Promise<{ attempted: number; delivered: number }> {
  const batch = opts?.batch ?? 50;

  const claimed = await db.raw(
    `UPDATE webhook_events SET last_attempt_at = now()
     WHERE id IN (
       SELECT id FROM webhook_events
       WHERE status IN ('PENDING', 'FAILED') AND next_retry_at <= now()
       ORDER BY next_retry_at
       LIMIT ?
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id`,
    [batch]
  );

  const ids: string[] = (claimed.rows || []).map((r: { id: string }) => r.id);
  let delivered = 0;
  for (const id of ids) {
    if (await attemptDelivery(id)) delivered += 1;
  }
  return { attempted: ids.length, delivered };
}
