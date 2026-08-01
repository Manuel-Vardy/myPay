"use client";

import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { TrendingUp } from "lucide-react";

type RevenueData = {
  total_revenue: number;
  total_fees_charged: number;
  total_waived: number;
  revenue_last_24h: number;
  revenue_last_30d: number;
  by_type: Array<{ fee_type: string; total: number; count: number }>;
  revenue_graph: number[];
  recent_fees: Array<{
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

const formatGHS = (n: number) =>
  `GH₵${(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const prettyFeeType = (t: string) =>
  t
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function AdminRevenuePage() {
  const { data: rev } = useAdminFetch<RevenueData>("/api/admin/revenue");

  const graphData = rev?.revenue_graph ?? Array(12).fill(0);
  const maxGraphValue = Math.max(...graphData, 1);
  const byTypeMax = Math.max(...(rev?.by_type ?? []).map((r) => r.total), 1);

  const stats = [
    { label: "Total Revenue (All Time)", value: rev ? formatGHS(rev.total_revenue) : "—", sub: `${rev?.total_fees_charged ?? 0} fees charged` },
    { label: "Last 30 Days", value: rev ? formatGHS(rev.revenue_last_30d) : "—", sub: "Rolling window" },
    { label: "Last 24 Hours", value: rev ? formatGHS(rev.revenue_last_24h) : "—", sub: "Intra-day earnings" },
    { label: "Revenue Waived", value: rev ? formatGHS(rev.total_waived) : "—", sub: "Given up via waivers", muted: true },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Platform Revenue</h1>
        <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">
          Earnings the platform has generated from processing, settlement, and service fees.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${stat.muted ? "text-[color:var(--trite-muted)]" : "text-[color:var(--trite-ink)]"}`}>
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left - Trend + Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Trend */}
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[color:var(--trite-lime-strong)]" />
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Revenue Trend</h2>
                <p className="text-xs text-[color:var(--trite-muted)]">Fees earned over the last 12 days</p>
              </div>
            </div>
            <div className="h-48 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-end gap-1 px-4 pb-4 pt-8 overflow-hidden">
              {graphData.map((val, i) => (
                <div key={i} className="flex-1 relative group h-full flex items-end">
                  <div
                    className="w-full rounded-t bg-[color:var(--trite-lime-strong)]/80 hover:bg-[color:var(--trite-lime-strong)] transition-colors"
                    style={{ height: `${Math.max((val / maxGraphValue) * 100, 4)}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap transition-opacity z-10">
                    {formatGHS(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Fees */}
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-[color:var(--trite-ink)]">Recent Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-[10px] uppercase tracking-widest text-[color:var(--trite-muted)]">
                    <th className="pb-2 font-bold">Fee Type</th>
                    <th className="pb-2 font-bold">Merchant</th>
                    <th className="pb-2 font-bold text-right">Amount</th>
                    <th className="pb-2 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(rev?.recent_fees ?? []).map((fee) => (
                    <tr key={fee.id} className="border-b border-black/5 last:border-0">
                      <td className="py-3 pr-2 text-[color:var(--trite-ink)]">{prettyFeeType(fee.fee_type)}</td>
                      <td className="py-3 pr-2 text-[color:var(--trite-muted)]">
                        {fee.business_name ?? fee.merchant_display_id ?? "—"}
                      </td>
                      <td className={`py-3 pl-2 text-right font-medium ${fee.is_waived ? "text-[color:var(--trite-muted)] line-through" : "text-[color:var(--trite-ink)]"}`}>
                        {formatGHS(fee.amount ?? 0)}
                      </td>
                      <td className="py-3 pl-2 text-right text-[color:var(--trite-muted)]">
                        {new Date(fee.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {rev && rev.recent_fees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[color:var(--trite-muted)]">
                        No fees recorded yet.
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
                  <p className="mt-1 text-[10px] text-[color:var(--trite-muted)]">{row.count} fee{row.count === 1 ? "" : "s"}</p>
                </div>
              ))}
              {rev && rev.by_type.length === 0 && (
                <p className="text-sm text-[color:var(--trite-muted)]">No revenue recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
