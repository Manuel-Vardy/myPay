// GET /api/merchant/transactions/[id] — merchant-scoped transaction detail + timeline
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireMerchant();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;

    const merchant = await db("merchants")
      .where({ user_id: guard.session.userId })
      .first("id");
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const transaction = await db("transactions")
      .where({ id, merchant_id: merchant.id })
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
