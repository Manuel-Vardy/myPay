import { NextRequest } from "next/server";
import db from "@/lib/db";
import type { MobileMoneyProvider } from "@/lib/payments";
import { getMobileMoneyProvider } from "@/lib/payments";
import { MoolreProvider } from "@/lib/payments/moolre";
import { AnmProvider } from "@/lib/payments/anm";
import { settleMomoPayment, failMomoPayment } from "@/lib/payments/settle-momo";

// Mobile money settlement is poll-driven: the provider webhook callback is
// account-level and the account is shared, so callbacks go to the account
// owner's system, never ours. The checkout page only polls while the payer
// keeps the tab open (~5 min), so any payment approved after that window
// would stay INITIATED forever without this sweep.
const DEFAULT_BATCH_LIMIT = 100;
const MAX_BATCH_LIMIT = 500;
// Don't touch transactions younger than this — the payer may still be on the
// USSD prompt and the checkout poll is already watching those.
const DEFAULT_GRACE_MINUTES = 10;
// If the provider still has no transaction under our ref after this long,
// the payment was never created on their side (abandoned prompt, OTP never
// completed, or the payer retried under a new transaction) — fail it.
const DEFAULT_NOT_FOUND_FAIL_HOURS = 24;
// Moolre keeps unanswered USSD prompts as txstatus 0 ("pending") forever.
// A prompt is only answerable for minutes, so a transaction still pending
// at the provider after this long expired unanswered — fail it. Without
// this, eternal-pendings accumulate and eventually fill every batch.
const DEFAULT_PENDING_FAIL_HOURS = 48;

const providerByName: Record<string, MobileMoneyProvider> = {
  moolre: new MoolreProvider(),
  appsnmobile: new AnmProvider(),
  anm: new AnmProvider(),
};

function resolveProvider(
  metadataProvider: unknown,
  activeProvider: MobileMoneyProvider
): MobileMoneyProvider {
  if (typeof metadataProvider !== "string") return activeProvider;
  const normalized = metadataProvider.toLowerCase().replace(/[^a-z]/g, "");
  return providerByName[normalized] ?? activeProvider;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_BATCH_LIMIT, 1),
    MAX_BATCH_LIMIT
  );
  const graceMinutes =
    Number(searchParams.get("grace")) || DEFAULT_GRACE_MINUTES;
  const notFoundFailHours =
    Number(searchParams.get("notFoundFailHours")) || DEFAULT_NOT_FOUND_FAIL_HOURS;
  const pendingFailHours =
    Number(searchParams.get("pendingFailHours")) || DEFAULT_PENDING_FAIL_HOURS;

  try {
    const cutoff = new Date(Date.now() - graceMinutes * 60 * 1000);

    // Newest first: a payment approved moments ago is the one a customer is
    // waiting on; ancient stragglers get picked up as the backlog drains.
    const stuck = await db("transactions")
      .where({ method: "MOBILE_MONEY", status: "INITIATED" })
      .where("created_at", "<=", cutoff)
      .orderBy("created_at", "desc")
      .limit(limit);

    const activeProvider = await getMobileMoneyProvider();

    let settled = 0;
    let failed = 0;
    let pending = 0;
    let notFound = 0;
    let expiredPending = 0;
    const errors: { txId: string; error: string }[] = [];
    const notFoundCutoff = new Date(
      Date.now() - notFoundFailHours * 60 * 60 * 1000
    );
    const pendingCutoff = new Date(
      Date.now() - pendingFailHours * 60 * 60 * 1000
    );

    for (const transaction of stuck) {
      try {
        const metadata =
          typeof transaction.metadata === "string"
            ? JSON.parse(transaction.metadata || "{}")
            : transaction.metadata || {};

        const provider = resolveProvider(metadata.provider, activeProvider);

        const statusResult = await provider.checkStatus({
          externalRef: transaction.tx_id_display,
        });

        if (statusResult.status === "SUCCESS") {
          await settleMomoPayment({
            transactionId: transaction.id,
            providerRef: statusResult.providerRef || null,
            thirdPartyRef: statusResult.thirdPartyRef || null,
            providerName: provider.name,
            source: "CRON_RECONCILE",
          });
          settled++;
        } else if (statusResult.status === "FAILED") {
          await failMomoPayment({
            transactionId: transaction.id,
            providerRef: statusResult.providerRef || null,
            providerMessage: statusResult.message,
            providerName: provider.name,
            source: "CRON_RECONCILE",
          });
          failed++;
        } else if (
          statusResult.status === "NOT_FOUND" &&
          new Date(transaction.created_at) <= notFoundCutoff
        ) {
          await failMomoPayment({
            transactionId: transaction.id,
            providerRef: null,
            providerMessage: `No transaction at ${provider.name} after ${notFoundFailHours}h — payment was never completed`,
            providerName: provider.name,
            source: "CRON_RECONCILE",
          });
          notFound++;
        } else if (
          statusResult.status === "PENDING" &&
          new Date(transaction.created_at) <= pendingCutoff
        ) {
          await failMomoPayment({
            transactionId: transaction.id,
            providerRef: statusResult.providerRef || null,
            providerMessage: `Still pending at ${provider.name} after ${pendingFailHours}h — USSD prompt expired unanswered`,
            providerName: provider.name,
            source: "CRON_RECONCILE",
          });
          expiredPending++;
        } else {
          pending++;
        }
      } catch (err) {
        errors.push({
          txId: transaction.tx_id_display,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (settled > 0 || failed > 0 || notFound > 0 || expiredPending > 0 || errors.length > 0) {
      await db("system_logs").insert({
        level: errors.length > 0 ? "WARN" : "INFO",
        source: "CRON_RECONCILE",
        event_description: `MoMo reconciliation: ${stuck.length} scanned, ${settled} settled, ${failed} failed, ${notFound} failed as not-found, ${expiredPending} failed as expired-pending, ${pending} still pending, ${errors.length} errors`,
      });
    }

    return Response.json({
      success: true,
      scanned: stuck.length,
      settled,
      failed,
      failedAsNotFound: notFound,
      failedAsExpiredPending: expiredPending,
      pending,
      errors,
    });
  } catch (error) {
    console.error("Cron reconcile-momo error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
