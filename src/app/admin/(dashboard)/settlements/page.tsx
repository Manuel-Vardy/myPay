"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { Search, Calendar, Banknote, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

type Settlement = {
  id: string;
  settlement_id_display: string;
  merchant_id: string;
  business_name: string | null;
  merchant_display_id: string | null;
  gross_amount: number;
  fees: number;
  net_amount: number;
  currency: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" | string;
  provider_name: string | null;
  account_number: string | null;
  bank_reference: string | null;
  failure_reason: string | null;
  transaction_count: number;
  created_at: string;
};

type Summary = { status: string; count: number; gross: number; fees: number; net: number };

const formatGHS = (amount: number) =>
  `GH₵${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
};

const DATE_PRESETS = [
  { label: "Last 24 hours", value: "24h", durationMs: 24 * 60 * 60 * 1000 },
  { label: "Last 7 days", value: "7d", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { label: "Last 30 days", value: "30d", durationMs: 30 * 24 * 60 * 60 * 1000 },
  { label: "Last 90 days", value: "90d", durationMs: 90 * 24 * 60 * 60 * 1000 },
  { label: "All time", value: "all", durationMs: 0 },
];

export default function AdminSettlementsPage() {
  return (
    <Suspense fallback={null}>
      <AdminSettlementsPageInner />
    </Suspense>
  );
}

function AdminSettlementsPageInner() {
  const urlParams = useSearchParams();
  const [merchantFilter, setMerchantFilter] = useState<string | null>(
    urlParams.get("merchant_id")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [datePreset, setDatePreset] = useState("30d");
  const [dateFrom, setDateFrom] = useState<string>(() =>
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const params: Record<string, string> = { page: String(page), per_page: String(rowsPerPage) };
  if (searchQuery) params.search = searchQuery;
  if (statusFilter !== "All") params.status = statusFilter;
  if (merchantFilter) params.merchant_id = merchantFilter;
  if (dateFrom) params.date_from = dateFrom;

  const { data } = useAdminFetch<{
    data: Settlement[];
    summary: Summary[];
    pagination: { total: number; total_pages: number };
  }>("/api/admin/settlements", params);

  const settlements = data?.data ?? [];
  const pagination = data?.pagination;
  const summaryFor = (status: string) =>
    data?.summary?.find((s) => s.status === status) ?? { status, count: 0, gross: 0, fees: 0, net: 0 };
  const completed = summaryFor("COMPLETED");
  const processing = summaryFor("PROCESSING");
  const failed = summaryFor("FAILED");
  const totalFees = (data?.summary ?? []).reduce((acc, s) => acc + (s.fees || 0), 0);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">
          Settlements
        </h1>
        <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
          Platform-wide payout ledger — automatic sweeps and approved merchant withdrawals.
          PROCESSING settlements with an unknown transfer outcome require manual reconciliation.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Completed Payouts",
            value: completed.count,
            sub: formatGHS(completed.net),
            icon: CheckCircle2,
            accent: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Processing",
            value: processing.count,
            sub: formatGHS(processing.net),
            icon: Loader2,
            accent: "text-blue-600 bg-blue-50",
          },
          {
            label: "Failed",
            value: failed.count,
            sub: formatGHS(failed.net),
            icon: AlertTriangle,
            accent: "text-red-600 bg-red-50",
          },
          {
            label: "Fees Collected",
            value: formatGHS(totalFees),
            sub: "all settlements",
            icon: Banknote,
            accent: "text-[color:var(--trite-lime-strong)] bg-green-50",
          },
        ].map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                {label}
              </p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">{value}</p>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">
            Search Settlements
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
            <input
              type="text"
              placeholder="STL-20260718... merchant or bank ref"
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
            {(["All", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"] as const).map(
              (value) => (
                <button
                  key={value}
                  onClick={() => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    statusFilter === value
                      ? value === "COMPLETED"
                        ? "bg-emerald-600 text-white"
                        : value === "FAILED"
                        ? "bg-red-500 text-white"
                        : value === "PROCESSING"
                        ? "bg-blue-600 text-white"
                        : value === "PENDING"
                        ? "bg-amber-500 text-white"
                        : value === "CANCELLED"
                        ? "bg-gray-500 text-white"
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

      {/* Settlements list */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-black/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[color:var(--trite-ink)]">Payout Ledger</h2>
              {merchantFilter && (
                <button
                  onClick={() => {
                    setMerchantFilter(null);
                    setPage(1);
                  }}
                  title="Clear merchant filter"
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {settlements[0]?.business_name ?? `Merchant #${merchantFilter.slice(0, 8)}`}
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
          {settlements.map((s) => (
            <div key={s.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono font-bold text-[color:var(--trite-ink)]">
                    {s.settlement_id_display}
                  </p>
                  <p className="text-xs text-[color:var(--trite-muted)]">{s.business_name}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {s.status.toLowerCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                    Gross
                  </p>
                  <p className="text-xs font-semibold text-[color:var(--trite-ink)]">
                    {formatGHS(s.gross_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                    Fees
                  </p>
                  <p className="text-xs font-semibold text-[color:var(--trite-ink)]">
                    {formatGHS(s.fees)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                    Net
                  </p>
                  <p className="text-sm font-black text-[color:var(--trite-ink)]">
                    {formatGHS(s.net_amount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-[color:var(--trite-muted)]">
                  {s.provider_name ? `${s.provider_name} ${s.account_number ?? ""}` : "—"}
                </p>
                <p className="text-[10px] text-[color:var(--trite-muted)]">
                  {new Date(s.created_at).toLocaleString("en-GH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          ))}
          {settlements.length === 0 && (
            <p className="p-8 text-center text-sm text-[color:var(--trite-muted)]">
              No settlements match the current filters.
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-black/5 text-left text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)]">
                <th className="px-6 py-4">Settlement</th>
                <th className="px-4 py-4">Merchant</th>
                <th className="px-4 py-4">Gross</th>
                <th className="px-4 py-4">Fees</th>
                <th className="px-4 py-4">Net</th>
                <th className="px-4 py-4">Destination</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-black/[0.02]">
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono font-bold text-[color:var(--trite-ink)]">
                      {s.settlement_id_display}
                    </p>
                    {s.bank_reference && (
                      <p className="mt-1 text-[10px] text-[color:var(--trite-muted)]">
                        Ref: {s.bank_reference}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[color:var(--trite-ink)]">
                      {s.business_name}
                    </p>
                    <p className="text-xs text-[color:var(--trite-muted)]">
                      {s.merchant_display_id}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[color:var(--trite-ink)]">
                      {formatGHS(s.gross_amount)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[color:var(--trite-muted)]">
                      {formatGHS(s.fees)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-[color:var(--trite-ink)]">
                      {formatGHS(s.net_amount)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {s.provider_name ? (
                      <>
                        <p className="text-sm text-[color:var(--trite-ink)]">{s.provider_name}</p>
                        <p className="text-xs text-[color:var(--trite-muted)]">
                          {s.account_number}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-[color:var(--trite-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-[color:var(--trite-muted)]">
                      {new Date(s.created_at).toLocaleString("en-GH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.status.toLowerCase()}
                    </span>
                    {s.status === "FAILED" && s.failure_reason && (
                      <p
                        className="mt-1 max-w-[160px] truncate text-[10px] text-red-500"
                        title={s.failure_reason}
                      >
                        {s.failure_reason}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
              {settlements.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-[color:var(--trite-muted)]">
                    No settlements match the current filters.
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
    </>
  );
}
