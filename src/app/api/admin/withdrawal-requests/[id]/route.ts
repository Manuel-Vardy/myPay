// PATCH /api/admin/withdrawal-requests/[id] — approve or reject a merchant
// withdrawal request.
//
// Approve claims the request first (PENDING → PROCESSING via a conditional
// update, so two admins can't both pay it out), then runs the same
// reserve-then-pay settlement flow the cron uses:
//   - transfer ok / outcome unknown → APPROVED, linked to the settlement row
//   - provider declined             → FAILED (funds already returned to float)
//   - settlement skipped            → request reverts to PENDING, 409 returned
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";
import { processSettlement } from "@/lib/settlements/process";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const adminUserId = guard.session.userId;

  try {
    const { id } = await params;
    const body = await request.json();
    const action = String(body.action || "").toUpperCase();
    const note = typeof body.note === "string" ? body.note.slice(0, 1000) : null;

    if (!["APPROVE", "REJECT"].includes(action)) {
      return Response.json({ error: "action must be APPROVE or REJECT" }, { status: 400 });
    }

    const existing = await db("withdrawal_requests").where({ id }).first();
    if (!existing) {
      return Response.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (action === "REJECT") {
      const [updated] = await db("withdrawal_requests")
        .where({ id, status: "PENDING" })
        .update({
          status: "REJECTED",
          reviewed_by: adminUserId,
          reviewed_at: new Date(),
          review_note: note,
          updated_at: new Date(),
        })
        .returning("*");
      if (!updated) {
        return Response.json(
          { error: `Request is ${existing.status} — only PENDING requests can be rejected` },
          { status: 409 }
        );
      }

      await db("system_logs").insert({
        level: "INFO",
        source: "WITHDRAWAL_REVIEW",
        event_description:
          `Withdrawal request ${existing.request_id_display} REJECTED by admin ${adminUserId}` +
          (note ? `: ${note}` : ""),
      });

      return Response.json({ status: "REJECTED", request_id: id });
    }

    // ---- APPROVE ----
    // Claim the request so concurrent approvals can't double-pay.
    const [claimed] = await db("withdrawal_requests")
      .where({ id, status: "PENDING" })
      .update({ status: "PROCESSING", updated_at: new Date() })
      .returning("*");
    if (!claimed) {
      return Response.json(
        { error: `Request is ${existing.status} — only PENDING requests can be approved` },
        { status: 409 }
      );
    }

    const account = await db("settlement_accounts")
      .where({ id: claimed.settlement_account_id })
      .first();
    if (!account) {
      await db("withdrawal_requests")
        .where({ id })
        .update({ status: "PENDING", updated_at: new Date() });
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
      undefined,
      {
        requestedAmount: BigInt(claimed.amount),
        source: "WITHDRAWAL_APPROVAL",
        withdrawalRequestId: id,
      }
    );

    if (result.status === "COMPLETED" || result.status === "UNKNOWN") {
      await db("withdrawal_requests").where({ id }).update({
        status: "APPROVED",
        settlement_id: result.settlementId,
        reviewed_by: adminUserId,
        reviewed_at: new Date(),
        review_note: note,
        updated_at: new Date(),
      });
      await db("system_logs").insert({
        level: "INFO",
        source: "WITHDRAWAL_REVIEW",
        event_description:
          `Withdrawal request ${claimed.request_id_display} APPROVED by admin ${adminUserId} — ` +
          `payout ${result.status} for GHS ${fromMinorUnits(claimed.amount).toFixed(2)}`,
      });
      return Response.json({
        status: "APPROVED",
        payout_status: result.status,
        settlement_id: result.settlementId,
      });
    }

    if (result.status === "FAILED") {
      // Provider definitively declined — processSettlement already returned
      // the reserve and fee to the merchant float.
      await db("withdrawal_requests").where({ id }).update({
        status: "FAILED",
        settlement_id: result.settlementId,
        reviewed_by: adminUserId,
        reviewed_at: new Date(),
        review_note: note,
        failure_reason: result.reason || "Payout provider declined the transfer",
        updated_at: new Date(),
      });
      return Response.json(
        {
          status: "FAILED",
          error: result.reason || "The payout provider declined the transfer",
        },
        { status: 502 }
      );
    }

    // SKIPPED — nothing was moved; release the claim so it can be retried.
    await db("withdrawal_requests")
      .where({ id })
      .update({ status: "PENDING", updated_at: new Date() });
    return Response.json(
      { error: result.reason || "Payout is not possible right now" },
      { status: 409 }
    );
  } catch (error) {
    console.error("Admin withdrawal review error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
