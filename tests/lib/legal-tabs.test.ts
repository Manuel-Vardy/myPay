import { describe, it, expect } from "vitest";
import { tabs } from "@/app/legal/page";

describe("Legal Page Tabs Configuration", () => {
  it("includes all 14 regulatory policies from the legal docx", () => {
    const tabIds = tabs.map((t) => t.id);

    expect(tabIds).toContain("privacy-policy");
    expect(tabIds).toContain("general-terms-of-use");
    expect(tabIds).toContain("data-retention-and-protection-policy");
    expect(tabIds).toContain("information-security-policy");
    expect(tabIds).toContain("overview");
    expect(tabIds).toContain("mobile-messaging-terms");
    expect(tabIds).toContain("refund-policy");
    expect(tabIds).toContain("consumer-protection-policy");
    expect(tabIds).toContain("charge-back");
    expect(tabIds).toContain("api-docs");
    expect(tabIds).toContain("anti-money-laundering-policy");
    expect(tabIds).toContain("kyc-policy");
    expect(tabIds).toContain("anti-fraud-policy");
    expect(tabIds).toContain("warning-disclaimer-notice-of-non-liability-for-sharing-opt");

    expect(tabs.find((t) => t.id === "api-docs")?.name).toBe("API Docs");
    expect(tabs.find((t) => t.id === "warning-disclaimer-notice-of-non-liability-for-sharing-opt")?.name).toBe(
      "Warning Disclaimer Notice of Non-Liability for sharing OTP"
    );

    expect(tabs.length).toBe(14);
  });

  it("removes deprecated tabs that were not in the legal docx", () => {
    const tabIds = tabs.map((t) => t.id);

    expect(tabIds).not.toContain("terms-of-reference");
    expect(tabIds).not.toContain("service-fees-policy");
  });
});

