// GET /api/v1/payments/[sessionId]/status — merchant checks a payment session
// Auth: Authorization: Bearer trite_sk_... — 404 unless the session belongs
// to the key's merchant.
import { type NextRequest } from "next/server";
import { requireApiKey } from "@/lib/guards";
import { getPaymentSessionStatus } from "@/lib/payments/sessions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const guard = await requireApiKey(request, { endpoint: "v1/payments" });
  if (guard.error) return guard.error;
  const { merchant } = guard;

  try {
    const { sessionId } = await params;
    const status = await getPaymentSessionStatus(sessionId, merchant.id);
    if (!status) {
      return Response.json({ error: "Payment session not found" }, { status: 404 });
    }
    return Response.json(status);
  } catch (error) {
    console.error("v1 payment status error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
