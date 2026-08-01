"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import {
  Search,
  Download,
  Filter,
  AlertTriangle,
  File,
  Calendar,
  Menu,
  FileText,
} from "lucide-react";

type ApiTx = {
  id: string; tx_id_display: string; merchant_id: string;
  business_name: string | null;
  amount: number; currency: string; method: string;
  status: string; flag_level: string; gateway_node: string | null;
  created_at: string;
};

type TxStatus = "INITIATED" | "PENDING_AUTH" | "AUTHENTICATED" | "AUTHORIZED" | "CAPTURED" | "PARTIALLY_CAPTURED" | "PENDING_SETTLEMENT" | "SETTLED" | "FAILED" | "CANCELLED" | "EXPIRED" | "REVERSED" | string;


// useSearchParams needs a Suspense boundary so the rest of the route can
// still be prerendered (see next docs: use-search-params).
export default function AdminTransactionsPage() {
  return (
    <Suspense fallback={null}>
      <AdminTransactionsPageInner />
    </Suspense>
  );
}

function AdminTransactionsPageInner() {
  // Deep-link filter from the merchant detail page ("View All →")
  const urlParams = useSearchParams();
  const [merchantFilter, setMerchantFilter] = useState<string | null>(
    urlParams.get("merchant_id")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const [detailTxId, setDetailTxId] = useState<string | null>(null);

  // ── Calendar date-range picker ────────────────────────────────────────────
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>(() =>
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  );
  const [dateTo, setDateTo] = useState<string>("");
  const [datePresetLabel, setDatePresetLabel] = useState<string>("Last 30 days");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const presets = [
    { label: "Last 5 minutes",  value: "5m",  durationMs: 5  * 60 * 1000 },
    { label: "Last 15 minutes", value: "15m", durationMs: 15 * 60 * 1000 },
    { label: "Last 30 minutes", value: "30m", durationMs: 30 * 60 * 1000 },
    { label: "Last 1 hour",     value: "1h",  durationMs: 60 * 60 * 1000 },
    { label: "Last 12 hours",   value: "12h", durationMs: 12 * 60 * 60 * 1000 },
    { label: "Last 24 hours",   value: "24h", durationMs: 24 * 60 * 60 * 1000 },
    { label: "Last 7 days",     value: "7d",  durationMs: 7  * 24 * 60 * 60 * 1000 },
    { label: "Last 30 days",    value: "30d", durationMs: 30 * 24 * 60 * 60 * 1000 },
    { label: "Last 90 days",    value: "90d", durationMs: 90 * 24 * 60 * 60 * 1000 },
    { label: "All time",        value: "all", durationMs: 0 },
  ];

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    if (preset.value === "all") {
      setDateFrom("");
      setDateTo("");
    } else {
      setDateFrom(new Date(Date.now() - preset.durationMs).toISOString());
      setDateTo("");
    }
    setDatePresetLabel(preset.label);
    setCalendarOpen(false);
    setPage(1);
  };

  const handleApplyCustom = () => {
    if (!startDateInput) return;
    const fromStr = new Date(startDateInput + "T00:00:00.000Z").toISOString();
    const toDate  = endDateInput ? new Date(endDateInput + "T23:59:59.999Z") : new Date();
    const toStr   = toDate.toISOString();
    setDateFrom(fromStr);
    setDateTo(toStr);
    const fmtStart = new Date(startDateInput).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" });
    const fmtEnd   = endDateInput
      ? new Date(endDateInput).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })
      : "Now";
    setDatePresetLabel(`${fmtStart} – ${fmtEnd}`);
    setCalendarOpen(false);
    setPage(1);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const params: Record<string, string> = { page: String(page), per_page: String(rowsPerPage) };
  if (searchQuery)           params.search   = searchQuery;
  if (statusFilter !== "All") params.status  = statusFilter;
  if (merchantFilter)        params.merchant_id = merchantFilter;
  if (dateFrom)              params.date_from = dateFrom;
  if (dateTo)                params.date_to   = dateTo;

  const { data: txData } = useAdminFetch<{ data: ApiTx[]; pagination: { total: number; total_pages: number } }>("/api/admin/transactions", params);
  const transactions = txData?.data ?? [];
  const pagination = txData?.pagination;

  const formatAmount = (amount: number) =>
    `GH₵${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusColor = (status: TxStatus) => {
    switch (status) {
      case "SETTLED":
      case "CAPTURED":
      case "PARTIALLY_CAPTURED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "AUTHORIZED":
      case "AUTHENTICATED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "INITIATED":
      case "PENDING_AUTH":
      case "PENDING_SETTLEMENT":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "FAILED":  return "bg-red-100 text-red-700 border-red-200";
      case "CANCELLED":
      case "EXPIRED":
      case "REVERSED": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getFlagColor = (flag?: string) => {
    if (!flag) return "";
    if (flag === "HIGH" || flag === "SUSPICIOUS") return "text-red-500";
    if (flag === "MISMATCH") return "text-amber-500";
    if (flag === "LARGE") return "text-blue-500";
    return "text-gray-500";
  };


  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Transaction Monitoring</h1>
        <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
          Real-time architectural overview of platform liquidity and transaction integrity. Maintain security across 14 merchant channels and cross-border gateways.
        </p>
      </div>

      {/* Filters — now 4 cols on desktop to accommodate the date picker */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Transaction ID */}
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">Search System</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
            <input
              type="text"
              placeholder="TX-8492049..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/10 bg-slate-50 pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)] transition-all"
            />
          </div>
        </div>

        {/* Status & Priority */}
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">Status & Priority</p>
          <div className="flex flex-wrap gap-2">
            {([
              { label: "All",        value: "All" },
              { label: "Initiated",  value: "INITIATED" },
              { label: "Settled",    value: "SETTLED" },
              { label: "Authorized", value: "AUTHORIZED" },
              { label: "Pending",    value: "PENDING_SETTLEMENT" },
              { label: "Failed",     value: "FAILED" },
              { label: "Cancelled",  value: "CANCELLED" },
            ] as const).map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === value
                    ? value === "All"       ? "bg-[color:var(--trite-ink)] text-white"
                    : value === "SETTLED"   ? "bg-emerald-600 text-white"
                    : value === "AUTHORIZED"? "bg-blue-600 text-white"
                    : value === "FAILED"    ? "bg-red-500 text-white"
                    : value === "CANCELLED" ? "bg-gray-500 text-white"
                    : "bg-amber-500 text-white"
                    : "bg-black/5 text-[color:var(--trite-muted)] hover:bg-black/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">Date Range</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="flex h-11 w-full items-center gap-2 rounded-xl border border-black/10 bg-slate-50 px-3 text-sm text-[color:var(--trite-ink)] hover:bg-black/[0.02] focus:border-[color:var(--trite-lime-strong)] transition-all cursor-pointer"
            >
              <Calendar className="h-4 w-4 shrink-0 text-[color:var(--trite-muted)]" />
              <span className="flex-1 truncate text-left">{datePresetLabel}</span>
              <svg className="h-3 w-3 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {calendarOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setCalendarOpen(false)} />

                {/* Mobile: bottom sheet */}
                <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-black/10 bg-white shadow-2xl sm:hidden">
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="h-1 w-10 rounded-full bg-black/10" />
                  </div>
                  <div className="px-5 pb-2 pt-1 flex items-center justify-between">
                    <p className="text-sm font-bold text-[color:var(--trite-ink)]">Filter by Date</p>
                    <button type="button" onClick={() => setCalendarOpen(false)} className="text-xs font-semibold text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)] transition-colors">Done</button>
                  </div>

                  <div className="px-5 pb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-2">Presets</p>
                    <div className="flex flex-col gap-1">
                      {presets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                            datePresetLabel === preset.label
                              ? "bg-[color:var(--trite-ink)] text-white"
                              : "text-gray-700 hover:bg-black/[0.03]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-black/5 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-3">Custom Range</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="admin-start-date-m" className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Start Date</label>
                        <input id="admin-start-date-m" type="date" value={startDateInput} onChange={(e) => setStartDateInput(e.target.value)}
                          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]" />
                      </div>
                      <div>
                        <label htmlFor="admin-end-date-m" className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">End Date</label>
                        <input id="admin-end-date-m" type="date" value={endDateInput} onChange={(e) => setEndDateInput(e.target.value)}
                          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]" />
                      </div>
                    </div>
                    <button type="button" onClick={handleApplyCustom}
                      className="mt-3 w-full inline-flex items-center justify-center rounded-xl bg-[color:var(--trite-ink)] px-4 py-3 text-sm font-bold text-white hover:bg-black transition-all active:scale-[0.98]">
                      Apply Range
                    </button>
                  </div>
                  <div className="h-6" />
                </div>

                {/* Desktop: absolute dropdown */}
                <div className="hidden sm:flex absolute left-0 mt-2 z-50 w-[460px] rounded-2xl border border-black/10 bg-slate-50 p-5 shadow-xl ring-1 ring-black/5 flex-row gap-4">
                  <div className="w-[155px] flex flex-col gap-1 border-r border-black/5 pr-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-2">Presets</p>
                    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                      {presets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`text-left rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                            datePresetLabel === preset.label
                              ? "bg-[color:var(--trite-ink)] text-white"
                              : "text-gray-700 hover:bg-black/[0.03]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-3">Custom Range</p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="admin-start-date" className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Start Date</label>
                        <input id="admin-start-date" type="date" value={startDateInput} onChange={(e) => setStartDateInput(e.target.value)}
                          className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]" />
                      </div>
                      <div>
                        <label htmlFor="admin-end-date" className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">End Date</label>
                        <input id="admin-end-date" type="date" value={endDateInput} onChange={(e) => setEndDateInput(e.target.value)}
                          className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]" />
                      </div>
                      <button type="button" onClick={handleApplyCustom}
                        className="w-full mt-1 inline-flex items-center justify-center rounded-lg bg-[color:var(--trite-ink)] px-4 py-2 text-xs font-bold text-white hover:bg-black transition-all active:scale-[0.98]">
                        Apply Range
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] mb-3">Institutional Export</p>
          <div className="flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02] transition-colors">
              <FileText className="h-4 w-4" />
              CSV
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02] transition-colors">
              <File className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Live Ledger List */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[color:var(--trite-ink)]">Live Ledger</h2>
              {merchantFilter && (
                <button
                  onClick={() => { setMerchantFilter(null); setPage(1); }}
                  title="Clear merchant filter"
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {transactions[0]?.business_name ?? `Merchant #${merchantFilter.slice(0, 8)}`}
                  <span aria-hidden>✕</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[color:var(--trite-muted)] mt-1">
              Showing {pagination?.total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, pagination?.total ?? 0)} of {pagination?.total ?? 0}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
            <Calendar className="h-4 w-4" />
            {datePresetLabel}
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="divide-y divide-black/5 lg:hidden">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 space-y-4 hover:bg-black/[0.01] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <span className="text-xs font-mono font-medium text-blue-600">{tx.tx_id_display.split("-")[1] ?? tx.tx_id_display.slice(0,6)}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Transaction ID</p>
                    <p className="text-xs font-mono font-bold text-[color:var(--trite-ink)]">{tx.tx_id_display}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(tx.status)}`}>
                  {tx.status.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900">
                    <span className="text-xs font-bold text-white">{tx.method.slice(0,2)}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Merchant ID</p>
                    <p className="text-xs font-medium text-[color:var(--trite-ink)]">#{tx.merchant_id.slice(0,8)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Amount</p>
                  <p className="text-sm font-black text-[color:var(--trite-ink)]">{formatAmount(tx.amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/[0.03]">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Method</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MethodIcon method={tx.method} />
                    <span className="text-[10px] font-bold text-[color:var(--trite-ink)] truncate">{tx.method}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Currency</p>
                  <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">{tx.currency}</span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Risk Flag</p>
                  {tx.flag_level && tx.flag_level !== "NONE" ? (
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <AlertTriangle className={`h-3 w-3 ${tx.flag_level === "HIGH" ? "text-red-500" : "text-amber-500"}`} />
                      <span className={`text-[10px] font-bold ${tx.flag_level === "HIGH" ? "text-red-500" : "text-amber-500"}`}>{tx.flag_level}</span>
                    </div>
                  ) : <span className="text-[10px] text-[color:var(--trite-muted)]">—</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[9px] font-medium text-[color:var(--trite-muted)]">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => setDetailTxId(tx.id)}
                  className="text-[10px] font-bold uppercase tracking-widest text-blue-600"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-black/5 text-left text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-wider">
                <th className="py-4 px-6">TX ID</th>
                <th className="py-4 px-4">User/Merchant</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Currency</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setDetailTxId(tx.id)}
                  className="border-b border-black/5 last:border-0 hover:bg-black/[0.02] cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-blue-50">
                      <span className="text-xs font-mono font-medium text-blue-600">{tx.tx_id_display.split("-")[1] ?? tx.tx_id_display.slice(0,6)}</span>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{tx.tx_id_display}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900">
                        <span className="text-sm font-semibold text-white">{tx.method.slice(0,2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[color:var(--trite-ink)]">{tx.method}</p>
                        <p className="text-xs text-[color:var(--trite-muted)]">Merchant #{tx.merchant_id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><span className="text-sm font-semibold text-[color:var(--trite-ink)]">{formatAmount(tx.amount)}</span></td>
                  <td className="py-4 px-4"><span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{tx.currency}</span></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <MethodIcon method={tx.method} />
                      <span className="text-sm text-[color:var(--trite-muted)]">{tx.method}</span>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                      {new Date(tx.created_at).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        tx.status === "SETTLED" || tx.status === "CAPTURED" ? "bg-emerald-500" :
                        tx.status === "AUTHORIZED" || tx.status === "AUTHENTICATED" ? "bg-blue-500" :
                        tx.status === "FAILED"  ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      {tx.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {tx.flag_level && tx.flag_level !== "NONE" ? (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`h-4 w-4 ${tx.flag_level === "HIGH" ? "text-red-500" : "text-amber-500"}`} />
                        <span className={`text-xs font-medium ${tx.flag_level === "HIGH" ? "text-red-500" : "text-amber-500"}`}>{tx.flag_level}</span>
                      </div>
                    ) : <span className="text-xs text-[color:var(--trite-muted)]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-black/5 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[color:var(--trite-muted)]">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              // No fixed height: globals.css forces select padding/font-size with
              // !important, so a Tailwind h-8/h-9 clips the value vertically.
              className="rounded-lg border border-black/10 bg-white text-sm text-[color:var(--trite-ink)] outline-none"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-sm text-[color:var(--trite-muted)]">
              {pagination?.total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, pagination?.total ?? 0)} of {pagination?.total ?? 0}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50 transition-colors"
              >
                &lt;&lt;
              </button>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50 transition-colors"
              >
                &lt;
              </button>
              <button 
                onClick={() => setPage(p => Math.min(pagination?.total_pages ?? 1, p + 1))}
                disabled={page >= (pagination?.total_pages ?? 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50 transition-colors"
              >
                &gt;
              </button>
              <button 
                onClick={() => setPage(pagination?.total_pages ?? 1)}
                disabled={page >= (pagination?.total_pages ?? 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50 transition-colors"
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      {/* Liquidity Pulse card removed for now — its figures were hardcoded.
          Restore from git history once it's backed by real reserve data. */}
      <div className="grid grid-cols-1 gap-6">
        {/* Architect Insights */}
        <div className="rounded-2xl bg-[color:var(--trite-ink)] p-6 text-white">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Architect Insights</p>
          <h3 className="mt-3 text-xl font-semibold">Anomaly detection is operating at 99.8% precision.</h3>
          <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button className="rounded-xl bg-[color:var(--trite-lime)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--trite-lime-strong)]">
              Review Security Audit
            </button>
            <span className="text-xs text-white/60">Latest scan: 6 minutes ago</span>
          </div>
        </div>

      </div>

      <TransactionDetailModal
        txId={detailTxId}
        endpointBase="/api/admin/transactions"
        onClose={() => setDetailTxId(null)}
      />
    </>
  );
}

function MethodIcon({ method }: { method: string }) {
  if (method === "SWIFT") {
    return (
      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    );
  }
  if (method === "Card") {
    return (
      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    );
  }
  if (method === "Bank Transfer") {
    return (
      <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    );
  }
  if (method === "Mobile Money") {
    return (
      <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  );
}
