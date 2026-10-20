// POST /api/admin/settlements/[id]/resolve — close out a payout stuck in
// PROCESSING.
//
// A settlement sits in PROCESSING when the transfer left the merchant float
// but no terminal answer ever came back: the provider timed out mid-transfer,
// or a Paystack webhook was never delivered and the reference has since
// aged past anything the reconciler can verify. The reconciler raises a
// CRITICAL "payout stuck in flight" alert telling an operator to confirm with
// the provider whether the money actually moved — this is where they record
// the answer.
//
// Deliberately never inferred: only a human who has checked the provider's
// own records can say which way it went, and both directions are irreversible
// once posted. PAID completes the settlement; NOT_PAID returns the reserve
// and the fee to the merchant's float and fails the linked withdrawal
// request, freeing the merchant to try again.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";
import { fromMinorUnits } from "@/lib/utils";
import { completeSettlement, failSettlement } from "@/lib/settlements/finalize";

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

    const outcome = String(body.outcome || "").toUpperCase();
    const reference = typeof body.reference === "string" ? body.reference.trim().slice(0, 255) : "";
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";

    if (!["PAID", "NOT_PAID"].includes(outcome)) {
      return Response.json({ error: "outcome must be PAID or NOT_PAID" }, { status: 400 });
    }
    if (!note) {
      return Response.json(
        { error: "A note is required — record what the provider told you and how you checked" },
        { status: 400 }
      );
    }

    const settlement = await db("settlements").where({ id }).first();
    if (!settlement) {
      return Response.json({ error: "Settlement not found" }, { status: 404 });
    }
    if (settlement.status !== "PROCESSING") {
      return Response.json(
        { error: `Settlement is ${settlement.status} — only a PROCESSING payout can be resolved` },
        { status: 409 }
      );
    }

    const auditBase = {
      actor_id: adminUserId,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    };
    const amount = `${fromMinorUnits(settlement.net_amount)} ${settlement.currency}`;

    if (outcome === "PAID") {
      const moved = await completeSettlement({
        settlementId: id,
        providerRef: reference || settlement.bank_reference || null,
        source: "ADMIN_RESOLVE",
        providerMetadata: {
          resolved_by: adminUserId,
          resolved_outcome: "PAID",
          resolved_note: note,
          ...(reference && { resolved_reference: reference }),
        },
      });

      await db("system_logs").insert({
        ...auditBase,
        level: "WARN",
        source: "ADMIN_RESOLVE",
        event_description:
          `Settlement ${settlement.settlement_id_display} (${amount}) manually resolved as PAID ` +
          `by admin ${adminUserId}${reference ? `, reference ${reference}` : ""} | ${note}`,
      });

      return Response.json({ status: "COMPLETED", changed: moved });
    }

    const moved = await failSettlement({
      settlementId: id,
      reason: `Confirmed not paid by the provider: ${note}`,
      source: "ADMIN_RESOLVE",
      providerMetadata: {
        resolved_by: adminUserId,
        resolved_outcome: "NOT_PAID",
        resolved_note: note,
      },
    });

    await db("system_logs").insert({
      ...auditBase,
      level: "WARN",
      source: "ADMIN_RESOLVE",
      event_description:
        `Settlement ${settlement.settlement_id_display} (${amount}) manually resolved as NOT PAID ` +
        `by admin ${adminUserId} — reserve and fee returned to merchant float | ${note}`,
    });

    return Response.json({ status: "FAILED", changed: moved });
  } catch (error) {
    console.error("Settlement resolve error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
