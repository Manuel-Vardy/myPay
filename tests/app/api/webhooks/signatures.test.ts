import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifySignature } from "@/app/api/webhooks/paystack/route";
import { verifyWebhookSignature } from "@/app/api/webhooks/triton/route";

/**
 * Inbound provider webhook signature verification.
 *
 * These two endpoints credit merchant balances and complete payouts on the
 * strength of the signature alone, so forging one is the whole attack. Both
 * verifiers are exported from their route module purely so they can be tested
 * here — Next only constrains the HTTP-method exports of a `route.ts`, so the
 * extra export is inert at build and runtime.
 */

describe("Paystack — verifySignature", () => {
  const secret = "sk_test_0123456789abcdef";
  const body = JSON.stringify({ event: "charge.success", data: { amount: 10_000 } });
  const sign = (b: string, s = secret) =>
    createHmac("sha512", s).update(b, "utf8").digest("hex");

  it("accepts a correct signature", () => {
    expect(verifySignature(body, sign(body), secret)).toBe(true);
  });

  it("rejects a missing signature header", () => {
    expect(verifySignature(body, null, secret)).toBe(false);
    expect(verifySignature(body, "", secret)).toBe(false);
  });

  it("rejects a signature made with a different secret", () => {
    expect(verifySignature(body, sign(body, "sk_test_attacker"), secret)).toBe(false);
  });

  it("rejects a signature that does not cover the body sent", () => {
    const forged = JSON.stringify({ event: "charge.success", data: { amount: 999_999 } });
    // Replaying yesterday's valid signature against an inflated amount.
    expect(verifySignature(forged, sign(body), secret)).toBe(false);
  });

  it("uses SHA-512, not the SHA-256 most providers use", () => {
    const sha256 = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifySignature(body, sha256, secret)).toBe(false);
  });

  it("returns false rather than throwing on a wrong-length signature", () => {
    // timingSafeEqual throws on length mismatch; the guard has to short-circuit.
    expect(() => verifySignature(body, "abc", secret)).not.toThrow();
    expect(verifySignature(body, "abc", secret)).toBe(false);
    expect(verifySignature(body, sign(body) + "00", secret)).toBe(false);
  });

  it("is case sensitive about the hex digest", () => {
    expect(verifySignature(body, sign(body).toUpperCase(), secret)).toBe(false);
  });

  it("covers the exact bytes received, so re-serialising the JSON breaks it", () => {
    // Verification must run on the raw body: parse-and-restringify changes
    // whitespace and would fail against the provider's signature.
    const reserialised = JSON.stringify(JSON.parse(body), null, 2);
    expect(verifySignature(reserialised, sign(body), secret)).toBe(false);
    expect(verifySignature(body, sign(body), secret)).toBe(true);
  });

  it("verifies an empty body", () => {
    expect(verifySignature("", sign(""), secret)).toBe(true);
    expect(verifySignature("", sign("x"), secret)).toBe(false);
  });

  it("handles a UTF-8 payload consistently", () => {
    const utf8 = JSON.stringify({ customer: "Ámà Owusu", note: "café ☕" });
    expect(verifySignature(utf8, sign(utf8), secret)).toBe(true);
  });
});

describe("Triton — verifyWebhookSignature", () => {
  const secret = "whsec_triton_0123456789";
  const timestamp = "1750000000";
  const event = { type: "invoice.paid", data: { invoiceId: "inv_1", hash: "0xabc" } };
  const sign = (ts: string, body: unknown, s = secret) =>
    createHmac("sha256", s)
      .update(`${ts}.${JSON.stringify(body)}`, "utf8")
      .digest("hex");

  it("accepts a correct signature", () => {
    expect(
      verifyWebhookSignature(timestamp, event, sign(timestamp, event), secret)
    ).toBe(true);
  });

  it("rejects a missing signature", () => {
    expect(verifyWebhookSignature(timestamp, event, null, secret)).toBe(false);
  });

  it("rejects a missing timestamp", () => {
    expect(verifyWebhookSignature(null, event, sign(timestamp, event), secret)).toBe(false);
  });

  it("rejects an absent timestamp even when the signature covers the absence", () => {
    // Without the explicit `!timestamp` guard the function would interpolate
    // the missing header into the signed string and compare normally, so a
    // signature computed over the literal "null." prefix would authenticate.
    // A delivery with no timestamp header must never verify, whatever it signs.
    const signedOverNull = createHmac("sha256", secret)
      .update(`null.${JSON.stringify(event)}`, "utf8")
      .digest("hex");
    expect(verifyWebhookSignature(null, event, signedOverNull, secret)).toBe(false);
  });

  it("rejects a signature made with a different secret", () => {
    expect(
      verifyWebhookSignature(timestamp, event, sign(timestamp, event, "wrong"), secret)
    ).toBe(false);
  });

  it("binds the signature to its timestamp, so a capture cannot be replayed", () => {
    expect(
      verifyWebhookSignature("1750009999", event, sign(timestamp, event), secret)
    ).toBe(false);
  });

  it("rejects a tampered payload", () => {
    const forged = { ...event, data: { ...event.data, hash: "0xdeadbeef" } };
    expect(
      verifyWebhookSignature(timestamp, forged, sign(timestamp, event), secret)
    ).toBe(false);
  });

  it("uses SHA-256, not SHA-512", () => {
    const sha512 = createHmac("sha512", secret)
      .update(`${timestamp}.${JSON.stringify(event)}`, "utf8")
      .digest("hex");
    expect(verifyWebhookSignature(timestamp, event, sha512, secret)).toBe(false);
  });

  it("returns false rather than throwing on a wrong-length signature", () => {
    expect(() => verifyWebhookSignature(timestamp, event, "abc", secret)).not.toThrow();
    expect(verifyWebhookSignature(timestamp, event, "abc", secret)).toBe(false);
  });

  it("signs the re-serialised body, so incoming whitespace does not matter", () => {
    // Unlike Paystack's raw-bytes scheme, the route parses the body first and
    // signs JSON.stringify(event). A pretty-printed delivery still verifies.
    const asDelivered = JSON.parse(JSON.stringify(event, null, 2));
    expect(
      verifyWebhookSignature(timestamp, asDelivered, sign(timestamp, event), secret)
    ).toBe(true);
  });

  it("is sensitive to key order, since JSON.stringify preserves it", () => {
    // Same fields, different declaration order — a real constraint of signing a
    // re-serialised object rather than the bytes received.
    const reordered = { data: event.data, type: event.type };
    expect(
      verifyWebhookSignature(timestamp, reordered, sign(timestamp, event), secret)
    ).toBe(false);
  });
});
