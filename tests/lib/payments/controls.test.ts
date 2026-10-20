import { describe, expect, it } from "vitest";
import { isMerchantPaused, PaymentsPausedError } from "@/lib/payments/controls";

describe("isMerchantPaused", () => {
  it("reports a merchant with a pause timestamp as paused", () => {
    expect(isMerchantPaused({ payments_paused_at: new Date() })).toBe(true);
    expect(isMerchantPaused({ payments_paused_at: "2026-08-22T00:00:00Z" })).toBe(true);
  });

  it("reports an unpaused merchant as not paused", () => {
    expect(isMerchantPaused({ payments_paused_at: null })).toBe(false);
    expect(isMerchantPaused({ payments_paused_at: undefined })).toBe(false);
    expect(isMerchantPaused({})).toBe(false);
  });

  it("treats the epoch as a real pause rather than a falsy timestamp", () => {
    // new Date(0) is truthy as an object, but a raw 0 would not be.
    expect(isMerchantPaused({ payments_paused_at: new Date(0) })).toBe(true);
  });
});

describe("PaymentsPausedError", () => {
  it("is an Error subclass with a discoverable name", () => {
    const err = new PaymentsPausedError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("PaymentsPausedError");
    expect(err.message).toContain("not currently accepting payments");
  });

  it("accepts a custom message", () => {
    expect(new PaymentsPausedError("halted").message).toBe("halted");
  });
});
