// POST /api/v1/payments/charge/submit-otp — complete a charge that came back
// with status OTP_REQUIRED. Auth: Authorization: Bearer trite_sk_...
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireActiveApiKey } from "@/lib/guards";
import { chargeMobileMoney } from "@/lib/payments/charge";
import { parseMetadata } from "@/lib/payments/charge";
import type { MobileMoneyNetwork } from "@/lib/payments";
import { chargeOutcomeResponse, parseNetwork } from "../shared";

export async function POST(request: NextRequest) {
  const guard = await requireActiveApiKey(request, { endpoint: "v1/payments/charge" });
  if (guard.error) return guard.error;
  const { merchant } = guard;

  try {
    const body = await request.json().catch(() => ({}));
    const { reference, otp } = body;

    if (!reference || typeof reference !== "string") {
      return Response.json({ error: "reference is required" }, { status: 400 });
    }
    if (!otp || typeof otp !== "string") {
      return Response.json({ error: "otp is required" }, { status: 400 });
    }

    // Scoping to the calling merchant is load-bearing, not defensive: without
    // it any valid API key could complete another merchant's charge.
    const transaction = await db("transactions")
      .where({ tx_id_display: reference, merchant_id: merchant.id })
      .first();

    if (!transaction) {
      return Response.json({ error: "Charge not found" }, { status: 404 });
    }

    if (transaction.status !== "INITIATED") {
      return Response.json(
        {
          error: `Charge is no longer awaiting an OTP (status: ${transaction.status})`,
          reference,
          status: transaction.status,
        },
        { status: 409 }
      );
    }

    const session = await db("payment_sessions")
      .where({ id: transaction.payment_session_id })
      .first();

    if (!session) {
      return Response.json({ error: "Charge session not found" }, { status: 404 });
    }

    const metadata = parseMetadata(transaction.metadata);
    const network = parseNetwork(metadata.mobile_money_network);
    const phoneNumber =
      typeof metadata.mobile_money_number === "string"
        ? metadata.mobile_money_number
        : transaction.payer_phone;

    if (!network || !phoneNumber) {
      return Response.json(
        { error: "Charge is missing mobile money details and cannot be resumed" },
        { status: 409 }
      );
    }

    // The OTP re-enters chargeMobileMoney, which resumes the existing
    // INITIATED transaction rather than opening a second one — so the
    // provider sees the same externalRef it issued the OTP against.
    const outcome = await chargeMobileMoney({
      session,
      network: network as MobileMoneyNetwork,
      phoneNumber,
      payerEmail: transaction.payer_email,
      otpCode: otp,
      triggeredBy: "merchant:api",
    });

    return chargeOutcomeResponse(outcome, session.id);
  } catch (error) {
    console.error("v1 charge submit-otp error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
