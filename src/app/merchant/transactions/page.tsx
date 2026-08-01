"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";
import TransactionDetailModal from "@/components/TransactionDetailModal";

type TxStatus = "INITIATED" | "PENDING_AUTH" | "AUTHENTICATED" | "AUTHORIZED" | "CAPTURED" | "PARTIALLY_CAPTURED" | "PENDING_SETTLEMENT" | "SETTLED" | "FAILED" | "CANCELLED" | "EXPIRED" | "REVERSED" | string;
type TxMethod = "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CRYPTO" | string;


export type APITransaction = {
  id: string;
  tx_id_display: string;
  customer_id: string;
  payer_email: string;
  method: TxMethod;
  status: TxStatus;
  amount: number;
  created_at: string;
};

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("transactions");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "SETTLED" | "AUTHORIZED" | "FAILED" | "CANCELLED">("all");
  const [page, setPage] = useState(1);
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "fiat" | "stablecoin" | "crypto">("all");

  // Dynamic Calendar Date Filter States
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  const [dateTo, setDateTo] = useState<string>("");
  const [datePresetLabel, setDatePresetLabel] = useState<string>("Last 30 days");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const presets = [
    { label: "Last 5 minutes", value: "5m", durationMs: 5 * 60 * 1000 },
    { label: "Last 15 minutes", value: "15m", durationMs: 15 * 60 * 1000 },
    { label: "Last 30 minutes", value: "30m", durationMs: 30 * 60 * 1000 },
    { label: "Last 1 hour", value: "1h", durationMs: 60 * 60 * 1000 },
    { label: "Last 12 hours", value: "12h", durationMs: 12 * 60 * 60 * 1000 },
    { label: "Last 24 hours", value: "24h", durationMs: 24 * 60 * 60 * 1000 },
    { label: "Last 7 days", value: "7d", durationMs: 7 * 24 * 60 * 60 * 1000 },
    { label: "Last 30 days", value: "30d", durationMs: 30 * 24 * 60 * 60 * 1000 },
    { label: "Last 90 days", value: "90d", durationMs: 90 * 24 * 60 * 60 * 1000 },
    { label: "All time", value: "all", durationMs: 0 },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
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
    const toDate = endDateInput ? new Date(endDateInput + "T23:59:59.999Z") : new Date();
    const toStr = toDate.toISOString();

    setDateFrom(fromStr);
    setDateTo(toStr);

    const formattedStart = new Date(startDateInput).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" });
    const formattedEnd = endDateInput
      ? new Date(endDateInput).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })
      : "Now";

    setDatePresetLabel(`${formattedStart} - ${formattedEnd}`);
    setCalendarOpen(false);
    setPage(1);
  };
  const [detailTxId, setDetailTxId] = useState<string | null>(null);

  // Build clean params — exclude empty/default values to match how dashboard fetches
  const fetchParams = useMemo(() => {
    const p: Record<string, string> = {
      page: page.toString(),
      per_page: "10",
    };
    if (query) p.search = query;
    if (statusFilter !== "all") p.status = statusFilter;
    if (currencyFilter !== "all") p.currency = currencyFilter.toUpperCase();
    if (dateFrom) p.date_from = dateFrom;
    if (dateTo) p.date_to = dateTo;
    return p;
  }, [query, statusFilter, currencyFilter, page, dateFrom, dateTo]);

  const { data: fetchRes, loading } = useMerchantFetch<{ 
    data: APITransaction[]; 
    global_stats: {
      total_volume: number;
      completed_count: number;
      pending_count: number;
      failed_count: number;
      volume_change_percentage_24h: number;
      method_mix: { name: string; count: number; percent: number; color: string }[];
    };
    pagination: { page: number; per_page: number; total: number; total_pages: number };
  }>(
    "/api/merchant/transactions",
    fetchParams
  );

  const transactions = fetchRes?.data ?? [];
  const stats = fetchRes?.global_stats ?? {
    total_volume: 0,
    completed_count: 0,
    pending_count: 0,
    failed_count: 0,
    volume_change_percentage_24h: 0,
    method_mix: []
  };
  const pagination = fetchRes?.pagination ?? { page: 1, per_page: 10, total: 0, total_pages: 1 };

  const dominantMethod = useMemo(() => {
    if (!stats.method_mix.length) return null;
    return stats.method_mix[0]; // Already sorted by count descending in API
  }, [stats.method_mix]);

  return (
    <>
      <div className="px-4 py-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Transaction Overview
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
                Transaction Monitoring
              </h1>
            </div>
            <div className="flex gap-2">
              <button className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                <FileTextIcon className="h-4 w-4" />
                Export PDF
              </button>
              <button className="flex h-10 items-center gap-2 rounded-lg bg-[color:var(--trite-ink)] px-4 text-sm font-semibold text-white hover:bg-black">
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Total Volume</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  stats.volume_change_percentage_24h >= 0 ? "bg-[color:var(--trite-lime)] text-white" : "bg-red-100 text-red-600"
                }`}>
                  {stats.volume_change_percentage_24h > 0 ? "+" : ""}{stats.volume_change_percentage_24h}%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {formatGHS(stats.total_volume)}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">{pagination.total} transactions total</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Completed</span>
                <span className="rounded-full bg-[color:var(--trite-lime)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {Math.round((stats.completed_count / (pagination.total || 1)) * 100)}%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {stats.completed_count}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Successful payments</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Pending</span>
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                  Active
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {stats.pending_count}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Awaiting confirmation</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Issues</span>
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                  {stats.failed_count}
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {stats.failed_count}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Failed</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-[color:var(--trite-ink)]">
                    Transactions
                  </div>
                  <div className="text-xs text-[color:var(--trite-muted)]">
                    View and manage all payment transactions
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 h-10 text-sm">
                    <SearchIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full bg-transparent text-gray-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <select
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value as any)}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
                >
                  <option value="all">All Currencies</option>
                  <option value="fiat">Fiat (GHS)</option>
                  <option value="stablecoin">Stablecoins (USDC/USDT)</option>
                  <option value="crypto">Crypto (BTC)</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
                >
                  <option value="all">All Status</option>
                  <option value="SETTLED">Settled</option>
                  <option value="AUTHORIZED">Authorized</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(!calendarOpen)}
                    className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-3 text-sm text-gray-900 bg-white outline-none hover:bg-black/[0.02] focus:border-[color:var(--trite-lime-strong)] transition-all cursor-pointer"
                  >
                    <CalendarIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
                    <span>{datePresetLabel}</span>
                    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {calendarOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setCalendarOpen(false)} />

                      {/* Mobile: bottom sheet — fixed, full width, anchored to bottom */}
                      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-0 rounded-t-2xl border-t border-black/10 bg-white shadow-2xl sm:hidden">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                          <div className="h-1 w-10 rounded-full bg-black/10" />
                        </div>
                        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
                          <p className="text-sm font-bold text-[color:var(--trite-ink)]">Filter by Date</p>
                          <button type="button" onClick={() => setCalendarOpen(false)} className="text-xs font-semibold text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)] transition-colors">Done</button>
                        </div>

                        {/* Presets: single-column list */}
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

                        {/* Custom range */}
                        <div className="border-t border-black/5 px-5 py-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-3">Custom Range</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1" htmlFor="start-date-input-m">Start Date</label>
                              <input
                                id="start-date-input-m"
                                type="date"
                                value={startDateInput}
                                onChange={(e) => setStartDateInput(e.target.value)}
                                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1" htmlFor="end-date-input-m">End Date</label>
                              <input
                                id="end-date-input-m"
                                type="date"
                                value={endDateInput}
                                onChange={(e) => setEndDateInput(e.target.value)}
                                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleApplyCustom}
                            className="mt-3 w-full inline-flex items-center justify-center rounded-xl bg-[color:var(--trite-ink)] px-4 py-3 text-sm font-bold text-white hover:bg-black transition-all active:scale-[0.98]"
                          >
                            Apply Range
                          </button>
                        </div>
                        {/* iOS safe-area spacer */}
                        <div className="h-6" />
                      </div>

                      {/* Desktop/tablet: absolute dropdown */}
                      <div className="hidden sm:flex absolute left-0 mt-2 z-50 w-[460px] rounded-2xl border border-black/10 bg-slate-50 p-5 shadow-xl ring-1 ring-black/5 flex-row gap-4">
                        <div className="w-[155px] flex flex-col gap-1 border-r border-black/5 pr-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-2">Presets</p>
                          <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto">
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
                              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1" htmlFor="start-date-input">Start Date</label>
                              <input
                                id="start-date-input"
                                type="date"
                                value={startDateInput}
                                onChange={(e) => setStartDateInput(e.target.value)}
                                className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1" htmlFor="end-date-input">End Date</label>
                              <input
                                id="end-date-input"
                                type="date"
                                value={endDateInput}
                                onChange={(e) => setEndDateInput(e.target.value)}
                                className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleApplyCustom}
                              className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-[color:var(--trite-ink)] px-4 py-2 text-xs font-bold text-white hover:bg-black transition-all active:scale-[0.98]"
                            >
                              Apply Custom Range
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                />
                <FilterChip
                  label="Settled"
                  active={statusFilter === "SETTLED"}
                  onClick={() => setStatusFilter("SETTLED")}
                  variant="success"
                />
                <FilterChip
                  label="Authorized"
                  active={statusFilter === "AUTHORIZED"}
                  onClick={() => setStatusFilter("AUTHORIZED")}
                  variant="neutral"
                />
                <FilterChip
                  label="Failed"
                  active={statusFilter === "FAILED"}
                  onClick={() => setStatusFilter("FAILED")}
                  variant="danger"
                />
                <FilterChip
                  label="Cancelled"
                  active={statusFilter === "CANCELLED"}
                  onClick={() => setStatusFilter("CANCELLED")}
                  variant="neutral"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-black/5 text-left">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Date
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Transaction
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Customer
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Method
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Status
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((tx) => {
                    const d = new Date(tx.created_at);
                    return (
                    <tr
                      key={tx.id}
                      onClick={() => setDetailTxId(tx.id)}
                      className="border-b border-black/5 last:border-b-0 hover:bg-black/[0.02] cursor-pointer"
                    >
                      <td className="py-4 whitespace-nowrap">
                        <div className="font-medium text-[color:var(--trite-ink)]">
                          {d.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-[10px] text-[color:var(--trite-muted)]">
                          {d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })} UTC
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-[color:var(--trite-ink)]">{tx.tx_id_display}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--trite-ink)] text-xs font-semibold text-white">
                            {tx.payer_email ? tx.payer_email.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="font-medium text-[color:var(--trite-ink)]">{tx.payer_email || "Anonymous"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon method={tx.method} />
                          <span className="text-[color:var(--trite-muted)]">{tx.method}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-4 text-right font-semibold text-[color:var(--trite-ink)]">
                        {formatGHS(Number(tx.amount))}
                      </td>
                    </tr>
                  )})}
                  {transactions.length === 0 && !loading && (
                    <tr>
                      <td className="py-16 text-center" colSpan={6}>
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04]">
                            <svg className="h-6 w-6 text-[color:var(--trite-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <div className="text-sm font-medium text-[color:var(--trite-ink)]">No transactions found</div>
                          <div className="text-xs text-[color:var(--trite-muted)]">Try adjusting your filters or date range</div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {loading && Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-black/5">
                      <td className="py-4"><div className="h-4 w-24 animate-pulse rounded-md bg-black/[0.06]" /></td>
                      <td className="py-4"><div className="h-4 w-32 animate-pulse rounded-md bg-black/[0.06]" /></td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 animate-pulse rounded-full bg-black/[0.06]" />
                          <div className="h-4 w-28 animate-pulse rounded-md bg-black/[0.06]" />
                        </div>
                      </td>
                      <td className="py-4"><div className="h-4 w-20 animate-pulse rounded-md bg-black/[0.06]" /></td>
                      <td className="py-4"><div className="h-5 w-16 animate-pulse rounded-full bg-black/[0.06]" /></td>
                      <td className="py-4 text-right"><div className="ml-auto h-4 w-16 animate-pulse rounded-md bg-black/[0.06]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-[color:var(--trite-muted)]">
                  Showing {transactions.length} of {pagination.total} transactions
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-medium text-[color:var(--trite-ink)]">
                    Page {page} of {pagination.total_pages || 1}
                  </span>
                  <button 
                    disabled={page >= pagination.total_pages}
                    onClick={() => setPage(page + 1)}
                    className="flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-[color:var(--trite-lime)] p-6 ring-1 ring-black/5 flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-white/80">
                  {dominantMethod ? `${dominantMethod.name.replace("_", " ")} Dominance` : "Dominance Intelligence"}
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {dominantMethod ? `${dominantMethod.percent}% of active transactions` : "Processing Data..."}
                </div>
                <p className="mt-2 text-xs leading-5 text-white/80">
                  Preferred payment method aggregated across all completed and requested orders locally.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <BarChartIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
              <div className="text-lg font-semibold">Payment Method Mix</div>
              <div className="mt-1 text-xs text-white/60">Distribution by transaction count</div>
              <div className="mt-6 space-y-4">
                {stats.method_mix.map((method) => (
                    <div key={method.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">{method.name}</span>
                        <span className="font-semibold">{method.percent}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div className={`h-2 rounded-full ${method.color}`} style={{ width: `${method.percent}%` }} />
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      <TransactionDetailModal
        txId={detailTxId}
        endpointBase="/api/merchant/transactions"
        onClose={() => setDetailTxId(null)}
      />
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  variant = "default",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "success" | "danger" | "neutral" | "warning";
}) {
  const activeStyles = {
    default: "bg-[color:var(--trite-ink)] text-white",
    success: "bg-[color:var(--trite-lime-strong)] text-white",
    danger: "bg-red-500 text-white",
    neutral: "bg-blue-500 text-white",
    warning: "bg-amber-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-semibold transition-colors ${
        active ? activeStyles[variant] : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-100 text-gray-700";
  if (status === "SETTLED" || status === "CAPTURED" || status === "PARTIALLY_CAPTURED") color = "bg-[color:var(--trite-lime)] text-white";
  else if (status === "AUTHORIZED" || status === "AUTHENTICATED" || status === "INITIATED" || status === "PENDING_AUTH" || status === "PENDING_SETTLEMENT") color = "bg-yellow-100 text-yellow-700";
  else if (status === "FAILED") color = "bg-red-50 text-red-600";
  else if (status === "CANCELLED" || status === "REVERSED" || status === "EXPIRED") color = "bg-gray-100 text-gray-500";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

function MethodIcon({ method }: { method: string }) {
  if (method === "MOBILE_MONEY") return <SmartphoneIcon className="h-4 w-4 text-[color:var(--trite-lime-strong)]" />;
  if (method === "CARD") return <CreditCardIcon className="h-4 w-4 text-blue-500" />;
  if (method === "BANK_TRANSFER") return <BankIcon className="h-4 w-4 text-purple-500" />;
  return <CoinIcon className="h-4 w-4 text-orange-500" />;
}

const formatGHS = (amount: number) => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
};

function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 6l7-4 7 4" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v3" />
      <path d="M12 14v3" />
      <path d="M16 14v3" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
