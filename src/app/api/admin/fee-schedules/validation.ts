// Shared validation for fee schedule create/update payloads.

export const FEE_TYPES = [
  "PAYMENT_PROCESSING",
  "PAYMENT_GATEWAY",
  "CROSS_BORDER",
  "CRYPTO_NETWORK_GAS",
  "THREE_DS_AUTH",
  "CHARGEBACK",
  "REFUND_PROCESSING",
  "SETTLEMENT_TRANSFER",
  "SETTLEMENT_FX",
  "EARLY_SETTLEMENT",
  "SETTLEMENT_MINIMUM_SHORTFALL",
  "MONTHLY_PLATFORM",
  "API_CALL_OVERAGE",
  "DISPUTE_MANAGEMENT",
  "KYC_VERIFICATION",
];
export const CALCULATION_METHODS = [
  "FLAT",
  "PERCENTAGE",
  "FLAT_PLUS_PERCENTAGE",
  "TIERED",
];
export const APPLICABILITIES = [
  "ALL_MERCHANTS",
  "MERCHANT_TIER",
  "MERCHANT_SPECIFIC",
];
export const MERCHANT_TIERS = ["STANDARD", "PREMIUM", "ENTERPRISE"];

export function validateScheduleBody(
  body: Record<string, unknown>
): string | null {
  if (!FEE_TYPES.includes(body.fee_type as string)) return "Invalid fee_type";
  if (!CALCULATION_METHODS.includes(body.calculation_method as string))
    return "Invalid calculation_method";
  if (!APPLICABILITIES.includes(body.applicability as string))
    return "Invalid applicability";
  if (
    body.applicability === "MERCHANT_TIER" &&
    !MERCHANT_TIERS.includes(body.merchant_tier as string)
  )
    return "merchant_tier is required for MERCHANT_TIER applicability";
  if (body.applicability === "MERCHANT_SPECIFIC" && !body.merchant_id)
    return "merchant_id is required for MERCHANT_SPECIFIC applicability";
  if (
    body.calculation_method === "TIERED" &&
    !Array.isArray(body.tiered_bands)
  )
    return "tiered_bands array is required for TIERED calculation";
  const flat = Number(body.flat_amount ?? 0);
  const rate = Number(body.percentage_rate ?? 0);
  if (!Number.isFinite(flat) || flat < 0) return "flat_amount must be >= 0";
  if (!Number.isFinite(rate) || rate < 0 || rate > 99.9999)
    return "percentage_rate must be between 0 and 99.9999";
  return null;
}
