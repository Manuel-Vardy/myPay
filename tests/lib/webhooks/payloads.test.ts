import { describe, expect, it } from "vitest";
import { buildPaymentWebhookData } from "@/lib/webhooks/payloads";

/**
 * When a merchant passes the processing fee to the customer, transactions.amount
 * is inflated by that fee. Reporting the inflated figure as the order amount
 * breaks merchant-side reconciliation, so `amount` must track fee_basis_amount.
 */
describe("buildPaymentWebhookData", () => {
  const base = {
    tx_id_display: "TRX-0001",
    payment_session_id: "sess-1",
    currency: "GHS",
    method: "MOBILE_MONEY",
  };

  it("reports amount and charged_amount separately for a customer-borne fee", () => {
    const data = buildPaymentWebhookData({
      ...base,
      amount: 10_320, // payer was charged 103.20
      fee_basis_amount: 10_000, // merchant's order was 100.00
    });
    expect(data.amount).toBe(100);
    expect(data.charged_amount).toBe(103.2);
  });

  it("reports both as equal for a merchant-borne fee", () => {
    const data = buildPaymentWebhookData({ ...base, amount: 10_000, fee_basis_amount: null });
    expect(data.amount).toBe(100);
    expect(data.charged_amount).toBe(100);
  });

  it("falls back to amount on pre-fee-bearer rows where the field is absent", () => {
    const data = buildPaymentWebhookData({ ...base, amount: 10_000 });
    expect(data.amount).toBe(100);
    expect(data.charged_amount).toBe(100);
  });

  it("handles the string amounts pg returns for bigint columns", () => {
    const data = buildPaymentWebhookData({
      ...base,
      amount: "10320",
      fee_basis_amount: "10000",
    });
    expect(data.amount).toBe(100);
    expect(data.charged_amount).toBe(103.2);
  });

  it("passes through identity fields and nothing else", () => {
    const data = buildPaymentWebhookData({ ...base, amount: 10_000 });
    expect(Object.keys(data).sort()).toEqual([
      "amount",
      "charged_amount",
      "currency",
      "method",
      "session_id",
      "tx_id_display",
    ]);
    expect(data.session_id).toBe("sess-1");
    expect(data.tx_id_display).toBe("TRX-0001");
  });

  it("carries a null session id through for API-initiated charges", () => {
    const data = buildPaymentWebhookData({
      ...base,
      payment_session_id: null,
      amount: 10_000,
    });
    expect(data.session_id).toBeNull();
  });
});
