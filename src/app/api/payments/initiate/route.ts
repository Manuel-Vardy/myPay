// POST /api/payments/initiate — DEPRECATED alias of /api/v1/payments/initiate.
// Requires an API key like the v1 route; the merchant comes from the key, and
// the historical body merchant_id is ignored.
import { type NextRequest } from "next/server";
import { requireApiKey } from "@/lib/guards";
import {
  createPaymentSession,
  PaymentSessionInputError,
} from "@/lib/payments/sessions";
import { PaymentsPausedError } from "@/lib/payments/controls";

export async function POST(request: NextRequest) {
  const guard = await requireApiKey(request, { endpoint: "v1/payments" });
  if (guard.error) return guard.error;
  const { merchant } = guard;

  try {
    const body = await request.json().catch(() => ({}));
    const session = await createPaymentSession(merchant, {
      amount: body.amount,
      currency: body.currency,
      description: body.description,
      redirect_url: body.redirect_url,
    });
    return Response.json(session, {
      status: 201,
      headers: { Deprecation: "true", Link: '</api/v1/payments/initiate>; rel="successor-version"' },
    });
  } catch (error) {
    if (error instanceof PaymentSessionInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof PaymentsPausedError) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    console.error("Payment initiate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
