"use client";

import { useState, useEffect } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";

type KycDocument = {
  id: string;
  doc_type: string;
  storage_key: string;
  status: string;
  label?: string; // Optional label for distinguishing front/back
  url?: string; // Signed URL from API
  uploaded_at: string;
};

type KycRecord = {
  id: string;
  status: string;
  documents: KycDocument[];
  submitted_at: string | null;
  review_notes: string | null;
};

const REQUIRED_DOCS = [
  { id: "BUSINESS_REGISTRATION", label: "Incorporation Certificate" },
  { id: "TAX_CERTIFICATE", label: "Form 3 Document" },
  { id: "UTILITY_BILL", label: "Proof of Address" },
  { id: "GHANA_CARD_FRONT", doc_type: "GHANA_CARD", label: "Ghana Card (Front)", metaLabel: "front" },
  { id: "GHANA_CARD_BACK", doc_type: "GHANA_CARD", label: "Ghana Card (Back)", metaLabel: "back" },
];

export function KycTab() {
  const { data, mutate } = useMerchantFetch<{ data: KycRecord | null }>("/api/merchant/kyc");
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const kyc = data?.data;

  const getDoc = (id: string, doc_type?: string, metaLabel?: string) => {
    if (!kyc?.documents) return null;
    // Sort by uploaded_at desc
    const sorted = [...kyc.documents].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
    return sorted.find(d => {
      if (doc_type && metaLabel) {
        return d.doc_type === doc_type && d.label === metaLabel;
      }
      return d.doc_type === id;
    });
  };

  const hasAllDocs = REQUIRED_DOCS.every(req => getDoc(req.id, req.doc_type, req.metaLabel) !== undefined);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, doc_type?: string, metaLabel?: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const type = doc_type || id;

    setUploadingDoc(id);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", type);
    if (metaLabel) formData.append("label", metaLabel);

    try {
      const res = await fetch("/api/merchant/kyc/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      
      mutate();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/merchant/kyc/submit", { method: "POST" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Submission failed");
      mutate();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    "PENDING": "bg-yellow-100 text-yellow-800",
    "IN_REVIEW": "bg-blue-100 text-blue-800",
    "APPROVED": "bg-green-100 text-green-800",
    "REJECTED": "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">KYC & Compliance Verification</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[kyc?.status || ""] || "bg-gray-100 text-gray-800"}`}>
            {kyc?.status || "NOT SUBMITTED"}
          </span>
        </div>
        {kyc?.status === "REJECTED" && kyc.review_notes && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 text-sm text-red-800 border border-red-200">
            <strong>Rejection Reason:</strong> {kyc.review_notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REQUIRED_DOCS.map((req) => {
          const doc = getDoc(req.id, req.doc_type, req.metaLabel);
          return (
            <div key={req.id} className="rounded-2xl bg-white p-6 ring-1 ring-black/5 flex flex-col">
              <h4 className="font-semibold text-sm text-[color:var(--trite-ink)] mb-1">{req.label}</h4>
              
              <div className="mt-4 flex-1 flex flex-col justify-center items-center rounded-lg border-2 border-dashed border-gray-300 p-6 bg-gray-50">
                {doc && doc.url ? (
                  <div className="text-center">
                    <div className="text-green-600 mb-2">
                      <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                      View Uploaded Document
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                      Uploaded at: {new Date(doc.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm">No document uploaded</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded ${doc ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {doc ? (doc.status === 'APPROVED' ? 'APPROVED' : doc.status === 'REJECTED' ? 'REJECTED' : 'UPLOADED') : 'REQUIRED'}
                </span>
                <label className={`cursor-pointer inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 ${uploadingDoc === req.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingDoc === req.id ? "Uploading..." : (doc ? "Replace File" : "Upload File")}
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleUpload(e, req.id, req.doc_type, req.metaLabel)} />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4 rounded-2xl bg-white p-6 ring-1 ring-black/5">
        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        <button
          onClick={handleSubmit}
          disabled={!hasAllDocs || submitting || (kyc?.status === "PENDING" || kyc?.status === "IN_REVIEW" || kyc?.status === "APPROVED")}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit for Review"}
        </button>
      </div>
    </div>
  );
}
