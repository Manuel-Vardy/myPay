"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";


type AnalyticsData = {
  total_revenue: number;
  aov: number;
  conversion_rate: number;
  success_rate: number;
  total_transactions: number;
  method_mix: Record<string, { amount: number; count: number }>;
  revenue_by_region: Record<string, number>;
  revenue_trend: { date: string; amount: number }[];
  prev_total_revenue: number;
  prev_aov: number;
  period: string;
};

type SettlementRow = {
  id: string;
  settlement_id_display: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  status: string;
  date_range_start: string;
  date_range_end: string;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");
  const [period, setPeriod] = useState("30d");

  const { data: analytics } = useMerchantFetch<AnalyticsData>("/api/merchant/analytics", { period });
  const { data: settlementData } = useMerchantFetch<{ data: SettlementRow[] }>("/api/merchant/settlements");
  const settlements = settlementData?.data ?? [];

  // Revenue trend chart geometry (fractions of the chart area, 0..1)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const trend = analytics?.revenue_trend ?? [];
  const trendMax = Math.max(...trend.map((d) => d.amount), 1);
  const trendPoints = trend.map((d, i) => ({
    xf: trend.length > 1 ? i / (trend.length - 1) : 0.5,
    yf: (150 - (d.amount / trendMax) * 140 - 5) / 150,
  }));

  const formatGHS = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Performance Overview
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
                Institutional Analytics
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-black/[0.04] p-1">
                {(["7d", "30d", "90d"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      period === p
                        ? "bg-white text-[color:var(--trite-ink)] shadow-sm"
                        : "text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
                    }`}
                  >
                    {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
                  </button>
                ))}
              </div>
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
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Total Revenue</span>
                {(() => {
                  const change = analytics && analytics.prev_total_revenue > 0
                    ? ((analytics.total_revenue - analytics.prev_total_revenue) / analytics.prev_total_revenue * 100).toFixed(1)
                    : null;
                  return change !== null ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white ${Number(change) >= 0 ? 'bg-[color:var(--trite-lime)]' : 'bg-red-500'}`}>
                      {Number(change) >= 0 ? '+' : ''}{change}%
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {formatGHS(analytics?.total_revenue ?? 0)}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">
                vs previous {period === "7d" ? "7 days" : period === "90d" ? "90 days" : "30 days"}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Avg. Order Value</span>
                {(() => {
                  const change = analytics && analytics.prev_aov > 0
                    ? ((analytics.aov - analytics.prev_aov) / analytics.prev_aov * 100).toFixed(1)
                    : null;
                  return change !== null ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white ${Number(change) >= 0 ? 'bg-[color:var(--trite-lime)]' : 'bg-red-500'}`}>
                      {Number(change) >= 0 ? '+' : ''}{change}%
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {formatGHS(analytics?.aov ?? 0)}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Stable growth</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Conversion Rate</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {analytics ? `${analytics.conversion_rate}%` : "—"}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Optimization needed</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Success Rate</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {analytics ? `${analytics.success_rate}%` : "—"}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Across all gateways</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-[color:var(--trite-ink)]">
                    Revenue Trends
                  </div>
                  <div className="text-xs text-[color:var(--trite-muted)]">
                    Daily processed volume for current month
                  </div>
                </div>
                <span className="text-xs font-medium text-[color:var(--trite-muted)]">
                  {period === "7d" ? "Last 7 Days" : period === "30d" ? "Last 30 Days" : "Last 90 Days"}
                </span>
              </div>
              <div
                className="relative h-48 w-full"
                onMouseMove={(e) => {
                  if (trend.length === 0) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  if (!rect.width) return;
                  const frac = (e.clientX - rect.left) / rect.width;
                  setHoverIdx(Math.min(trend.length - 1, Math.max(0, Math.round(frac * (trend.length - 1)))));
                }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                {analytics && trend.length > 0 ? (
                  <>
                    <svg className="h-full w-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const points = trendPoints.map((p) => ({ x: p.xf * 600, y: p.yf * 150 }));
                        let linePath = `M${points[0].x},${points[0].y}`;
                        for (let i = 1; i < points.length; i++) {
                          const cpx1 = points[i-1].x + (points[i].x - points[i-1].x) / 3;
                          const cpx2 = points[i].x - (points[i].x - points[i-1].x) / 3;
                          linePath += ` C${cpx1},${points[i-1].y} ${cpx2},${points[i].y} ${points[i].x},${points[i].y}`;
                        }
                        const areaPath = `${linePath} L600,150 L0,150 Z`;
                        const lastPoint = points[points.length - 1];
                        return (
                          <>
                            <path d={areaPath} fill="url(#chartGradient)" />
                            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />
                            <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#3b82f6" />
                          </>
                        );
                      })()}
                    </svg>
                    {hoverIdx !== null && trendPoints[hoverIdx] && (
                      <>
                        <div
                          className="pointer-events-none absolute inset-y-0 w-px bg-black/15"
                          style={{ left: `${trendPoints[hoverIdx].xf * 100}%` }}
                        />
                        <div
                          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow"
                          style={{ left: `${trendPoints[hoverIdx].xf * 100}%`, top: `${trendPoints[hoverIdx].yf * 100}%` }}
                        />
                        <div
                          className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--trite-ink)] px-2.5 py-1.5 text-center shadow-lg"
                          style={{
                            left: `${Math.min(85, Math.max(15, trendPoints[hoverIdx].xf * 100))}%`,
                            top: `${Math.max(0, trendPoints[hoverIdx].yf * 100 - 32)}%`,
                          }}
                        >
                          <div className="text-[10px] text-white/70">
                            {new Date(trend[hoverIdx].date).toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                          <div className="text-xs font-semibold text-white">{formatGHS(trend[hoverIdx].amount)}</div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[color:var(--trite-muted)]">
                    No revenue data for this period
                  </div>
                )}
              </div>
              {analytics && analytics.revenue_trend.length > 0 && (
                <div className="mt-4 flex justify-between text-xs text-[color:var(--trite-muted)]">
                  {(() => {
                    const trend = analytics.revenue_trend;
                    const step = Math.max(1, Math.floor(trend.length / 4));
                    const labels: string[] = [];
                    for (let i = 0; i < trend.length; i += step) {
                      labels.push(new Date(trend[i].date).toLocaleDateString("en-GH", { day: "2-digit", month: "short" }));
                    }
                    const lastLabel = new Date(trend[trend.length - 1].date).toLocaleDateString("en-GH", { day: "2-digit", month: "short" });
                    if (labels[labels.length - 1] !== lastLabel) labels.push(lastLabel);
                    return labels.map((l, i) => <span key={i}>{l.toUpperCase()}</span>);
                  })()}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
              <div className="text-lg font-semibold">Method Mix</div>
              <div className="mt-1 text-xs text-white/60">Distribution of incoming funds</div>
              <div className="mt-6 space-y-4">
                {Object.entries(analytics?.method_mix ?? { CARD: { amount: 0, count: 0 }, DIGITAL_WALLET: { amount: 0, count: 0 }, BANK_TRANSFER: { amount: 0, count: 0 } }).map(([method, val]) => {
                  const total = Object.values(analytics?.method_mix ?? {}).reduce((s, v) => s + v.amount, 0);
                  const pct = total > 0 ? Math.round((val.amount / total) * 100) : 0;
                  return (
                    <div key={method}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">{method.replace("_", " ")}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              <button className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300">
                View regional insights
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <div className="mb-4 text-lg font-semibold text-[color:var(--trite-ink)]">
                Top Market Hubs
              </div>
              <div className="space-y-4">
                {Object.entries(analytics?.revenue_by_region ?? {}).length > 0 ? (
                  Object.entries(analytics!.revenue_by_region).map(([region, amount]) => (
                    <div key={region} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-xs font-semibold text-[color:var(--trite-ink)]">
                          {region.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[color:var(--trite-ink)]">{region}</div>
                          <div className="text-xs text-[color:var(--trite-muted)]">{formatGHS(amount)} Volume</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-[color:var(--trite-muted)]">
                    No regional volume for this period yet.
                  </p>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)] animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    Live Monitoring Active
                  </span>
                </div>
                <div className="mt-4 text-xl font-semibold">Real-time Gateway Health</div>
                <p className="mt-2 text-xs leading-5 text-white/60">
                  Current latency across global endpoints at &lt;42 ms. All nodes operational. Fraud detection
                  screening 100% of incoming traffic.
                </p>
                <div className="mt-6 flex gap-3">
                  <div className="rounded-lg bg-white/10 px-4 py-3">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">Healthy Nodes</div>
                  </div>
                  <div className="rounded-lg bg-white/10 px-4 py-3">
                    <div className="text-2xl font-bold">418</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">TPS Capacity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">
                Settlement Reports
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:underline">
                View all schedules
              </button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Settlement ID
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Date Range
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Gross Amount
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Fees
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Status
                  </th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="text-sm">
                {settlements.map((s) => (
                  <tr key={s.id} className="border-b border-black/5 last:border-b-0">
                    <td className="py-4 font-medium text-[color:var(--trite-ink)]">{s.settlement_id_display}</td>
                    <td className="py-4 text-[color:var(--trite-muted)]">
                      {new Date(s.date_range_start).toLocaleDateString("en-GH", { month: "short", day: "numeric" })} –{" "}
                      {new Date(s.date_range_end).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-4 font-medium text-[color:var(--trite-ink)]">{formatGHS(s.gross_amount)}</td>
                    <td className="py-4 text-red-600">-{formatGHS(s.fees)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.status === "COMPLETED" ? "bg-[color:var(--trite-lime)] text-white" : "bg-blue-50 text-blue-600"
                      }`}>
                        {s.status === "COMPLETED" && <CheckIcon className="h-3 w-3" />}
                        {s.status === "PENDING" && <ClockIcon className="h-3 w-3" />}
                        {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
    </>
  );
}

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

function CustomersIcon({ className }: { className?: string }) {
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
