"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { AdminPermissionGuard } from "@/components/admin/AdminPermissionGuard";
import { Search, Calendar, HandCoins, CheckCircle2, XCircle, Clock } from "lucide-react";

type WithdrawalRequest = {
  id: string;
  request_id_display: string;
  merchant_id: string;
  business_name: string | null;
  merchant_display_id: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "FAILED" | string;
  provider_name: string;
  account_number: string;
  account_name: string;
  settlement_id_display: string | null;
  settlement_status: string | null;
  review_note: string | null;
  failure_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type Summary = { status: string; count: number; amount: number };

type ReconCheck = { name: string; ledger: string; source: string; delta: string; ok: boolean };
type Reconciliation = {
  merchant: { business_name: string | null; merchant_display_id: string | null; currency: string };
  summary: {
    settled_count: number; gross: string; processing_fees: string; other_fees: string;
    waived_fees: string; net_payable: string; paid_out: string;
    expected_float: string; actual_float: string; difference: string; balanced: boolean;
  };
  checks: ReconCheck[];
  availability: { total: string; aged: string; withdrawal_hold: string; withdrawable: string; age_hours: number };
  settlements: { status: string; count: number; net: string }[];
  withdrawal_requests: { status: string; count: number; amount: string }[];
  checked_at: string;
};

/** Minor units (string) -> "GH₵1,234.56" */
const minorToGHS = (v: string | number) =>
  `GH₵${(Number(v) / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatGHS = (amount: number) =>
  `GH₵${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-gray-100 text-gray-600 border-gray-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
};

const DATE_PRESETS = [
  { label: "Last 24 hours", value: "24h", durationMs: 24 * 60 * 60 * 1000 },
  { label: "Last 7 days", value: "7d", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { label: "Last 30 days", value: "30d", durationMs: 30 * 24 * 60 * 60 * 1000 },
  { label: "Last 90 days", value: "90d", durationMs: 90 * 24 * 60 * 60 * 1000 },
  { label: "All time", value: "all", durationMs: 0 },
];

export default function AdminWithdrawalsPage() {
  return (
    <Suspense fallback={null}>
      <AdminWithdrawalsPageInner />
    </Suspense>
  );
}

function AdminWithdrawalsPageInner() {
  const urlParams = useSearchParams();
  const [merchantFilter, setMerchantFilter] = useState<string | null>(
    urlParams.get("merchant_id")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [datePreset, setDatePreset] = useState("30d");
  const [dateFrom, setDateFrom] = useState<string>(() =>
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Review modal
  const [reviewTarget, setReviewTarget] = useState<WithdrawalRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Manual payout modal — recording money an operator moved by hand
  const [manualTarget, setManualTarget] = useState<WithdrawalRequest | null>(null);
  const [manualReference, setManualReference] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [manualWaiveFee, setManualWaiveFee] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Ledger verification — rebuilds the merchant's expected balance from
  // transactions, fees and payouts and compares it with the ledger.
  const [verifyTarget, setVerifyTarget] = useState<WithdrawalRequest | null>(null);
  const [verifyData, setVerifyData] = useState<Reconciliation | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  async function openVerify(req: WithdrawalRequest) {
    setVerifyTarget(req);
    setVerifyData(null);
    setVerifyError(null);
    setVerifyLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reconciliation?merchant_id=${encodeURIComponent(req.merchant_id)}`
      );
      const json = await res.json();
      if (!res.ok) setVerifyError(json.error || "Could not run the check.");
      else setVerifyData(json);
    } catch {
      setVerifyError("Network error.");
    } finally {
      setVerifyLoading(false);
    }
  }

  const params: Record<string, string> = { page: String(page), per_page: String(rowsPerPage) };
  if (searchQuery) params.search = searchQuery;
  if (statusFilter !== "All") params.status = statusFilter;
  if (merchantFilter) params.merchant_id = merchantFilter;
  if (dateFrom) params.date_from = dateFrom;

  const { data, mutate } = useAdminFetch<{
    data: WithdrawalRequest[];
    summary: Summary[];
    pagination: { total: number; total_pages: number };
  }>("/api/admin/withdrawal-requests", params);

  const requests = data?.data ?? [];
  const pagination = data?.pagination;
  const summaryFor = (status: string) =>
    data?.summary?.find((s) => s.status === status) ?? { status, count: 0, amount: 0 };
  const pending = summaryFor("PENDING");
  const approved = summaryFor("APPROVED");
  const rejected = summaryFor("REJECTED");
  const failed = summaryFor("FAILED");

  const openReview = (req: WithdrawalRequest, action: "APPROVE" | "REJECT") => {
    setReviewTarget(req);
    setReviewAction(action);
    setReviewNote("");
  };

  const openManual = (req: WithdrawalRequest) => {
    setManualTarget(req);
    setManualReference("");
    setManualNote("");
    setManualWaiveFee(false);
  };

  const submitManualPayout = async () => {
    if (!manualTarget || !manualReference.trim()) return;
    setManualSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/withdrawal-requests/${manualTarget.id}/manual-payout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: manualReference.trim(),
            note: manualNote || undefined,
            waive_fee: manualWaiveFee,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Could not record the payout");
      } else {
        toast.success(`${manualTarget.request_id_display} recorded as paid`);
        setManualTarget(null);
        mutate();
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setManualSubmitting(false);
    }
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      const res = await fetch(`/api/admin/withdrawal-requests/${reviewTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: reviewAction, note: reviewNote || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Review failed");
      } else if (reviewAction === "APPROVE") {
        toast.success(
          json.payout_status === "COMPLETED"
            ? `${reviewTarget.request_id_display} approved — payout sent`
            : `${reviewTarget.request_id_display} approved — payout processing`
        );
      } else {
        toast.success(`${reviewTarget.request_id_display} rejected`);
      }
      setReviewTarget(null);
      mutate();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <AdminPermissionGuard requiredPermission="settlement-monitoring">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">
          Withdrawal Requests
        </h1>
        <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
          Manually initiated merchant withdrawals require approval before they are paid out.
          Approving a request runs the payout immediately via the merchant&apos;s settlement account.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Pending Approval", tile: pending, icon: Clock, accent: "text-amber-600 bg-amber-50" },
          { label: "Approved", tile: approved, icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50" },
          { label: "Rejected", tile: rejected, icon: XCircle, accent: "text-gray-500 bg-gray-100" },
          { label: "Failed Payouts", tile: failed, icon: HandCoins, accent: "text-red-600 bg-red-50" },
        ].map(({ label, tile, icon: Icon, accent }) => (
          <div key={label} className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                {label}
              </p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">{tile.count}</p>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{formatGHS(tile.amount)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">
            Search Requests
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
            <input
              type="text"
              placeholder="WDR-20260718... or merchant name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-black/10 bg-slate-50 pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)] transition-all"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {(["All", "PENDING", "PROCESSING", "APPROVED", "REJECTED", "FAILED"] as const).map(
              (value) => (
                <button
                  key={value}
                  onClick={() => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    statusFilter === value
                      ? value === "APPROVED"
                        ? "bg-emerald-600 text-white"
                        : value === "REJECTED"
                        ? "bg-gray-500 text-white"
                        : value === "FAILED"
                        ? "bg-red-500 text-white"
                        : value === "PROCESSING"
                        ? "bg-blue-600 text-white"
                        : value === "PENDING"
                        ? "bg-amber-500 text-white"
                        : "bg-[color:var(--trite-ink)] text-white"
                      : "bg-black/5 text-[color:var(--trite-muted)] hover:bg-black/10"
                  }`}
                >
                  {value === "All" ? "All" : value.toLowerCase()}
                </button>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">
            Date Range
          </p>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
            <select
              value={datePreset}
              onChange={(e) => {
                const next = DATE_PRESETS.find((p) => p.value === e.target.value);
                setDatePreset(e.target.value);
                setDateFrom(
                  next && next.value !== "all"
                    ? new Date(Date.now() - next.durationMs).toISOString()
                    : ""
                );
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-black/10 bg-slate-50 pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests list */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-black/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[color:var(--trite-ink)]">Requests</h2>
              {merchantFilter && (
                <button
                  onClick={() => {
                    setMerchantFilter(null);
                    setPage(1);
                  }}
                  title="Clear merchant filter"
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {requests[0]?.business_name ?? `Merchant #${merchantFilter.slice(0, 8)}`}
                  <span aria-hidden>✕</span>
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
              Showing {pagination?.total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–
              {Math.min(page * rowsPerPage, pagination?.total ?? 0)} of {pagination?.total ?? 0}
            </p>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-black/5 lg:hidden">
          {requests.map((req) => (
            <div key={req.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono font-bold text-[color:var(--trite-ink)]">
                    {req.request_id_display}
                  </p>
                  <p className="text-xs text-[color:var(--trite-muted)]">{req.business_name}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    STATUS_STYLES[req.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {req.status.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                    Destination
                  </p>
                  <p className="text-xs font-medium text-[color:var(--trite-ink)]">
                    {req.provider_name} {req.account_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                    Amount
                  </p>
                  <p className="text-sm font-black text-[color:var(--trite-ink)]">
                    {formatGHS(req.amount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-[color:var(--trite-muted)]">
                  {new Date(req.created_at).toLocaleString("en-GH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openVerify(req)}
                    title="Rebuild this merchant's balance from their transactions, fees and payouts, and compare it with the ledger"
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                  >
                    Verify
                  </button>
                  {(req.status === "PENDING" || req.status === "FAILED") && (
                    <>
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => openReview(req, "REJECT")}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => openReview(req, "APPROVE")}
                          className="rounded-lg bg-[color:var(--trite-lime)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[color:var(--trite-lime-strong)]"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openManual(req)}
                      title="Record a payout you made by hand, outside the automated rails"
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                    >
                      Mark paid
                    </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="p-8 text-center text-sm text-[color:var(--trite-muted)]">
              No withdrawal requests match the current filters.
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-black/5 text-left text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)]">
                <th className="px-6 py-4">Request</th>
                <th className="px-4 py-4">Merchant</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Destination</th>
                <th className="px-4 py-4">Requested</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-black/[0.02]">
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono font-bold text-[color:var(--trite-ink)]">
                      {req.request_id_display}
                    </p>
                    {req.settlement_id_display && (
                      <p className="mt-1 text-[10px] text-[color:var(--trite-muted)]">
                        {req.settlement_id_display} ({req.settlement_status?.toLowerCase()})
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[color:var(--trite-ink)]">
                      {req.business_name}
                    </p>
                    <p className="text-xs text-[color:var(--trite-muted)]">
                      {req.merchant_display_id}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-[color:var(--trite-ink)]">
                      {formatGHS(req.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-[color:var(--trite-ink)]">{req.provider_name}</p>
                    <p className="text-xs text-[color:var(--trite-muted)]">
                      {req.account_number} · {req.account_name}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-[color:var(--trite-muted)]">
                      {new Date(req.created_at).toLocaleString("en-GH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[req.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {req.status.toLowerCase()}
                    </span>
                    {req.status === "REJECTED" && req.review_note && (
                      <p className="mt-1 max-w-[180px] truncate text-[10px] text-[color:var(--trite-muted)]" title={req.review_note}>
                        {req.review_note}
                      </p>
                    )}
                    {req.status === "FAILED" && req.failure_reason && (
                      <p className="mt-1 max-w-[180px] truncate text-[10px] text-red-500" title={req.failure_reason}>
                        {req.failure_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openVerify(req)}
                        title="Rebuild this merchant's balance from their transactions, fees and payouts, and compare it with the ledger"
                        className="rounded-lg border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                      >
                        Verify
                      </button>
                      {req.status === "PENDING" || req.status === "FAILED" ? (
                        <>
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => openReview(req, "REJECT")}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => openReview(req, "APPROVE")}
                              className="rounded-lg bg-[color:var(--trite-lime)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[color:var(--trite-lime-strong)]"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openManual(req)}
                          title="Record a payout you made by hand, outside the automated rails"
                          className="rounded-lg border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                        >
                          Mark paid
                        </button>
                        </>
                      ) : (
                        <span className="self-center text-xs text-[color:var(--trite-muted)]">
                          {req.reviewed_at
                            ? new Date(req.reviewed_at).toLocaleDateString("en-GH", {
                                dateStyle: "medium",
                              })
                            : "—"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-[color:var(--trite-muted)]">
                    No withdrawal requests match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 border-t border-black/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[color:var(--trite-muted)]">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-black/10 bg-white text-sm text-[color:var(--trite-ink)] outline-none"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50"
            >
              &lt;
            </button>
            <span className="px-2 text-sm text-[color:var(--trite-muted)]">
              {page} / {pagination?.total_pages ?? 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination?.total_pages ?? 1, p + 1))}
              disabled={page >= (pagination?.total_pages ?? 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Review confirmation modal */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">
              {reviewAction === "APPROVE" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              {reviewAction === "APPROVE"
                ? "Approving pays out immediately to the merchant's settlement account."
                : "The merchant keeps the funds in their balance and can submit a new request."}
            </p>

            <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Request</span>
                <span className="font-mono font-semibold text-[color:var(--trite-ink)]">
                  {reviewTarget.request_id_display}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Merchant</span>
                <span className="font-medium text-[color:var(--trite-ink)]">
                  {reviewTarget.business_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Amount</span>
                <span className="font-bold text-[color:var(--trite-ink)]">
                  {formatGHS(reviewTarget.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Destination</span>
                <span className="font-medium text-[color:var(--trite-ink)]">
                  {reviewTarget.provider_name} {reviewTarget.account_number}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-[color:var(--trite-ink)]">
                Note {reviewAction === "REJECT" ? "(shown in the audit log)" : "(optional)"}
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
                placeholder={
                  reviewAction === "REJECT" ? "Reason for rejection..." : "Optional note..."
                }
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setReviewTarget(null)}
                disabled={reviewing}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={reviewing}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
                  reviewAction === "APPROVE"
                    ? "bg-[color:var(--trite-lime)] hover:bg-[color:var(--trite-lime-strong)]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {reviewing
                  ? "Processing..."
                  : reviewAction === "APPROVE"
                  ? "Approve & Pay Out"
                  : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {manualTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[color:var(--trite-ink)]">
              Record a manual payout
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Use this only after you have actually sent the money yourself. It moves
              the funds out of the merchant&apos;s balance so they cannot be withdrawn
              a second time.
            </p>

            <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Request</span>
                <span className="font-mono font-semibold text-[color:var(--trite-ink)]">
                  {manualTarget.request_id_display}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Merchant</span>
                <span className="font-medium text-[color:var(--trite-ink)]">
                  {manualTarget.business_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Amount</span>
                <span className="font-bold text-[color:var(--trite-ink)]">
                  {formatGHS(manualTarget.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--trite-muted)]">Destination</span>
                <span className="font-medium text-[color:var(--trite-ink)]">
                  {manualTarget.provider_name} {manualTarget.account_number}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-[color:var(--trite-ink)]">
                Payment reference <span className="text-red-600">*</span>
              </label>
              <input
                value={manualReference}
                onChange={(e) => setManualReference(e.target.value)}
                placeholder="Momo or bank receipt, e.g. MP240817.1423.A45678"
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
              <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                Recorded against the settlement so the payment can be traced later.
              </p>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-[color:var(--trite-ink)]">
                Note (optional)
              </label>
              <textarea
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                rows={2}
                placeholder="Why the rails could not be used..."
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={manualWaiveFee}
                onChange={(e) => setManualWaiveFee(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-black/20 accent-[color:var(--trite-lime)]"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-[color:var(--trite-ink)]">
                  Waive the transfer fee
                </span>
                <span className="block text-xs text-[color:var(--trite-muted)]">
                  Charge the merchant nothing for this payout. The fee is still
                  recorded and flagged as waived.
                </span>
              </span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setManualTarget(null)}
                disabled={manualSubmitting}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                Cancel
              </button>
              <button
                onClick={submitManualPayout}
                disabled={manualSubmitting || !manualReference.trim()}
                className="flex-1 rounded-lg bg-[color:var(--trite-ink)] py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                {manualSubmitting ? "Recording..." : "Record as paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger verification */}
      {verifyTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setVerifyTarget(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-start justify-between border-b border-black/5 bg-white px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-[color:var(--trite-ink)]">
                  Ledger verification
                </h3>
                <p className="mt-0.5 text-xs text-[color:var(--trite-muted)]">
                  {verifyTarget.business_name ?? verifyTarget.merchant_display_id ?? "Merchant"}
                </p>
              </div>
              <button
                onClick={() => setVerifyTarget(null)}
                className="rounded-lg p-1 text-[color:var(--trite-muted)] hover:bg-black/5"
                aria-label="Close"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {verifyLoading && (
                <p className="text-sm text-[color:var(--trite-muted)]">Running checks…</p>
              )}
              {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}

              {verifyData && (
                <>
                  <div
                    className={`rounded-xl border p-4 ${
                      verifyData.summary.balanced
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-widest ${
                        verifyData.summary.balanced ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {verifyData.summary.balanced ? "Balanced" : "Discrepancy found"}
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        verifyData.summary.balanced ? "text-emerald-800" : "text-red-800"
                      }`}
                    >
                      {verifyData.summary.balanced
                        ? "The ledger matches this merchant's transactions, fees and payouts exactly."
                        : `The ledger is off by ${minorToGHS(verifyData.summary.difference)} against what the source records imply.`}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                      Reconciliation
                    </p>
                    <dl className="divide-y divide-black/5 text-sm">
                      {[
                        [`Settled payments (${verifyData.summary.settled_count})`, verifyData.summary.gross, false],
                        ["less: processing fees", `-${verifyData.summary.processing_fees}`, false],
                        ["less: other fees", `-${verifyData.summary.other_fees}`, false],
                        ["= Net payable", verifyData.summary.net_payable, true],
                        ["less: paid out", `-${verifyData.summary.paid_out}`, false],
                        ["= Expected balance", verifyData.summary.expected_float, true],
                        ["Actual ledger balance", verifyData.summary.actual_float, true],
                        ["Difference", verifyData.summary.difference, true],
                      ].map(([label, value, strong], i) => (
                        <div key={i} className="flex justify-between py-1.5">
                          <dt className={strong ? "font-semibold text-[color:var(--trite-ink)]" : "text-[color:var(--trite-muted)]"}>
                            {label as string}
                          </dt>
                          <dd className={`tabular-nums ${strong ? "font-bold text-[color:var(--trite-ink)]" : "text-[color:var(--trite-ink)]"}`}>
                            {minorToGHS(value as string)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                      Component checks
                    </p>
                    <div className="space-y-2">
                      {verifyData.checks.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-start justify-between gap-3 rounded-lg border border-black/5 px-3 py-2"
                        >
                          <div className="flex items-start gap-2">
                            {c.ok ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            ) : (
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            )}
                            <span className="text-sm text-[color:var(--trite-ink)]">{c.name}</span>
                          </div>
                          {!c.ok && (
                            <span className="shrink-0 text-xs font-semibold tabular-nums text-red-600">
                              {minorToGHS(c.delta)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                      Available to withdraw
                    </p>
                    <dl className="divide-y divide-black/5 text-sm">
                      {[
                        ["Float balance", verifyData.availability.total],
                        [`Still aging (< ${verifyData.availability.age_hours}h)`, String(Number(verifyData.availability.total) - Number(verifyData.availability.aged))],
                        ["Held by open requests", verifyData.availability.withdrawal_hold],
                        ["Withdrawable now", verifyData.availability.withdrawable],
                      ].map(([label, value], i) => (
                        <div key={i} className="flex justify-between py-1.5">
                          <dt className="text-[color:var(--trite-muted)]">{label}</dt>
                          <dd className="tabular-nums text-[color:var(--trite-ink)]">{minorToGHS(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <p className="text-[10px] text-[color:var(--trite-muted)]">
                    Checked {new Date(verifyData.checked_at).toLocaleString("en-GH")} · read-only
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPermissionGuard>
  );
}