// Shared helpers for the merchant-facing direct charge endpoints
// (/api/v1/payments/charge, .../submit-otp, .../{reference}).
import type { MobileMoneyNetwork } from "@/lib/payments";
import type { ChargeOutcome } from "@/lib/payments/charge";
import { fromMinorUnits } from "@/lib/utils";

/** Mobile money is Ghana-only today, and Paystack/Moolre both settle in GHS. */
export const SUPPORTED_CURRENCY = "GHS";

/**
 * Accept the network under the names merchants actually use. `provider` is
 * required — we deliberately don't infer it from the MSISDN prefix, because a
 * ported number would silently charge the wrong network.
 */
const NETWORK_ALIASES: Record<string, MobileMoneyNetwork> = {
  MTN: "MTN",
  TELECEL: "TELECEL",
  VODAFONE: "TELECEL",
  VOD: "TELECEL",
  AT: "AT",
  AIRTELTIGO: "AT",
  ATL: "AT",
};

export function parseNetwork(value: unknown): MobileMoneyNetwork | null {
  if (typeof value !== "string") return null;
  return NETWORK_ALIASES[value.trim().toUpperCase()] ?? null;
}

export const NETWORK_ERROR =
  "provider is required and must be one of: MTN, TELECEL, AT";

/**
 * Map a charge outcome onto the merchant-facing response.
 *
 * `reference` is the merchant's handle for everything that follows — the OTP
 * submission, the status read, and the `reference` echoed on their
 * payment.success webhook. OTP_REQUIRED is an instruction to the caller
 * rather than a transaction status; the others mirror the stored status.
 */
export function chargeOutcomeResponse(outcome: ChargeOutcome, sessionId: string): Response {
  const { transaction } = outcome;

  const base = {
    reference: transaction.tx_id_display,
    transaction_id: transaction.id,
    session_id: sessionId,
    amount: fromMinorUnits(transaction.amount),
    currency: transaction.currency,
  };

  if (outcome.kind === "OTP_REQUIRED") {
    return Response.json(
      { ...base, status: "OTP_REQUIRED", message: outcome.message },
      { status: 202 }
    );
  }

  if (outcome.kind === "FAILED") {
    return Response.json(
      { ...base, status: "FAILED", message: outcome.message },
      { status: 422 }
    );
  }

  return Response.json(
    { ...base, status: "INITIATED", message: outcome.message },
    { status: 202 }
  );
}
