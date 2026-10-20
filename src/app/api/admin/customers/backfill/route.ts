// POST /api/admin/customers/backfill — build customer records from payments
// that settled before automatic linking existed.
//
// Auth: an admin session, or `Authorization: Bearer ${CRON_SECRET}` so it can
// be driven from a job runner during a migration window.
//
// Idempotent and resumable: it selects only settled transactions with no
// customer_id, and linking sets that column, so a row can never be processed
// twice and a second run over a finished backfill links nothing. Safe to call
// repeatedly until `remaining` reaches 0.
import { NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";
import { linkTransactionCustomer } from "@/lib/payments/customers";
import type { Transaction } from "@/lib/types";

// Linking hashes a placeholder password per new customer, and bcrypt at cost
// 12 costs ~0.37s a row — measured against prod, where 100 rows took 36.8s.
// Cloud Run cuts the request off at 300s, so anything past ~700 cannot finish;
// a 2000 cap invited a batch that died mid-flight (rows commit individually,
// so it was resumable, but the caller gets no response to act on). 500 always
// completes with room to spare. Raising this means shortening the hash or
// moving the work to a job.
const DEFAULT_BATCH_LIMIT = 250;
const MAX_BATCH_LIMIT = 500;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCronCall = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

  if (!isCronCall) {
    const guard = await requirePermission("manage-customers");
    if (guard.error) return guard.error;
  }

  const limit = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("limit")) || DEFAULT_BATCH_LIMIT, 1),
    MAX_BATCH_LIMIT
  );

  try {
    // Oldest first, so a partially-completed backfill resumes in a
    // predictable place and the earliest relationships are established first.
    const pending: Transaction[] = await db("transactions")
      .where({ status: "SETTLED" })
      .whereNull("customer_id")
      .orderBy("created_at", "asc")
      .limit(limit);

    let linked = 0;
    let skippedNoIdentity = 0;
    let failed = 0;

    for (const transaction of pending) {
      // One transaction per DB transaction: a payment we can't interpret
      // shouldn't cost us the whole batch.
      try {
        const userId = await db.transaction((trx) =>
          linkTransactionCustomer(trx, transaction)
        );
        if (userId) linked += 1;
        else skippedNoIdentity += 1;
      } catch (error) {
        failed += 1;
        console.error(`Backfill failed for ${transaction.tx_id_display}:`, error);
      }
    }

    // Transactions with no identity stay NULL forever, so they are counted
    // out of `remaining` — otherwise it could never reach zero.
    const remainingResult = await db("transactions")
      .where({ status: "SETTLED" })
      .whereNull("customer_id")
      .count("id as cnt")
      .first();

    await db("system_logs").insert({
      level: "INFO",
      source: "ADMIN_BACKFILL",
      event_description:
        `Customer backfill: processed ${pending.length} | linked ${linked} | ` +
        `no identity ${skippedNoIdentity} | failed ${failed}`,
    });

    return Response.json({
      processed: pending.length,
      linked,
      skipped_no_identity: skippedNoIdentity,
      failed,
      /** Includes payments that can never be linked — see skipped_no_identity. */
      remaining: Number(remainingResult?.cnt || 0),
    });
  } catch (error) {
    console.error("Customer backfill error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
