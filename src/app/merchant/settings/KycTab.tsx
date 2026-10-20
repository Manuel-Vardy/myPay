"use client";

import { useState, useEffect, useRef } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";
import type { BusinessType, DirectorProfile, BeneficialOwnerProfile } from "@/lib/types";

type KycDocument = {
  id: string;
  doc_type: string;
  storage_key: string;
  status: string;
  label?: string;
  url?: string;
  uploaded_at: string;
};

type KycRecord = {
  id: string;
  status: string;
  business_type?: BusinessType | null;
  directors: DirectorProfile[];
  beneficial_owners: BeneficialOwnerProfile[];
  current_step: number;
  documents: KycDocument[];
  submitted_at: string | null;
  review_notes: string | null;
  merchant_profile?: {
    business_name: string;
    business_type?: BusinessType | null;
    logo_url?: string | null;
    logo_key?: string | null;
    gps_address?: string | null;
    company_phone?: string | null;
    business_address_line1?: string | null;
    business_city?: string | null;
    business_region?: string | null;
    business_country?: string | null;
    notification_email?: string | null;
  };
};

export function KycTab() {
  const { data, mutate } = useMerchantFetch<{ data: KycRecord | null }>("/api/merchant/kyc");
  const kyc = data?.data;

  // Wizard Step State (1 to 5)
  const [step, setStep] = useState(1);

  // Business Identity (Step 1)
  const [businessType, setBusinessType] = useState<BusinessType>("LIMITED_LIABILITY");
  const [businessName, setBusinessName] = useState("");
  const [gpsAddress, setGpsAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoKey, setLogoKey] = useState<string | null>(null);

  // Directors (Step 3)
  const [directors, setDirectors] = useState<DirectorProfile[]>([]);

  // Beneficial Owners (Step 4)
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwnerProfile[]>([]);

  // Attestation (Step 5)
  const [attestationConfirmed, setAttestationConfirmed] = useState(false);

  // Loading & Error States
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Guard initialization so mutations/background fetches don't wipe active form edits
  const isInitializedRef = useRef(false);

  // Initialize from fetched KYC data on initial load
  useEffect(() => {
    if (kyc && !isInitializedRef.current) {
      isInitializedRef.current = true;
      if (kyc.current_step && kyc.current_step >= 1 && kyc.current_step <= 5) {
        setStep(kyc.current_step);
      }
      if (kyc.business_type) {
        setBusinessType(kyc.business_type);
      } else if (kyc.merchant_profile?.business_type) {
        setBusinessType(kyc.merchant_profile.business_type);
      }
      if (kyc.merchant_profile?.business_name) setBusinessName(kyc.merchant_profile.business_name);
      if (kyc.merchant_profile?.gps_address) setGpsAddress(kyc.merchant_profile.gps_address);
      if (kyc.merchant_profile?.company_phone) setCompanyPhone(kyc.merchant_profile.company_phone);
      if (kyc.merchant_profile?.logo_key) setLogoKey(kyc.merchant_profile.logo_key);
      if (kyc.merchant_profile?.logo_url) setLogoUrl(kyc.merchant_profile.logo_url);

      if (Array.isArray(kyc.directors)) {
        setDirectors(kyc.directors);
      }
      if (Array.isArray(kyc.beneficial_owners)) {
        setBeneficialOwners(kyc.beneficial_owners);
      }
    }
  }, [kyc]);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Helper to find document
  const getDoc = (docType: string, metaLabel?: string) => {
    if (!kyc?.documents) return null;
    const sorted = [...kyc.documents].sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
    return sorted.find((d) => {
      if (metaLabel) {
        return d.doc_type === docType && d.label === metaLabel;
      }
      return d.doc_type === docType;
    });
  };

  // Save Draft API call
  const saveDraft = async (nextStep?: number) => {
    setSavingDraft(true);
    try {
      const payload = {
        business_type: businessType,
        business_name: businessName,
        gps_address: gpsAddress,
        company_phone: companyPhone,
        logo_url: logoKey || logoUrl,
        directors,
        beneficial_owners: beneficialOwners,
        current_step: nextStep ?? step,
      };

      const res = await fetch("/api/merchant/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save draft");
      mutate();
      if (nextStep) setStep(nextStep);
      showMsg("Draft progress saved", "success");
    } catch (err: any) {
      showMsg(err.message, "error");
    } finally {
      setSavingDraft(false);
    }
  };

  // Document Upload Handler
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    doc_type: string,
    label?: string,
    director_id?: string,
    bo_id?: string
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadId = `${doc_type}_${label || ""}_${director_id || ""}_${bo_id || ""}`;
    setUploadingDoc(uploadId);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", doc_type);
    if (label) formData.append("label", label);
    if (director_id) {
      formData.append("director_id", director_id);
      const currentDir = directors.find((d) => d.id === director_id);
      if (currentDir) {
        formData.append("director_data", JSON.stringify(currentDir));
      }
    }
    if (bo_id) {
      formData.append("bo_id", bo_id);
      const currentBo = beneficialOwners.find((bo) => bo.id === bo_id);
      if (currentBo) {
        formData.append("bo_data", JSON.stringify(currentBo));
      }
    }

    try {
      const res = await fetch("/api/merchant/kyc/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      if (doc_type === "COMPANY_LOGO") {
        if (result.data?.url) setLogoUrl(result.data.url);
        if (result.data?.storage_key) setLogoKey(result.data.storage_key);
      }

      // If uploading for a director, update director locally
      if (director_id) {
        setDirectors((prev) =>
          prev.map((d) => {
            if (d.id === director_id) {
              if (label === "front") {
                return {
                  ...d,
                  ghana_card_front_key: result.data.storage_key,
                  ghana_card_front_url: result.data.url,
                };
              } else if (label === "back") {
                return {
                  ...d,
                  ghana_card_back_key: result.data.storage_key,
                  ghana_card_back_url: result.data.url,
                };
              }
            }
            return d;
          })
        );
      }

      // If uploading for a beneficial owner
      if (bo_id) {
        setBeneficialOwners((prev) =>
          prev.map((bo) => {
            if (bo.id === bo_id) {
              return {
                ...bo,
                profile_doc_key: result.data.storage_key,
                profile_doc_url: result.data.url,
              };
            }
            return bo;
          })
        );
      }

      mutate();
      showMsg("Document uploaded successfully", "success");
    } catch (err: any) {
      showMsg(err.message, "error");
    } finally {
      e.target.value = "";
      setUploadingDoc(null);
    }
  };

  // Director Management
  const addDirector = () => {
    const newDir: DirectorProfile = {
      id: `dir_${Date.now()}`,
      full_name: "",
      email: "",
      phone: "",
      ghana_card_number: "",
    };
    setDirectors([...directors, newDir]);
  };

  const updateDirector = (id: string, field: keyof DirectorProfile, value: string) => {
    setDirectors(directors.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const removeDirector = (id: string) => {
    if (confirm("Are you sure you want to remove this director entry?")) {
      setDirectors(directors.filter((d) => d.id !== id));
    }
  };

  // Beneficial Owner Management
  const addBeneficialOwner = () => {
    const newBo: BeneficialOwnerProfile = {
      id: `bo_${Date.now()}`,
      full_name: "",
      nationality: "Ghanaian",
      ownership_percentage: 25,
      email: "",
      phone: "",
      is_pep: false,
    };
    setBeneficialOwners([...beneficialOwners, newBo]);
  };

  const updateBeneficialOwner = (id: string, field: keyof BeneficialOwnerProfile, value: any) => {
    setBeneficialOwners(beneficialOwners.map((bo) => (bo.id === id ? { ...bo, [field]: value } : bo)));
  };

  const removeBeneficialOwner = (id: string) => {
    if (confirm("Are you sure you want to remove this beneficial owner?")) {
      setBeneficialOwners(beneficialOwners.filter((bo) => bo.id !== id));
    }
  };

  // Final Submit Handler
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // First save latest state
      await saveDraft(5);
      const res = await fetch("/api/merchant/kyc/submit", { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        const errorDetail = result.details ? result.details.join(", ") : result.error;
        throw new Error(errorDetail || "Submission failed");
      }
      mutate();
      showMsg("KYC successfully submitted for compliance review!", "success");
    } catch (err: any) {
      showMsg(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Status & Gate Validations
  const alreadySubmitted =
    kyc?.status === "IN_REVIEW" ||
    kyc?.status === "APPROVED" ||
    (kyc?.status === "PENDING" && Boolean(kyc.submitted_at));

  // Minimum director requirement by company type
  const minDirectorsRequired = businessType === "LIMITED_LIABILITY" ? 2 : 1;
  const validDirectors = directors.filter(
    (d) =>
      d.full_name?.trim() &&
      d.email?.trim() &&
      d.phone?.trim() &&
      d.ghana_card_number?.trim() &&
      (d.ghana_card_front_key || d.ghana_card_front_url) &&
      (d.ghana_card_back_key || d.ghana_card_back_url)
  );
  const directorsReady = validDirectors.length >= minDirectorsRequired;

  const hasBusinessCert = Boolean(getDoc("BUSINESS_REGISTRATION"));
  const hasFormA = Boolean(getDoc("FORM_A") || getDoc("FORM_A_3") || getDoc("TAX_CERTIFICATE"));
  const hasForm3 = Boolean(getDoc("FORM_3") || getDoc("FORM_A_3") || getDoc("TAX_CERTIFICATE"));
  const statutoryFormReady = businessType === "SOLE_PROPRIETORSHIP" ? hasFormA : hasForm3;
  const hasAddressProof = Boolean(getDoc("UTILITY_BILL"));

  const gpsReady = Boolean(gpsAddress && gpsAddress.trim().length >= 6);
  const phoneReady = Boolean(companyPhone || (directors.length > 0 && directors[0].phone));
  const boReady =
    businessType === "SOLE_PROPRIETORSHIP" ||
    beneficialOwners.length > 0 ||
    Boolean(getDoc("BENEFICIAL_OWNER_PROFILE"));

  const canSubmit =
    gpsReady &&
    phoneReady &&
    hasBusinessCert &&
    statutoryFormReady &&
    hasAddressProof &&
    directorsReady &&
    boReady &&
    attestationConfirmed;

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_REVIEW: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const stepsList = [
    { num: 1, title: "Business Identity", desc: "Entity type & GPS" },
    { num: 2, title: "Statutory Documents", desc: "Cert & Form A/3" },
    { num: 3, title: "Directors on Cert", desc: "Ghana Cards & Contacts" },
    { num: 4, title: "Beneficial Owners", desc: "UBO Profile & Shares" },
    { num: 5, title: "Review & Submit", desc: "Attestation & Gating" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[color:var(--trite-ink)]">
              KYC & Compliance Verification
            </h3>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
              Complete your institutional verification to unlock unrestricted settlements and payment rails.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                statusColors[kyc?.status || ""] || "bg-gray-100 text-gray-800"
              }`}
            >
              {alreadySubmitted ? (kyc?.status === "PENDING" ? "IN REVIEW" : kyc?.status) : "NOT SUBMITTED"}
            </span>
          </div>
        </div>

        {kyc?.status === "REJECTED" && kyc.review_notes && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-sm text-red-800 border border-red-200">
            <strong>Action Required:</strong> {kyc.review_notes}
          </div>
        )}

        {alreadySubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50 text-xs text-blue-900 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>
                Your application was submitted on <strong>{new Date(kyc?.submitted_at || "").toLocaleDateString()}</strong> and is under active review by Trite Compliance.
              </span>
            </div>
            <span className="text-[11px] text-blue-700">Ref: {kyc?.id.slice(0, 8)}</span>
          </div>
        )}
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            actionMsg.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Stepped Progress Navigation Bar */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {stepsList.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => saveDraft(s.num)}
                disabled={alreadySubmitted}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-blue-50 border border-blue-200 ring-2 ring-blue-600/10"
                    : isCompleted
                    ? "bg-gray-50 border border-black/5 hover:bg-gray-100/80"
                    : "bg-transparent border border-transparent hover:bg-gray-50 text-gray-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isCompleted ? "✓" : s.num}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isActive ? "text-blue-900" : isCompleted ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Business Identity & Entity Structure */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 space-y-6">
            <div>
              <h4 className="text-base font-bold text-[color:var(--trite-ink)]">Step 1: Entity Structure & Identity</h4>
              <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                Select your statutory registration type registered with the Registrar General / ORC.
              </p>
            </div>

            {/* Entity Type Picker Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "LIMITED_LIABILITY",
                  title: "Limited Liability Company (LLC)",
                  desc: "Form 3 registered company with 2+ directors and share capital.",
                  badge: "Act 992 Compliance",
                },
                {
                  id: "SOLE_PROPRIETORSHIP",
                  title: "Sole Proprietorship",
                  desc: "Registered business name with 1 principal proprietor (Form A).",
                  badge: "Form A",
                },
                {
                  id: "PARTNERSHIP",
                  title: "Partnership Firm",
                  desc: "Entity established by 2 or more partners (Form B / Deed).",
                  badge: "Partnership Act",
                },
              ].map((ent) => (
                <div
                  key={ent.id}
                  onClick={() => setBusinessType(ent.id as BusinessType)}
                  className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                    businessType === ent.id
                      ? "border-blue-600 bg-blue-50/50 shadow-sm"
                      : "border-gray-200 bg-gray-50/30 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[color:var(--trite-ink)]">{ent.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        businessType === ent.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {ent.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{ent.desc}</p>
                </div>
              ))}
            </div>

            {/* Company Logo Upload */}
            <div className="p-4 rounded-xl border border-black/5 bg-gray-50 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-black/10 bg-white overflow-hidden shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Company Logo" className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-xs font-bold text-gray-400">LOGO</span>
                  )}
                </div>
                <label
                  className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md cursor-pointer hover:bg-blue-700 ${
                    uploadingDoc === "COMPANY_LOGO___" ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <span className="text-xs font-bold">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, "COMPANY_LOGO")}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h5 className="text-sm font-semibold text-[color:var(--trite-ink)]">Company Official Logo</h5>
                <p className="text-xs text-[color:var(--trite-muted)] mt-1">
                  Upload your high-resolution emblem or brand logo.
                </p>
                {uploadingDoc === "COMPANY_LOGO___" && (
                  <p className="text-xs text-blue-600 font-medium mt-1">Uploading logo to secure storage...</p>
                )}
              </div>
            </div>

            {/* Business Contact & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Business Legal Name (As on Certificate)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Africa Ltd"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <span>GhanaPost GPS Digital Address *</span>
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                    MANDATORY
                  </span>
                </label>
                <input
                  type="text"
                  value={gpsAddress}
                  onChange={(e) => setGpsAddress(e.target.value.toUpperCase())}
                  placeholder="e.g. GA-183-9024"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm font-mono text-[color:var(--trite-ink)] outline-none focus:border-blue-500 uppercase tracking-wider"
                />
                <p className="text-[10px] text-gray-400 mt-1">Format: 2 letters, region digits, street code.</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Company Official Phone Number (Call Number) *
                </label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="e.g. +233 24 123 4567"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Registered Notification Email
                </label>
                <input
                  type="email"
                  disabled
                  value={kyc?.merchant_profile?.notification_email || ""}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-gray-100 px-3 py-2 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => saveDraft()}
              disabled={savingDraft}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {savingDraft ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => saveDraft(2)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Save & Continue to Documents →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Statutory Business Documents */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 space-y-6">
            <div>
              <h4 className="text-base font-bold text-[color:var(--trite-ink)]">Step 2: Statutory Business Documents</h4>
              <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                Upload your official documents issued by the Registrar General / ORC.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document 1: Business Registration Certificate */}
              <div className="rounded-xl border border-black/10 p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-blue-600">Statutory Certificate</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        hasBusinessCert ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {hasBusinessCert ? "UPLOADED" : "REQUIRED"}
                    </span>
                  </div>
                  <h5 className="font-semibold text-sm text-[color:var(--trite-ink)]">
                    {businessType === "LIMITED_LIABILITY"
                      ? "Certificate of Incorporation"
                      : "Certificate of Business Registration"}
                  </h5>
                  <p className="text-xs text-gray-500 mt-1">
                    Official certificate carrying your registration number and issuance date.
                  </p>
                </div>

                <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
                  {getDoc("BUSINESS_REGISTRATION") ? (
                    <div>
                      <p className="text-xs font-medium text-green-600">✓ Document on file</p>
                      <a
                        href={getDoc("BUSINESS_REGISTRATION")?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View Certificate
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Upload PDF, JPG, or PNG (Max 15MB)</p>
                  )}
                </div>

                <label
                  className={`mt-4 w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 ${
                    uploadingDoc === "BUSINESS_REGISTRATION___" ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {uploadingDoc === "BUSINESS_REGISTRATION___"
                    ? "Uploading..."
                    : hasBusinessCert
                    ? "Replace Certificate"
                    : "Upload Certificate"}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => handleUpload(e, "BUSINESS_REGISTRATION")}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Document 2: Form A (Sole Prop) OR Form 3 (LLC) */}
              <div className="rounded-xl border border-black/10 p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-purple-600">
                      {businessType === "SOLE_PROPRIETORSHIP" ? "Form A Particulars" : "Form 3 Regulations"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        statutoryFormReady ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {statutoryFormReady ? "UPLOADED" : "REQUIRED"}
                    </span>
                  </div>
                  <h5 className="font-semibold text-sm text-[color:var(--trite-ink)]">
                    {businessType === "SOLE_PROPRIETORSHIP"
                      ? "Form A — Statement of Business Particulars"
                      : "Form 3 — Company Profile & Regulations"}
                  </h5>
                  <p className="text-xs text-gray-500 mt-1">
                    Official form listing the company&apos;s directors, shareholders, and registered office.
                  </p>
                </div>

                <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
                  {getDoc("FORM_3") || getDoc("FORM_A") || getDoc("FORM_A_3") || getDoc("TAX_CERTIFICATE") ? (
                    <div>
                      <p className="text-xs font-medium text-green-600">✓ Form registered on file</p>
                      <a
                        href={
                          (
                            getDoc("FORM_3") ||
                            getDoc("FORM_A") ||
                            getDoc("FORM_A_3") ||
                            getDoc("TAX_CERTIFICATE")
                          )?.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View Registered Form
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Upload PDF, JPG, or PNG (Max 15MB)</p>
                  )}
                </div>

                <label
                  className={`mt-4 w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 ${
                    uploadingDoc?.startsWith("FORM_") ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {uploadingDoc?.startsWith("FORM_")
                    ? "Uploading..."
                    : statutoryFormReady
                    ? "Replace Form Document"
                    : businessType === "SOLE_PROPRIETORSHIP"
                    ? "Upload Form A"
                    : "Upload Form 3"}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) =>
                      handleUpload(e, businessType === "SOLE_PROPRIETORSHIP" ? "FORM_A" : "FORM_3")
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* Document 3: Proof of Operating Address */}
              <div className="rounded-xl border border-black/10 p-5 bg-white flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-amber-600">Location Verification</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        hasAddressProof ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {hasAddressProof ? "UPLOADED" : "REQUIRED"}
                    </span>
                  </div>
                  <h5 className="font-semibold text-sm text-[color:var(--trite-ink)]">
                    Proof of Operating Address (Utility Bill / Tenancy Agreement)
                  </h5>
                  <p className="text-xs text-gray-500 mt-1">
                    Recent utility bill (ECG, Ghana Water, internet), tenancy agreement, or GhanaPost GPS printout matching your business location.
                  </p>
                </div>

                <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
                  {getDoc("UTILITY_BILL") ? (
                    <div>
                      <p className="text-xs font-medium text-green-600">✓ Address proof document verified</p>
                      <a
                        href={getDoc("UTILITY_BILL")?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View Address Document
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Upload PDF, JPG, or PNG</p>
                  )}
                </div>

                <label
                  className={`mt-4 cursor-pointer inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 ${
                    uploadingDoc === "UTILITY_BILL___" ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {uploadingDoc === "UTILITY_BILL___"
                    ? "Uploading..."
                    : hasAddressProof
                    ? "Replace Address Document"
                    : "Upload Proof of Address"}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => handleUpload(e, "UTILITY_BILL")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back to Identity
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => saveDraft()}
                disabled={savingDraft}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => saveDraft(3)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Continue to Directors →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Directors on the Certificate */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-[color:var(--trite-ink)]">
                  Step 3: Directors on the Certificate
                </h4>
                <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                  {businessType === "LIMITED_LIABILITY"
                    ? "Under the Ghana Companies Act (Act 992), minimum 2 directors must be registered. Please add all directors on your Form 3."
                    : "Please add the details and Ghana Card for the principal proprietor / partner."}
                </p>
              </div>
              <button
                type="button"
                onClick={addDirector}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
              >
                + Add Another Director
              </button>
            </div>

            {/* Statutory Minimum Banner */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                directorsReady
                  ? "bg-green-50 text-green-900 border-green-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              <span>
                <strong>Compliance Gating:</strong> {validDirectors.length} of {minDirectorsRequired} required director(s) fully verified with contact details and both sides of Ghana Card.
              </span>
              <span className="font-bold text-[11px]">
                {directorsReady ? "READY ✓" : "INCOMPLETE ⚠️"}
              </span>
            </div>

            {/* Directors List */}
            <div className="space-y-6">
              {directors.length === 0 && (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-sm font-semibold text-gray-700">No directors added yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click &quot;Add Another Director&quot; to begin entering directors listed on your registration document.
                  </p>
                  <button
                    onClick={addDirector}
                    className="mt-4 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add First Director
                  </button>
                </div>
              )}

              {directors.map((dir, idx) => {
                const hasFront = Boolean(dir.ghana_card_front_key || dir.ghana_card_front_url);
                const hasBack = Boolean(dir.ghana_card_back_key || dir.ghana_card_back_url);
                const isComplete =
                  dir.full_name?.trim() &&
                  dir.email?.trim() &&
                  dir.phone?.trim() &&
                  dir.ghana_card_number?.trim() &&
                  hasFront &&
                  hasBack;

                return (
                  <div
                    key={dir.id}
                    className="rounded-xl border border-black/10 p-5 bg-white space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-black/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-sm text-[color:var(--trite-ink)]">
                          {dir.full_name || `Director #${idx + 1}`}
                        </h5>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isComplete ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isComplete ? "VERIFIED DATA" : "INCOMPLETE"}
                        </span>
                      </div>
                      {directors.length > minDirectorsRequired && (
                        <button
                          type="button"
                          onClick={() => removeDirector(dir.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Full Legal Name *
                        </label>
                        <input
                          type="text"
                          value={dir.full_name}
                          onChange={(e) => updateDirector(dir.id, "full_name", e.target.value)}
                          placeholder="e.g. Kwame Mensah"
                          className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-xs text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Director Email Address *
                        </label>
                        <input
                          type="email"
                          value={dir.email}
                          onChange={(e) => updateDirector(dir.id, "email", e.target.value)}
                          placeholder="director@company.com"
                          className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-xs text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Director Phone Number *
                        </label>
                        <input
                          type="text"
                          value={dir.phone}
                          onChange={(e) => updateDirector(dir.id, "phone", e.target.value)}
                          placeholder="+233 20 123 4567"
                          className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-xs text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Ghana Card Number *
                        </label>
                        <input
                          type="text"
                          value={dir.ghana_card_number}
                          onChange={(e) => updateDirector(dir.id, "ghana_card_number", e.target.value.toUpperCase())}
                          placeholder="GHA-123456789-0"
                          className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-xs font-mono text-[color:var(--trite-ink)] outline-none focus:border-blue-500 uppercase tracking-wider"
                        />
                      </div>
                    </div>

                    {/* Ghana Card Uploads (Front & Back) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Card Front */}
                      <div className="p-3 border rounded-xl bg-gray-50/50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800">Ghana Card (Front)</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                hasFront ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {hasFront ? "ATTACHED" : "REQUIRED"}
                            </span>
                          </div>
                          {dir.ghana_card_front_url && (
                            <a
                              href={dir.ghana_card_front_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:underline mt-1 inline-block"
                            >
                              View Card Front
                            </a>
                          )}
                        </div>
                        <label
                          className={`cursor-pointer px-3 py-1.5 rounded-lg border bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm ${
                            uploadingDoc === `DIRECTOR_GHANA_CARD_front_${dir.id}_` ? "opacity-50" : ""
                          }`}
                        >
                          {hasFront ? "Replace Front" : "Upload Front"}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleUpload(e, "DIRECTOR_GHANA_CARD", "front", dir.id)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Card Back */}
                      <div className="p-3 border rounded-xl bg-gray-50/50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800">Ghana Card (Back)</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                hasBack ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {hasBack ? "ATTACHED" : "REQUIRED"}
                            </span>
                          </div>
                          {dir.ghana_card_back_url && (
                            <a
                              href={dir.ghana_card_back_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:underline mt-1 inline-block"
                            >
                              View Card Back
                            </a>
                          )}
                        </div>
                        <label
                          className={`cursor-pointer px-3 py-1.5 rounded-lg border bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm ${
                            uploadingDoc === `DIRECTOR_GHANA_CARD_back_${dir.id}_` ? "opacity-50" : ""
                          }`}
                        >
                          {hasBack ? "Replace Back" : "Upload Back"}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleUpload(e, "DIRECTOR_GHANA_CARD", "back", dir.id)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back to Documents
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => saveDraft()}
                disabled={savingDraft}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => saveDraft(4)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Continue to Beneficial Ownership →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Beneficial Owner (UBO) Profile */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-[color:var(--trite-ink)]">
                  Step 4: Ultimate Beneficial Owner (UBO) Profile
                </h4>
                <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                  Individuals directly or indirectly holding 5% or more equity, voting rights, or significant control under Registrar General / ORC regulations.
                </p>
              </div>
              <button
                type="button"
                onClick={addBeneficialOwner}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
              >
                + Add Beneficial Owner
              </button>
            </div>

            {/* Beneficial Ownership Document Slot */}
            <div className="p-4 rounded-xl border border-black/10 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-gray-800">ORC Beneficial Ownership Declaration Form</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Attach your official Register of Beneficial Owners document or ORC declaration form.
                </p>
                {getDoc("BENEFICIAL_OWNER_PROFILE") && (
                  <a
                    href={getDoc("BENEFICIAL_OWNER_PROFILE")?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View Uploaded UBO Declaration
                  </a>
                )}
              </div>
              <label
                className={`cursor-pointer px-4 py-2 rounded-lg border bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm ${
                  uploadingDoc === "BENEFICIAL_OWNER_PROFILE___" ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {getDoc("BENEFICIAL_OWNER_PROFILE") ? "Replace Form" : "Upload BO Form"}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleUpload(e, "BENEFICIAL_OWNER_PROFILE")}
                  className="hidden"
                />
              </label>
            </div>

            {/* UBO Cards */}
            <div className="space-y-4">
              {beneficialOwners.length === 0 && (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-xs text-gray-500">
                    No individual beneficial owners listed yet. For LLCs, please declare individuals holding 5%+ ownership.
                  </p>
                  <button
                    onClick={addBeneficialOwner}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add Beneficial Owner
                  </button>
                </div>
              )}

              {beneficialOwners.map((bo, idx) => (
                <div key={bo.id} className="rounded-xl border border-black/10 p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    <span className="text-xs font-bold text-[color:var(--trite-ink)]">
                      Beneficial Owner #{idx + 1}: {bo.full_name || "New UBO"} ({bo.ownership_percentage}% Equity)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBeneficialOwner(bo.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase">Full Name</label>
                      <input
                        type="text"
                        value={bo.full_name}
                        onChange={(e) => updateBeneficialOwner(bo.id, "full_name", e.target.value)}
                        placeholder="e.g. Ama Osei"
                        className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-2.5 py-1.5 text-xs text-[color:var(--trite-ink)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase">Nationality</label>
                      <input
                        type="text"
                        value={bo.nationality}
                        onChange={(e) => updateBeneficialOwner(bo.id, "nationality", e.target.value)}
                        placeholder="Ghanaian"
                        className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-2.5 py-1.5 text-xs text-[color:var(--trite-ink)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase">Ownership / Shares (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={bo.ownership_percentage}
                        onChange={(e) =>
                          updateBeneficialOwner(bo.id, "ownership_percentage", Number(e.target.value))
                        }
                        className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-2.5 py-1.5 text-xs text-[color:var(--trite-ink)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase">
                        Politically Exposed Person (PEP)?
                      </label>
                      <select
                        value={bo.is_pep ? "YES" : "NO"}
                        onChange={(e) => updateBeneficialOwner(bo.id, "is_pep", e.target.value === "YES")}
                        className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-2.5 py-1.5 text-xs text-[color:var(--trite-ink)] outline-none"
                      >
                        <option value="NO">No, Not a PEP</option>
                        <option value="YES">Yes, PEP Declared</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(3)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back to Directors
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => saveDraft()}
                disabled={savingDraft}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => saveDraft(5)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Review & Attestation →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Review, Attestation & Submission */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 space-y-6">
            <div>
              <h4 className="text-base font-bold text-[color:var(--trite-ink)]">
                Step 5: Compliance Summary & Attestation
              </h4>
              <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                Review your compliance dossier before submitting for official regulatory verification.
              </p>
            </div>

            {/* Checklist Grid */}
            <div className="rounded-xl border border-black/5 p-5 bg-gray-50/50 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Pre-Flight Compliance Readiness
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div
                  onClick={() => setStep(1)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${
                    gpsReady ? "bg-white border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">GhanaPost GPS Digital Address</p>
                    <p className="text-gray-500 text-[11px]">{gpsAddress || "Not provided"}</p>
                  </div>
                  <span className={`font-bold ${gpsReady ? "text-green-600" : "text-red-600"}`}>
                    {gpsReady ? "PASSED ✓" : "MISSING ⚠️"}
                  </span>
                </div>

                <div
                  onClick={() => setStep(1)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${
                    phoneReady ? "bg-white border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">Company Official Call Number</p>
                    <p className="text-gray-500 text-[11px]">{companyPhone || "Not provided"}</p>
                  </div>
                  <span className={`font-bold ${phoneReady ? "text-green-600" : "text-red-600"}`}>
                    {phoneReady ? "PASSED ✓" : "MISSING ⚠️"}
                  </span>
                </div>

                <div
                  onClick={() => setStep(2)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${
                    hasBusinessCert ? "bg-white border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">Incorporation / Registration Cert</p>
                    <p className="text-gray-500 text-[11px]">
                      {hasBusinessCert ? "Uploaded & valid" : "Missing file"}
                    </p>
                  </div>
                  <span className={`font-bold ${hasBusinessCert ? "text-green-600" : "text-red-600"}`}>
                    {hasBusinessCert ? "PASSED ✓" : "MISSING ⚠️"}
                  </span>
                </div>

                <div
                  onClick={() => setStep(2)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${
                    statutoryFormReady ? "bg-white border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {businessType === "SOLE_PROPRIETORSHIP" ? "Form A Document" : "Form 3 Document"}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      {statutoryFormReady ? "Uploaded & valid" : "Missing form"}
                    </p>
                  </div>
                  <span className={`font-bold ${statutoryFormReady ? "text-green-600" : "text-red-600"}`}>
                    {statutoryFormReady ? "PASSED ✓" : "MISSING ⚠️"}
                  </span>
                </div>

                <div
                  onClick={() => setStep(3)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer sm:col-span-2 ${
                    directorsReady ? "bg-white border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      Directors on Certificate (Min {minDirectorsRequired} required for {businessType})
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      {validDirectors.length} of {minDirectorsRequired} directors ready with Front & Back Ghana Card
                    </p>
                  </div>
                  <span className={`font-bold ${directorsReady ? "text-green-600" : "text-red-600"}`}>
                    {directorsReady ? "PASSED ✓" : `ACTION NEEDED (${validDirectors.length}/${minDirectorsRequired}) ⚠️`}
                  </span>
                </div>
              </div>
            </div>

            {/* Attestation Checkbox */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attestationConfirmed}
                  onChange={(e) => setAttestationConfirmed(e.target.checked)}
                  disabled={alreadySubmitted}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-800 leading-relaxed">
                  <strong>Statutory Declaration:</strong> I hereby declare under penalty of perjury that the company details, registered GPS address, directors, and beneficial owners supplied match the official records filed with the Office of the Registrar of Companies (ORC) Ghana and AML/CFT compliance standards.
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(4)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back to UBO
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => saveDraft()}
                disabled={savingDraft || alreadySubmitted}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting || alreadySubmitted}
                className="rounded-lg bg-green-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {submitting ? "Submitting Application..." : alreadySubmitted ? "Application Under Review" : "Submit for Verification ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
