// POST /api/cron/resend-webhook — re-enqueue merchant payment webhooks with
// freshly built payloads.
//
// Ops tool, CRON_SECRET-gated like the other /api/cron routes (not on a
// schedule). Use when a delivered webhook carried a payload later found to be
// wrong (payloads are frozen into webhook_events at enqueue time, so
// retrying the stored event would resend the bad payload) or when a merchant
// asks for a replay. Body:
//
//   { "transactions": ["TX-ABC…" | <transaction uuid> | <payment_session uuid>, …] }
//
// Each entry is matched against tx_id_display, transactions.id, or
// payment_session_id. Only terminal transactions are resent: SETTLED →
// payment.success; FAILED/EXPIRED → payment.failed.
import { NextRequest } from "next/server";
import db from "@/lib/db";
import { enqueueMerchantWebhook } from "@/lib/webhooks/enqueue";
import { attemptDelivery } from "@/lib/webhooks/deliver";
import { buildPaymentWebhookData } from "@/lib/webhooks/payloads";

const MAX_BATCH = 50;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let refs: string[];
  try {
    const body = await request.json();
    refs = Array.isArray(body?.transactions) ? body.transactions : [];
  } catch {
    refs = [];
  }
  if (refs.length === 0 || refs.length > MAX_BATCH) {
    return Response.json(
      { error: `Body must be {"transactions": [1..${MAX_BATCH} refs]}` },
      { status: 400 }
    );
  }

  const results: Record<string, unknown>[] = [];

  for (const ref of refs) {
    try {
      // Comparing a non-UUID string against uuid columns throws in Postgres,
      // so only match id/payment_session_id when the ref is UUID-shaped.
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);
      const transaction = await db("transactions")
        .where((q) => {
          q.where({ tx_id_display: ref });
          if (isUuid) q.orWhere({ id: ref }).orWhere({ payment_session_id: ref });
        })
        // A session can hold several attempts (abandoned retries stay
        // INITIATED) — prefer the transaction whose webhook matters.
        .orderByRaw(
          `case status when 'SETTLED' then 0 when 'FAILED' then 1 when 'EXPIRED' then 2 else 3 end`
        )
        .orderBy("created_at", "desc")
        .first();

      if (!transaction) {
        results.push({ ref, resent: false, reason: "not_found" });
        continue;
      }

      let eventType: "payment.success" | "payment.failed";
      let extra: Record<string, unknown>;
      if (transaction.status === "SETTLED") {
        eventType = "payment.success";
        extra = { status: "SETTLED" };
      } else if (transaction.status === "FAILED" || transaction.status === "EXPIRED") {
        eventType = "payment.failed";
        extra = {
          status: transaction.status,
          failure_reason: transaction.failure_reason || "Payment failed at provider",
        };
      } else {
        results.push({
          ref,
          tx_id_display: transaction.tx_id_display,
          resent: false,
          reason: `non_terminal_status:${transaction.status}`,
        });
        continue;
      }

      const eventId = await db.transaction((trx) =>
        enqueueMerchantWebhook(trx, {
          merchantId: transaction.merchant_id,
          transactionId: transaction.id,
          eventType,
          data: { ...buildPaymentWebhookData(transaction), ...extra },
        })
      );

      if (!eventId) {
        results.push({
          ref,
          tx_id_display: transaction.tx_id_display,
          resent: false,
          reason: "no_active_endpoint_or_not_subscribed",
        });
        continue;
      }

      const delivered = await attemptDelivery(eventId);
      results.push({
        ref,
        tx_id_display: transaction.tx_id_display,
        event_type: eventType,
        event_id: eventId,
        resent: true,
        delivered, // false = queued; the retry cron keeps trying with backoff
      });
    } catch (err) {
      results.push({
        ref,
        resent: false,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await db("system_logs").insert({
    level: "INFO",
    source: "CRON_RECONCILE",
    event_description: `Webhook resend: ${results.filter((r) => r.resent).length}/${refs.length} re-enqueued`,
  });

  return Response.json({ success: true, results });
}
