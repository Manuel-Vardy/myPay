import { describe, expect, it } from "vitest";
import { validateKycSubmission, type KycValidationInput } from "@/lib/kyc-validation";

describe("validateKycSubmission", () => {
  const baseValidDocs = [
    { doc_type: "BUSINESS_REGISTRATION" },
    { doc_type: "FORM_3" },
    { doc_type: "UTILITY_BILL" },
  ];

  const validDirector1 = {
    id: "dir_1",
    full_name: "Kwame Mensah",
    email: "kwame@acme.com",
    phone: "+233201234567",
    ghana_card_number: "GHA-123456789-0",
    ghana_card_front_key: "kyc/123/front.jpg",
    ghana_card_back_key: "kyc/123/back.jpg",
  };

  const validDirector2 = {
    id: "dir_2",
    full_name: "Abena Osei",
    email: "abena@acme.com",
    phone: "+233207654321",
    ghana_card_number: "GHA-987654321-0",
    ghana_card_front_key: "kyc/123/front2.jpg",
    ghana_card_back_key: "kyc/123/back2.jpg",
  };

  const validUbo = {
    id: "bo_1",
    full_name: "Kwame Mensah",
    nationality: "Ghanaian",
    ownership_percentage: 60,
    email: "kwame@acme.com",
    phone: "+233201234567",
    is_pep: false,
  };

  it("passes a fully valid LLC submission", () => {
    const input: KycValidationInput = {
      businessType: "LIMITED_LIABILITY",
      gpsAddress: "GA-183-9024",
      companyPhone: "+233201234567",
      documents: baseValidDocs,
      directors: [validDirector1, validDirector2],
      beneficialOwners: [validUbo],
    };

    const result = validateKycSubmission(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects an LLC with only 1 director (requires minimum 2 under Act 992)", () => {
    const input: KycValidationInput = {
      businessType: "LIMITED_LIABILITY",
      gpsAddress: "GA-183-9024",
      companyPhone: "+233201234567",
      documents: baseValidDocs,
      directors: [validDirector1],
      beneficialOwners: [validUbo],
    };

    const result = validateKycSubmission(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Ghana law requires at least 2 directors on the certificate for Limited Liability Companies"
    );
  });

  it("passes a Sole Proprietorship with 1 proprietor and Form A", () => {
    const input: KycValidationInput = {
      businessType: "SOLE_PROPRIETORSHIP",
      gpsAddress: "AK-039-4451",
      companyPhone: "+233201234567",
      documents: [
        { doc_type: "BUSINESS_REGISTRATION" },
        { doc_type: "FORM_A" },
        { doc_type: "UTILITY_BILL" },
      ],
      directors: [validDirector1],
      beneficialOwners: [],
    };

    const result = validateKycSubmission(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects when GhanaPost GPS address is missing", () => {
    const input: KycValidationInput = {
      businessType: "LIMITED_LIABILITY",
      gpsAddress: "",
      companyPhone: "+233201234567",
      documents: baseValidDocs,
      directors: [validDirector1, validDirector2],
      beneficialOwners: [validUbo],
    };

    const result = validateKycSubmission(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "A valid GhanaPost GPS Digital Address is required (e.g. GA-183-9024)"
    );
  });

  it("rejects when a director is missing Ghana Card back", () => {
    const directorMissingBack = {
      ...validDirector1,
      ghana_card_back_key: null,
      ghana_card_back_url: null,
    };

    const input: KycValidationInput = {
      businessType: "LIMITED_LIABILITY",
      gpsAddress: "GA-183-9024",
      companyPhone: "+233201234567",
      documents: baseValidDocs,
      directors: [directorMissingBack, validDirector2],
      beneficialOwners: [validUbo],
    };

    const result = validateKycSubmission(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Director #1: Ghana Card Back upload is required");
  });

  it("rejects when Certificate of Incorporation is missing", () => {
    const input: KycValidationInput = {
      businessType: "LIMITED_LIABILITY",
      gpsAddress: "GA-183-9024",
      companyPhone: "+233201234567",
      documents: [{ doc_type: "FORM_3" }, { doc_type: "UTILITY_BILL" }],
      directors: [validDirector1, validDirector2],
      beneficialOwners: [validUbo],
    };

    const result = validateKycSubmission(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Certificate of Incorporation / Registration is required");
  });

  it("rejects an LLC when neither beneficial owners nor BO form is submitted", () => {
    const input: KycValidationInput = {
      businessType: "LIMITED_LIABILITY",
      gpsAddress: "GA-183-9024",
      companyPhone: "+233201234567",
      documents: baseValidDocs,
      directors: [validDirector1, validDirector2],
      beneficialOwners: [],
    };

    const result = validateKycSubmission(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "At least one Beneficial Owner (5%+ equity) or an ORC Beneficial Ownership Form must be submitted"
    );
  });
});
