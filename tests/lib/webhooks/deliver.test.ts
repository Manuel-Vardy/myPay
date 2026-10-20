import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { signWebhookPayload } from "@/lib/webhooks/deliver";

/**
 * Merchants verify inbound Trite webhooks by recomputing this HMAC. The scheme
 * (`t=<unix>,v1=<hex sha256 of "<t>.<body>">`) is a public integration contract:
 * changing it silently breaks every merchant's receiver.
 */
describe("signWebhookPayload", () => {
  const secret = "whsec_0123456789abcdef";
  const body = JSON.stringify({ event: "payment.success", data: { amount: 100 } });

  it("signs the timestamp and body as `<t>.<body>` with HMAC-SHA256", () => {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`1750000000.${body}`)
      .digest("hex");
    expect(signWebhookPayload(secret, 1750000000, body)).toBe(expected);
  });

  it("returns a 64-char hex digest", () => {
    expect(signWebhookPayload(secret, 1750000000, body)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same inputs", () => {
    expect(signWebhookPayload(secret, 1750000000, body)).toBe(
      signWebhookPayload(secret, 1750000000, body)
    );
  });

  it("changes when the body changes", () => {
    expect(signWebhookPayload(secret, 1750000000, body)).not.toBe(
      signWebhookPayload(secret, 1750000000, body.replace("100", "999999"))
    );
  });

  it("changes when the timestamp changes, so a capture cannot be replayed", () => {
    expect(signWebhookPayload(secret, 1750000000, body)).not.toBe(
      signWebhookPayload(secret, 1750000001, body)
    );
  });

  it("changes when the secret rotates", () => {
    expect(signWebhookPayload(secret, 1750000000, body)).not.toBe(
      signWebhookPayload("whsec_rotated", 1750000000, body)
    );
  });

  it("binds the timestamp to the body rather than concatenating loosely", () => {
    // Without the separator, ("17500000001", "23") and ("1750000000", "123")
    // would sign identical bytes and a signature would transfer between them.
    expect(signWebhookPayload(secret, 17500000001, "23")).not.toBe(
      signWebhookPayload(secret, 1750000000, "123")
    );
  });
});
