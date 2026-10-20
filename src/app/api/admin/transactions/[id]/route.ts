// GET /api/admin/transactions/[id] — transaction detail + status timeline
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermission("refund-transactions");
  if (guard.error) return guard.error;

  try {
    const { id } = await params;

    // description lives on the session, not the transaction — it is the
    // merchant's own order reference, passed to /v1/payments/initiate or
    // /v1/payments/charge.
    const transaction = await db("transactions")
      .leftJoin("merchants", "transactions.merchant_id", "merchants.id")
      .leftJoin("payment_sessions", "transactions.payment_session_id", "payment_sessions.id")
      .where("transactions.id", id)
      .select(
        "transactions.*",
        "merchants.business_name as merchant_name",
        "merchants.merchant_display_id",
        "payment_sessions.description as description"
      )
      .first();

    if (!transaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    const events = await db("transaction_events")
      .where({ transaction_id: id })
      .orderBy("created_at", "asc")
      .select("id", "from_status", "to_status", "triggered_by", "raw_payload", "created_at");

    return Response.json({ transaction, events });
  } catch (error) {
    console.error("Failed to fetch transaction detail", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
