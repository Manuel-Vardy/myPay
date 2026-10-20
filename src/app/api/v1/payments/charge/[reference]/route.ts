// GET /api/v1/payments/charge/{reference} — read the current state of a
// direct charge. Auth: Authorization: Bearer trite_sk_...
//
// This is the pull complement to the merchant's own payment.success /
// payment.failed webhook, for integrations that don't run a receiver. The
// webhook is the recommended completion signal: by the time a merchant polls,
// the Paystack webhook has usually already settled the row.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireActiveApiKey } from "@/lib/guards";
import { pollAndSettleMomo } from "@/lib/payments/charge";
import { fromMinorUnits } from "@/lib/utils";

// A merchant polling every second must not become a provider call every
// second — that burns their provider rate limit and ours to learn nothing the
// webhook isn't already telling us.
const POLL_THROTTLE_MS = 10_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  // Status reads get their own, more generous bucket so a polling loop can
  // never starve the bucket that creates charges.
  const guard = await requireActiveApiKey(request, {
    endpoint: "v1/payments/charge:status",
    limit: 300,
  });
  if (guard.error) return guard.error;
  const { merchant } = guard;

  try {
    const { reference } = await params;

    const transaction = await db("transactions")
      .where({ tx_id_display: reference, merchant_id: merchant.id })
      .first();

    if (!transaction) {
      return Response.json({ error: "Charge not found" }, { status: 404 });
    }

    const status = await pollAndSettleMomo(transaction, {
      minIntervalMs: POLL_THROTTLE_MS,
    });

    // The poll writes failure_reason and updated_at as it settles or fails —
    // re-read so the merchant gets the reason with the status, not a turn late.
    const current =
      status === transaction.status
        ? transaction
        : (await db("transactions").where({ id: transaction.id }).first()) ?? transaction;

    return Response.json({
      reference: current.tx_id_display,
      transaction_id: current.id,
      session_id: current.payment_session_id,
      status: current.status,
      amount: fromMinorUnits(current.amount),
      currency: current.currency,
      method: current.method,
      failure_reason: current.failure_reason || null,
      created_at: current.created_at,
      updated_at: current.updated_at,
    });
  } catch (error) {
    console.error("v1 charge status error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
