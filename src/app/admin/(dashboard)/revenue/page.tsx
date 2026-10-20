"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { AdminPermissionGuard } from "@/components/admin/AdminPermissionGuard";
import {
  TrendingUp,
  Receipt,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Loader2,
} from "lucide-react";

type RevenueGraphItem = {
  date: string;
  label: string;
  day_name: string;
  amount: number;
};

type TopMerchant = {
  merchant_id: string;
  business_name: string | null;
  merchant_display_id: string | null;
  merchant_tier: string | null;
  user_id: string | null;
  total_fees: number;
  fee_count: number;
  waived_fees: number;
  waived_count: number;
  last_fee_at: string | null;
};

type RevenueData = {
  total_revenue: number;
  total_fees_charged: number;
  total_waived: number;
  revenue_last_24h: number;
  revenue_last_30d: number;
  by_type: Array<{ fee_type: string; total: number; count: number }>;
  revenue_graph: RevenueGraphItem[];
  top_merchants: TopMerchant[];
  recent_fees?: Array<{
    id: string;
    fee_type: string;
    amount: number | null;
    currency: string;
    is_waived: boolean;
    created_at: string;
    business_name: string | null;
    merchant_display_id: string | null;
  }>;
};

type MerchantFeeItem = {
  id: string;
  fee_type: string;
  amount: number;
  currency: string;
  is_waived: boolean;
  waiver_reason: string | null;
  flat_amount_applied: number | null;
  percentage_rate_applied: number | null;
  basis_amount: number | null;
  created_at: string;
  transaction_id: string | null;
  tx_id_display: string | null;
  settlement_id: string | null;
  settlement_id_display: string | null;
};

type MerchantFeesResponse = {
  merchant: {
    id: string;
    business_name: string | null;
    merchant_display_id: string | null;
    merchant_tier: string | null;
    user_id: string | null;
    total_fees: number;
    fee_count: number;
    waived_fees: number;
    waived_count: number;
  };
  fees: MerchantFeeItem[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
};

const FEE_TYPES = [
  { value: "ALL", label: "All Fee Types" },
  { value: "PAYMENT_PROCESSING", label: "Payment Processing" },
  { value: "PAYMENT_GATEWAY", label: "Payment Gateway" },
  { value: "CROSS_BORDER", label: "Cross Border" },
  { value: "CRYPTO_NETWORK_GAS", label: "Crypto Gas" },
  { value: "THREE_DS_AUTH", label: "3DS Auth" },
  { value: "CHARGEBACK", label: "Chargeback" },
  { value: "REFUND_PROCESSING", label: "Refund Processing" },
  { value: "SETTLEMENT_TRANSFER", label: "Settlement Transfer" },
  { value: "SETTLEMENT_FX", label: "Settlement FX" },
  { value: "EARLY_SETTLEMENT", label: "Early Settlement" },
  { value: "SETTLEMENT_MINIMUM_SHORTFALL", label: "Settlement Shortfall" },
  { value: "MONTHLY_PLATFORM", label: "Monthly Platform" },
  { value: "API_CALL_OVERAGE", label: "API Overage" },
  { value: "DISPUTE_MANAGEMENT", label: "Dispute Management" },
  { value: "KYC_VERIFICATION", label: "KYC Verification" },
];

const formatGHS = (n: number | null | undefined) =>
  `GH₵${(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const prettyFeeType = (t: string) =>
  t
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function AdminRevenuePage() {
  const { data: rev, loading } = useAdminFetch<RevenueData>("/api/admin/revenue");
  const [selectedMerchant, setSelectedMerchant] = useState<TopMerchant | null>(null);

  const graphData = rev?.revenue_graph ?? [];
  const maxGraphValue = Math.max(...graphData.map((d) => d.amount), 1);
  const byTypeMax = Math.max(...(rev?.by_type ?? []).map((r) => r.total), 1);
  const topMerchants = rev?.top_merchants ?? [];

  const stats = [
    {
      label: "Total Revenue (All Time)",
      value: rev ? formatGHS(rev.total_revenue) : "—",
      sub: `${rev?.total_fees_charged ?? 0} fees charged`,
    },
    {
      label: "Last 30 Days",
      value: rev ? formatGHS(rev.revenue_last_30d) : "—",
      sub: "Rolling window",
    },
    {
      label: "Last 24 Hours",
      value: rev ? formatGHS(rev.revenue_last_24h) : "—",
      sub: "Intra-day earnings",
    },
    {
      label: "Revenue Waived",
      value: rev ? formatGHS(rev.total_waived) : "—",
      sub: "Given up via waivers",
      muted: true,
    },
  ];

  return (
    <AdminPermissionGuard requiredPermission="settlement-monitoring">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Platform Revenue</h1>
        <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">
          Institutional earnings the platform has generated from processing, settlement, and service fees.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--trite-muted)]">
              {stat.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-semibold ${
                  stat.muted ? "text-[color:var(--trite-muted)]" : "text-[color:var(--trite-ink)]"
                }`}
              >
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left - Trend + Top Merchants */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue Trend */}
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[color:var(--trite-lime-strong)]" />
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Revenue Trend</h2>
                  <p className="text-xs text-[color:var(--trite-muted)]">
                    Daily fee earnings earned over the last 12 days
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-medium text-[color:var(--trite-muted)] uppercase tracking-wider">
                  12-Day Total
                </span>
                <p className="text-sm font-semibold text-[color:var(--trite-ink)]">
                  {formatGHS(graphData.reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                </p>
              </div>
            </div>

            {/* Chart Area with Baseline and Dates on X-Axis */}
            <div className="rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 p-4 pt-8">
              <div className="flex h-44 items-end gap-1.5 border-b border-black/10 pb-2 sm:gap-2">
                {graphData.map((item, i) => {
                  const val = item.amount || 0;
                  const heightPercent = maxGraphValue > 0 ? (val / maxGraphValue) * 100 : 0;
                  const isToday = i === graphData.length - 1;

                  return (
                    <div
                      key={item.date || i}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end"
                    >
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-11 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100">
                        <span className="text-[10px] font-medium text-white/70">
                          {item.date
                            ? new Date(item.date).toLocaleDateString("en-GH", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            : item.label}
                        </span>
                        <span className="font-bold text-[color:var(--trite-lime)]">{formatGHS(val)}</span>
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full rounded-t transition-all duration-200 ${
                          val > 0
                            ? "bg-[color:var(--trite-lime-strong)] hover:bg-[color:var(--trite-lime-strong)]/90"
                            : "bg-black/5 hover:bg-black/10"
                        }`}
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Dates */}
              <div className="flex gap-1.5 pt-2.5 sm:gap-2">
                {graphData.map((item, i) => {
                  const isToday = i === graphData.length - 1;
                  return (
                    <div key={item.date || i} className="flex-1 overflow-hidden text-center">
                      <p
                        className={`truncate text-[10px] font-medium leading-tight ${
                          isToday
                            ? "font-bold text-[color:var(--trite-lime-strong)]"
                            : "text-[color:var(--trite-muted)]"
                        }`}
                        title={item.label}
                      >
                        {isToday ? "Today" : item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Merchants by Fee Revenue */}
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Top Merchants</h2>
                <p className="text-xs text-[color:var(--trite-muted)]">
                  Merchants ranked by total fee revenue generated for the platform
                </p>
              </div>
              <span className="text-xs font-medium text-[color:var(--trite-muted)]">
                {topMerchants.length} {topMerchants.length === 1 ? "merchant" : "merchants"} contributing
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-[10px] uppercase tracking-widest text-[color:var(--trite-muted)]">
                    <th className="w-10 pb-2 font-bold">#</th>
                    <th className="pb-2 font-bold">Merchant</th>
                    <th className="pb-2 text-right font-bold">Total Fees</th>
                    <th className="pb-2 text-center font-bold">Charged Count</th>
                    <th className="pb-2 text-right font-bold">Last Fee Date</th>
                    <th className="pb-2 text-right font-bold">Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {topMerchants.map((merchant, idx) => (
                    <tr key={merchant.merchant_id} className="transition-colors hover:bg-slate-50/70">
                      <td className="py-3.5 pr-2 font-mono text-xs font-semibold text-[color:var(--trite-muted)]">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--trite-lime-strong)]/10 text-xs font-bold text-[color:var(--trite-lime-strong)]">
                            {(merchant.business_name || "M").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[color:var(--trite-ink)]">
                                {merchant.business_name ?? "Unnamed Merchant"}
                              </span>
                              {merchant.merchant_tier && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
                                  {merchant.merchant_tier}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-[color:var(--trite-muted)]">
                              {merchant.merchant_display_id ?? merchant.merchant_id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <span className="font-bold text-[color:var(--trite-ink)]">
                          {formatGHS(merchant.total_fees)}
                        </span>
                        {merchant.waived_fees > 0 && (
                          <p className="text-[10px] text-amber-600">
                            {formatGHS(merchant.waived_fees)} waived
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-center text-xs font-medium text-[color:var(--trite-muted)]">
                        <span className="inline-flex items-center justify-center rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold">
                          {merchant.fee_count}
                        </span>
                      </td>
                      <td className="py-3.5 pl-2 text-right text-xs text-[color:var(--trite-muted)]">
                        {merchant.last_fee_at
                          ? new Date(merchant.last_fee_at).toLocaleDateString("en-GH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedMerchant(merchant)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-[color:var(--trite-ink)] shadow-sm transition-all hover:border-[color:var(--trite-lime-strong)] hover:bg-[color:var(--trite-lime-strong)]/5"
                        >
                          <Receipt className="h-3.5 w-3.5 text-[color:var(--trite-lime-strong)]" />
                          <span>View Fees</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {topMerchants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-[color:var(--trite-muted)]">
                        {loading ? "Loading top merchants..." : "No merchant fee records found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right - Breakdown by fee type */}
        <div className="space-y-6">
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-[color:var(--trite-ink)]">Revenue by Fee Type</h2>
            <div className="space-y-4">
              {(rev?.by_type ?? []).map((row) => (
                <div key={row.fee_type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[color:var(--trite-ink)]">{prettyFeeType(row.fee_type)}</span>
                    <span className="font-medium text-[color:var(--trite-ink)]">{formatGHS(row.total)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-[color:var(--trite-lime-strong)]"
                      style={{ width: `${Math.max((row.total / byTypeMax) * 100, 2)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[color:var(--trite-muted)]">
                    {row.count} fee{row.count === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
              {rev && rev.by_type.length === 0 && (
                <p className="text-sm text-[color:var(--trite-muted)]">No revenue recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Fee Details Modal */}
      {selectedMerchant && (
        <MerchantFeesModal
          merchant={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
        />
      )}
    </AdminPermissionGuard>
  );
}

function MerchantFeesModal({
  merchant,
  onClose,
}: {
  merchant: TopMerchant;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const [feeType, setFeeType] = useState("ALL");

  // This ledger view shows only fees actually charged (revenue). Waived fees
  // are excluded, so there is no status filter.
  const queryParams = {
    page: String(page),
    limit: "10",
    fee_type: feeType,
    status: "CHARGED",
  };

  const { data, loading } = useAdminFetch<MerchantFeesResponse>(
    `/api/admin/revenue/merchants/${merchant.merchant_id}/fees`,
    queryParams
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fees = data?.fees ?? [];
  const pagination = data?.pagination;
  const merchantInfo = data?.merchant ?? merchant;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-black/5 bg-slate-50/50 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--trite-lime-strong)]/10 text-base font-bold text-[color:var(--trite-lime-strong)]">
                {(merchant.business_name || "M").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[color:var(--trite-ink)] sm:text-xl">
                    {merchant.business_name ?? "Merchant Fee Ledger"}
                  </h2>
                  {merchant.merchant_tier && (
                    <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                      {merchant.merchant_tier}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-[color:var(--trite-muted)] font-mono">
                  <span>ID: {merchant.merchant_display_id ?? merchant.merchant_id}</span>
                  {merchant.user_id && (
                    <Link
                      href={`/admin/merchants/${merchant.user_id}`}
                      className="inline-flex items-center gap-1 font-sans text-blue-600 hover:underline font-medium"
                    >
                      <span>Merchant Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[color:var(--trite-muted)] hover:bg-black/5 hover:text-[color:var(--trite-ink)] transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-black/5 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">
                Total Fees Paid
              </p>
              <p className="mt-1 text-base font-bold text-[color:var(--trite-ink)]">
                {formatGHS(merchantInfo.total_fees)}
              </p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">
                Fees Charged Count
              </p>
              <p className="mt-1 text-base font-bold text-[color:var(--trite-ink)]">
                {merchantInfo.fee_count}
              </p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">
                Waived Amount
              </p>
              <p className="mt-1 text-base font-bold text-amber-600">
                {formatGHS(merchantInfo.waived_fees)}
              </p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">
                Waived Count
              </p>
              <p className="mt-1 text-base font-bold text-[color:var(--trite-muted)]">
                {merchantInfo.waived_count ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-3 sm:px-6 bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--trite-muted)]">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Fee Type Filter */}
            <select
              value={feeType}
              onChange={(e) => {
                setFeeType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-black/10 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[color:var(--trite-ink)] focus:outline-none focus:ring-1 focus:ring-[color:var(--trite-lime-strong)]"
            >
              {FEE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {pagination && (
            <span className="text-xs text-[color:var(--trite-muted)]">
              Showing {fees.length} of {pagination.total_count} records
            </span>
          )}
        </div>

        {/* Table Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 min-h-[300px]">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-[color:var(--trite-muted)]">
              <Loader2 className="h-6 w-6 animate-spin text-[color:var(--trite-lime-strong)]" />
              <p className="text-xs">Loading fee ledger records...</p>
            </div>
          ) : fees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-[10px] uppercase tracking-widest text-[color:var(--trite-muted)]">
                    <th className="pb-2 font-bold">Fee Type</th>
                    <th className="pb-2 font-bold">Reference / Entity</th>
                    <th className="pb-2 font-bold">Rate Calculation</th>
                    <th className="pb-2 text-right font-bold">Amount</th>
                    <th className="pb-2 text-right font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-2">
                        <span className="font-semibold text-[color:var(--trite-ink)]">
                          {prettyFeeType(fee.fee_type)}
                        </span>
                        <p className="font-mono text-[10px] text-[color:var(--trite-muted)]">
                          {fee.id.slice(0, 8)}...
                        </p>
                      </td>
                      <td className="py-3 pr-2">
                        {fee.tx_id_display ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {fee.tx_id_display}
                          </span>
                        ) : fee.settlement_id_display ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {fee.settlement_id_display}
                          </span>
                        ) : (
                          <span className="text-xs text-[color:var(--trite-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-xs text-[color:var(--trite-muted)]">
                        {fee.percentage_rate_applied != null || fee.flat_amount_applied != null ? (
                          <span>
                            {fee.percentage_rate_applied != null && `${fee.percentage_rate_applied}%`}
                            {fee.percentage_rate_applied != null && fee.flat_amount_applied != null && " + "}
                            {fee.flat_amount_applied != null && formatGHS(fee.flat_amount_applied)}
                            {fee.basis_amount != null && ` on ${formatGHS(fee.basis_amount)}`}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <span className="font-bold text-[color:var(--trite-ink)]">
                          {formatGHS(fee.amount)}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right text-xs text-[color:var(--trite-muted)]">
                        <div>
                          {new Date(fee.created_at).toLocaleDateString("en-GH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] opacity-75">
                          {new Date(fee.created_at).toLocaleTimeString("en-GH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-1 text-[color:var(--trite-muted)]">
              <Receipt className="h-8 w-8 text-black/20" />
              <p className="text-sm font-medium">No fee records found</p>
              <p className="text-xs">Try adjusting the filter options above.</p>
            </div>
          )}
        </div>

        {/* Modal Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/5 bg-slate-50/50 p-4 sm:px-6">
          <div className="text-xs text-[color:var(--trite-muted)]">
            {pagination ? (
              <span>
                Page <span className="font-semibold text-[color:var(--trite-ink)]">{pagination.page}</span> of{" "}
                <span className="font-semibold text-[color:var(--trite-ink)]">{pagination.total_pages}</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--trite-ink)] shadow-sm hover:bg-black/5 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => (pagination && p < pagination.total_pages ? p + 1 : p))}
              disabled={!pagination || page >= pagination.total_pages || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--trite-ink)] shadow-sm hover:bg-black/5 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-lg bg-[color:var(--trite-ink)] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-black/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
