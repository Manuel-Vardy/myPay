import { describe, expect, it } from "vitest";
import { NETWORK_LABELS, resolveMomoNetwork } from "@/lib/payments/networks";

/**
 * `settlement_accounts.provider_name` is free text the merchant typed. Getting
 * this wrong routes a payout to the wrong telco, so the matching rules — and
 * the substring bug they were written to fix — are pinned here.
 */
describe("resolveMomoNetwork", () => {
  it("resolves MTN under its common spellings", () => {
    expect(resolveMomoNetwork("MTN")).toBe("MTN");
    expect(resolveMomoNetwork("MTN MoMo")).toBe("MTN");
    expect(resolveMomoNetwork("mtn mobile money")).toBe("MTN");
  });

  it("resolves Telecel, including its Vodafone-era names", () => {
    expect(resolveMomoNetwork("Telecel Cash")).toBe("TELECEL");
    expect(resolveMomoNetwork("Vodafone Cash")).toBe("TELECEL");
    expect(resolveMomoNetwork("voda cash")).toBe("TELECEL");
  });

  it("resolves AirtelTigo under all three brand names", () => {
    expect(resolveMomoNetwork("AirtelTigo Money")).toBe("AT");
    expect(resolveMomoNetwork("Airtel Money")).toBe("AT");
    expect(resolveMomoNetwork("Tigo Cash")).toBe("AT");
    expect(resolveMomoNetwork("AT Money")).toBe("AT");
  });

  it("matches 'at' on a word boundary, not as a substring", () => {
    // Regression: a bare includes("at") routed these to AirtelTigo.
    expect(resolveMomoNetwork("Stanbic Bank Cash")).toBeNull();
    expect(resolveMomoNetwork("Cathay Wallet")).toBeNull();
    expect(resolveMomoNetwork("Platinum Pay")).toBeNull();
  });

  it("is case insensitive", () => {
    expect(resolveMomoNetwork("tElEcEl")).toBe("TELECEL");
  });

  it("returns null for names that are not Ghanaian mobile money", () => {
    expect(resolveMomoNetwork("Ecobank")).toBeNull();
    expect(resolveMomoNetwork("PayPal")).toBeNull();
  });

  it("returns null for empty or missing input rather than throwing", () => {
    expect(resolveMomoNetwork("")).toBeNull();
    expect(resolveMomoNetwork(null as unknown as string)).toBeNull();
    expect(resolveMomoNetwork(undefined as unknown as string)).toBeNull();
  });

  it("labels every network it can resolve", () => {
    for (const network of ["MTN", "TELECEL", "AT"] as const) {
      expect(NETWORK_LABELS[network]).toBeTruthy();
    }
  });
});
