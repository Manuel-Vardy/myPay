import { describe, expect, it } from "vitest";
import { extractStorageKey } from "@/lib/storage";

describe("extractStorageKey", () => {
  it("returns null for null, undefined, or empty string", () => {
    expect(extractStorageKey(null)).toBeNull();
    expect(extractStorageKey(undefined)).toBeNull();
    expect(extractStorageKey("")).toBeNull();
    expect(extractStorageKey("   ")).toBeNull();
  });

  it("preserves relative storage keys as-is", () => {
    expect(extractStorageKey("merchants/42/logo_1720000000.png")).toBe(
      "merchants/42/logo_1720000000.png"
    );
    expect(extractStorageKey("kyc/merchant_abc/COMPANY_LOGO_12345_brand.jpg")).toBe(
      "kyc/merchant_abc/COMPANY_LOGO_12345_brand.jpg"
    );
  });

  it("extracts key from path-style GCS signed URLs (storage.googleapis.com/<bucket>/<key>)", () => {
    const signedUrl =
      "https://storage.googleapis.com/trite-kyc-bucket/merchants/42/logo_1720000000.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=service-acc%40trite.iam.gserviceaccount.com&X-Goog-Date=20260920T120000Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=abcdef1234567890";
    expect(extractStorageKey(signedUrl)).toBe("merchants/42/logo_1720000000.png");
  });

  it("extracts key from virtual-hosted GCS signed URLs (<bucket>.storage.googleapis.com/<key>)", () => {
    const signedUrl =
      "https://trite-kyc-bucket.storage.googleapis.com/kyc/merchant_99/COMPANY_LOGO_brand.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Signature=abcdef1234567890";
    expect(extractStorageKey(signedUrl)).toBe("kyc/merchant_99/COMPANY_LOGO_brand.png");
  });

  it("extracts nested encoded keys properly", () => {
    const signedUrl =
      "https://storage.googleapis.com/trite-kyc-bucket/kyc/merchant%201/special%20logo.png?X-Goog-Signature=test";
    expect(extractStorageKey(signedUrl)).toBe("kyc/merchant 1/special logo.png");
  });

  it("returns null for non-GCS external URLs (allowing them to be treated as external web links)", () => {
    expect(extractStorageKey("https://example.com/assets/logo.png")).toBeNull();
    expect(extractStorageKey("https://cdn.trite.io/images/logo.svg")).toBeNull();
    expect(extractStorageKey("http://localhost:3000/logo.png")).toBeNull();
  });
});
