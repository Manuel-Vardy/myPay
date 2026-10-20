// POST /api/v1/payments/charge — debit a mobile money wallet directly, with
// no Trite-hosted checkout. Auth: Authorization: Bearer trite_sk_...
//
// The merchant is derived from the API key. Because this moves money on the
// payer's behalf rather than just minting a checkout link, it requires a
// fully verified merchant (email verified + KYC APPROVED).
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireActiveApiKey } from "@/lib/guards";
import { createPaymentSession, PaymentSessionInputError } from "@/lib/payments/sessions";
import { PaymentsPausedError } from "@/lib/payments/controls";
import { chargeMobileMoney } from "@/lib/payments/charge";
import {
  parseNetwork,
  chargeOutcomeResponse,
  NETWORK_ERROR,
  SUPPORTED_CURRENCY,
} from "./shared";

export async function POST(request: NextRequest) {
  const guard = await requireActiveApiKey(request, { endpoint: "v1/payments/charge" });
  if (guard.error) return guard.error;
  const { merchant, apiKeyId } = guard;

  try {
    const body = await request.json().catch(() => ({}));
    const { amount, mobile_number, provider, currency, description, payer_email, payer_name } =
      body;

    if (!mobile_number || typeof mobile_number !== "string") {
      return Response.json({ error: "mobile_number is required" }, { status: 400 });
    }

    const network = parseNetwork(provider);
    if (!network) {
      return Response.json({ error: NETWORK_ERROR }, { status: 400 });
    }

    // createPaymentSession defaults to USD, which is never right for mobile
    // money — default and constrain to GHS here instead.
    const resolvedCurrency = (currency || SUPPORTED_CURRENCY).toUpperCase();
    if (resolvedCurrency !== SUPPORTED_CURRENCY) {
      return Response.json(
        { error: `currency must be ${SUPPORTED_CURRENCY} for mobile money charges` },
        { status: 400 }
      );
    }

    // Reuse the session path so a direct charge is auditable and reportable
    // exactly like a hosted-checkout payment: same amount validation, same
    // paused-merchant refusal, same minor-units conversion, same audit log.
    const created = await createPaymentSession(merchant, {
      amount,
      currency: resolvedCurrency,
      description,
      // A direct charge always knows who it is debiting, so the session that
      // backs it is never short of an identity.
      customer_email: typeof payer_email === "string" ? payer_email : null,
      customer_name: typeof payer_name === "string" ? payer_name : null,
      customer_phone: mobile_number,
    }, { origin: "API", apiKeyId });

    const session = await db("payment_sessions").where({ id: created.session_id }).first();

    const outcome = await chargeMobileMoney({
      session,
      network,
      phoneNumber: mobile_number,
      payerEmail: typeof payer_email === "string" ? payer_email : null,
      payerName: typeof payer_name === "string" ? payer_name : null,
      triggeredBy: "merchant:api",
    });

    return chargeOutcomeResponse(outcome, created.session_id);
  } catch (error) {
    if (error instanceof PaymentSessionInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof PaymentsPausedError) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    console.error("v1 charge error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
