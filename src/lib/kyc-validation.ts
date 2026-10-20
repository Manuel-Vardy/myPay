import type { BusinessType, DirectorProfile, BeneficialOwnerProfile } from "./types";

export interface KycValidationInput {
  businessType: BusinessType;
  gpsAddress?: string | null;
  companyPhone?: string | null;
  documents: Array<{ doc_type: string; label?: string }>;
  directors: Partial<DirectorProfile>[];
  beneficialOwners: Partial<BeneficialOwnerProfile>[];
}

export interface KycValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateKycSubmission(input: KycValidationInput): KycValidationResult {
  const errors: string[] = [];
  const businessType = input.businessType || "LIMITED_LIABILITY";

  // 1. Business Registration Certificate
  const hasBusinessCert = input.documents.some((d) => d.doc_type === "BUSINESS_REGISTRATION");
  if (!hasBusinessCert) {
    errors.push("Certificate of Incorporation / Registration is required");
  }

  // 2. GhanaPost GPS Address
  if (!input.gpsAddress || input.gpsAddress.trim().length < 5) {
    errors.push("A valid GhanaPost GPS Digital Address is required (e.g. GA-183-9024)");
  }

  // 3. Company Phone / Call number
  const hasDirectorPhone = input.directors.some((d) => Boolean(d.phone?.trim()));
  if (!input.companyPhone?.trim() && !hasDirectorPhone) {
    errors.push("Official Company Phone Number or Director Contact Number is required");
  }

  // 4. Proof of Address
  const hasAddressProof = input.documents.some((d) => d.doc_type === "UTILITY_BILL");
  if (!hasAddressProof) {
    errors.push("Proof of Operating Address (Utility Bill / Tenancy) is required");
  }

  // 5. Gating rules per business type
  if (businessType === "LIMITED_LIABILITY") {
    // Form 3
    const hasForm3 = input.documents.some((d) =>
      ["FORM_3", "FORM_A_3", "TAX_CERTIFICATE"].includes(d.doc_type)
    );
    if (!hasForm3) {
      errors.push("Form 3 Document (ORC Company Profile & Regulations) is required for Limited Liability Companies");
    }

    // Minimum 2 directors for LLC (Act 992)
    if (input.directors.length < 2) {
      errors.push("Ghana law requires at least 2 directors on the certificate for Limited Liability Companies");
    }

    input.directors.forEach((d, idx) => {
      const num = idx + 1;
      if (!d.full_name?.trim()) errors.push(`Director #${num}: Full Name is required`);
      if (!d.email?.trim()) errors.push(`Director #${num}: Email address is required`);
      if (!d.phone?.trim()) errors.push(`Director #${num}: Phone / call number is required`);
      if (!d.ghana_card_number?.trim()) errors.push(`Director #${num}: Ghana Card Number is required`);
      if (!d.ghana_card_front_key && !d.ghana_card_front_url) {
        errors.push(`Director #${num}: Ghana Card Front upload is required`);
      }
      if (!d.ghana_card_back_key && !d.ghana_card_back_url) {
        errors.push(`Director #${num}: Ghana Card Back upload is required`);
      }
    });

    // Beneficial Owners for LLC
    const hasBoDoc = input.documents.some((d) => d.doc_type === "BENEFICIAL_OWNER_PROFILE");
    if (input.beneficialOwners.length === 0 && !hasBoDoc) {
      errors.push("At least one Beneficial Owner (5%+ equity) or an ORC Beneficial Ownership Form must be submitted");
    }
  } else if (businessType === "SOLE_PROPRIETORSHIP") {
    // Form A
    const hasFormA = input.documents.some((d) =>
      ["FORM_A", "FORM_A_3", "TAX_CERTIFICATE"].includes(d.doc_type)
    );
    if (!hasFormA) {
      errors.push("Form A Document (ORC Statement of Business Particulars) is required for Sole Proprietorships");
    }

    if (input.directors.length < 1) {
      errors.push("Proprietor details and Ghana Card are required for Sole Proprietorship");
    } else {
      const d = input.directors[0];
      if (!d.full_name?.trim()) errors.push("Proprietor: Full Name is required");
      if (!d.email?.trim()) errors.push("Proprietor: Email address is required");
      if (!d.phone?.trim()) errors.push("Proprietor: Phone / call number is required");
      if (!d.ghana_card_number?.trim()) errors.push("Proprietor: Ghana Card Number is required");
      if (!d.ghana_card_front_key && !d.ghana_card_front_url) {
        errors.push("Proprietor: Ghana Card Front upload is required");
      }
      if (!d.ghana_card_back_key && !d.ghana_card_back_url) {
        errors.push("Proprietor: Ghana Card Back upload is required");
      }
    }
  } else if (businessType === "PARTNERSHIP") {
    if (input.directors.length < 2) {
      errors.push("At least 2 partners must be provided for a Partnership");
    }
    input.directors.forEach((d, idx) => {
      const num = idx + 1;
      if (!d.full_name?.trim()) errors.push(`Partner #${num}: Full Name is required`);
      if (!d.email?.trim()) errors.push(`Partner #${num}: Email address is required`);
      if (!d.phone?.trim()) errors.push(`Partner #${num}: Phone / call number is required`);
      if (!d.ghana_card_number?.trim()) errors.push(`Partner #${num}: Ghana Card Number is required`);
      if (!d.ghana_card_front_key && !d.ghana_card_front_url) {
        errors.push(`Partner #${num}: Ghana Card Front upload is required`);
      }
      if (!d.ghana_card_back_key && !d.ghana_card_back_url) {
        errors.push(`Partner #${num}: Ghana Card Back upload is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
