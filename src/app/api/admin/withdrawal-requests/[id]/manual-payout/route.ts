// POST /api/admin/withdrawal-requests/[id]/manual-payout — record a payout an
// operator made by hand.
//
// The case this exists for: a merchant requests a withdrawal, the approval
// runs, and the rails decline — our provider float is empty, or the provider
// is down. The operator pays the merchant from a company account instead.
//
// Recording that as a status change alone would be worse than doing nothing.
// A declined transfer returns the reserve and the fee to the merchant's
// float, so after an out-of-band payment the money is gone but the ledger
// still says the merchant has it — and they can withdraw it a second time.
// So this runs the payment through the ordinary settlement flow with the
// manual provider standing in for a rail: the funds actually leave the float,
// the merchant gets their `payout.success` webhook, and the settlement shows
// up in reporting as `payout_provider = "Manual"`.
//
// An external reference is mandatory. Money leaving the business off-rail
// must always point at something an auditor can follow.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";
import { processSettlement } from "@/lib/settlements/process";
import { getManualPayoutProvider } from "@/lib/payments";

/** Statuses a manual payout may be recorded against. */
const PAYABLE = ["PENDING", "FAILED"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermission("settlement-monitoring");
  if (guard.error) return guard.error;
  const adminUserId = guard.session.userId;

  try {
    const { id } = await params;
    const body = await request.json();

    const reference = typeof body.reference === "string" ? body.reference.trim().slice(0, 255) : "";
    const note = typeof body.note === "string" ? body.note.slice(0, 1000) : null;
    const waiveFee = body.waive_fee === true;

    if (!reference) {
      return Response.json(
        { error: "An external reference is required — the momo or bank receipt for the payment you made" },
        { status: 400 }
      );
    }

    const existing = await db("withdrawal_requests").where({ id }).first();
    if (!existing) {
      return Response.json({ error: "Withdrawal request not found" }, { status: 404 });
    }
    if (!PAYABLE.includes(existing.status)) {
      return Response.json(
        {
          error:
            `Request is ${existing.status} — a manual payout can only be recorded against ` +
            `${PAYABLE.join(" or ")}. An APPROVED request has already been paid; ` +
            `resolve a stuck payout on its settlement instead.`,
        },
        { status: 409 }
      );
    }

    // Check for an in-flight rail payout explicitly, before anything else.
    // processSettlement would refuse anyway — its reserve has already drained
    // the float — but it reports that as "Non-positive balance", which reads
    // as "this merchant has no money" when the truth is "a transfer may be
    // about to land". That is the one place an operator must not be misled:
    // paying by hand on top of a transfer that then succeeds pays twice.
    const inFlight = await db("settlements")
      .where({ merchant_id: existing.merchant_id, currency: existing.currency })
      .whereIn("status", ["PENDING", "PROCESSING"])
      .first("settlement_id_display", "status", "payout_provider");
    if (inFlight) {
      return Response.json(
        {
          error:
            `A payout for this merchant is still in flight — settlement ` +
            `${inFlight.settlement_id_display} (${inFlight.status}` +
            `${inFlight.payout_provider ? ` via ${inFlight.payout_provider}` : ""}). ` +
            `Confirm with the provider whether that transfer moved and resolve it ` +
            `before recording a manual payout, or you risk paying twice.`,
        },
        { status: 409 }
      );
    }

    // Claim it the same way approval does, so two operators can't both record
    // a manual payout for the same request.
    const [claimed] = await db("withdrawal_requests")
      .where({ id, status: existing.status })
      .update({ status: "PROCESSING", updated_at: new Date() })
      .returning("*");
    if (!claimed) {
      return Response.json(
        { error: "The request changed status — reload and try again" },
        { status: 409 }
      );
    }

    const releaseClaim = () =>
      db("withdrawal_requests").where({ id }).update({
        status: existing.status,
        updated_at: new Date(),
      });

    const account = await db("settlement_accounts")
      .where({ id: claimed.settlement_account_id })
      .first();
    if (!account) {
      await releaseClaim();
      return Response.json(
        { error: "The settlement account for this request no longer exists" },
        { status: 409 }
      );
    }

    const balanceRow = await db("ledger_account_balances")
      .where({
        owner_id: claimed.merchant_id,
        account_type: "MERCHANT_FLOAT",
        currency: claimed.currency,
      })
      .first();
    const balance = BigInt(balanceRow?.balance ?? 0);

    const result = await processSettlement(
      claimed.merchant_id,
      account,
      balance,
      claimed.currency,
      getManualPayoutProvider(),
      {
        requestedAmount: BigInt(claimed.amount),
        source: "MANUAL_PAYOUT",
        withdrawalRequestId: id,
        ...(waiveFee && {
          waiveFeeReason: `Manual payout recorded by admin ${adminUserId}`,
        }),
        reference,
      }
    );

    if (result.status !== "COMPLETED") {
      // Nothing moved — the balance is short, or a rail settlement is still
      // in flight for this merchant and must resolve before we pay by hand.
      await releaseClaim();
      await db("system_logs").insert({
        level: "WARN",
        source: "MANUAL_PAYOUT",
        event_description:
          `Manual payout for ${claimed.request_id_display} not recorded (${result.status}): ` +
          `${result.reason ?? "no reason given"}`,
        actor_id: adminUserId,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      });
      return Response.json(
        {
          error:
            result.reason ||
            "The payout could not be recorded against this merchant's balance right now",
        },
        { status: 409 }
      );
    }

    await db("withdrawal_requests").where({ id }).update({
      status: "APPROVED",
      settlement_id: result.settlementId,
      reviewed_by: adminUserId,
      reviewed_at: new Date(),
      review_note: note,
      failure_reason: null,
      updated_at: new Date(),
    });

    await db("system_logs").insert({
      level: "WARN",
      source: "MANUAL_PAYOUT",
      event_description:
        `Manual payout recorded for ${claimed.request_id_display} by admin ${adminUserId} — ` +
        `GHS ${fromMinorUnits(claimed.amount).toFixed(2)} to ${account.provider_name} ` +
        `${account.account_number}, reference ${reference}` +
        (waiveFee ? " (transfer fee waived)" : "") +
        (note ? ` | ${note}` : ""),
      actor_id: adminUserId,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    });

    return Response.json({
      status: "APPROVED",
      settlement_id: result.settlementId,
      reference,
      fee_waived: waiveFee,
    });
  } catch (error) {
    console.error("Manual payout error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
