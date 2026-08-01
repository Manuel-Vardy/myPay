"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";

export default function AdminKycDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, mutate } = useAdminFetch<{ data: any }>(`/api/admin/kyc/${id}`);
  const record = data?.data;

  const [reviewNotes, setReviewNotes] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!record) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const handleUpdateStatus = async (status: string) => {
    setUpdating(status);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, review_notes: reviewNotes }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");
      mutate();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_REVIEW: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const formatDocType = (docType: string, label?: string) => {
    switch (docType) {
      case "BUSINESS_REGISTRATION": return "Incorporation Certificate";
      case "TAX_CERTIFICATE": return "Form 3 Document";
      case "UTILITY_BILL": return "Proof of Address";
      case "GHANA_CARD": return `Ghana Card (${label || "Front"})`;
      default: return docType.replace(/_/g, " ");
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-gray-50"
          >
            &larr;
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
              KYC Review: {record.merchant?.business_name || record.user?.email}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-[color:var(--trite-muted)]">
              {record.identity_id} 
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[record.status] || "bg-gray-100 text-gray-800"}`}>
                {record.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Docs & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-4 text-lg font-semibold text-[color:var(--trite-ink)]">Business Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{record.user?.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Merchant Tier</dt>
                <dd className="mt-1 text-sm text-gray-900">{record.merchant?.tier}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Business Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {record.merchant?.business_address_line1} {record.merchant?.business_address_line2}
                  <br />
                  {record.merchant?.business_city}, {record.merchant?.business_region} {record.merchant?.business_country}
                </dd>
              </div>
            </dl>
          </div>

          {/* Documents Grid */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-4 text-lg font-semibold text-[color:var(--trite-ink)]">Submitted Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {record.documents?.map((doc: any) => (
                <div key={doc.id} className="rounded-xl border border-black/5 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">{formatDocType(doc.doc_type, doc.label)}</span>
                  </div>
                  <div className="aspect-video w-full rounded-lg border border-black/10 bg-white flex items-center justify-center overflow-hidden">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex flex-col items-center">
                      <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Document
                    </a>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {(!record.documents || record.documents.length === 0) && (
                <div className="col-span-full py-8 text-center text-sm text-gray-500">
                  No documents found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sticky top-6">
            <h3 className="mb-4 text-lg font-semibold text-[color:var(--trite-ink)]">Review Decision</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Review Notes (Optional)</label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter reason for rejection or internal notes..."
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => handleUpdateStatus("REJECTED")}
                  disabled={!!updating || record.status === "REJECTED"}
                  className="flex justify-center rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  {updating === "REJECTED" ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={() => handleUpdateStatus("APPROVED")}
                  disabled={!!updating || record.status === "APPROVED"}
                  className="flex justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {updating === "APPROVED" ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
