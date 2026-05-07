"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  Download,
  Filter,
  MoreVertical,
} from "lucide-react";

type DashboardData = {
  total_platform_volume: number;
  active_merchants: number;
  system_uptime: string;
  liquidity_inbound: number;
  liquidity_outbound: number;
  security_alerts: number;
  recent_transactions: Array<{ id: string; tx_id_display: string; merchant_id: string; amount: number; method: string; status: string; gateway_node: string | null }>;
  liquidity_graph?: number[];
};
type KycStats = { stats: { by_status: Array<{ status: string; count: string }> } };
type AnalyticsData = { regional_performance: Array<{ region: string; percentage: number; volume: number }> };

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState("24H");

  const { data: dash } = useAdminFetch<DashboardData>("/api/admin/dashboard");
  const { data: kyc } = useAdminFetch<KycStats>("/api/admin/kyc", { per_page: "1" });
  const { data: analytics } = useAdminFetch<AnalyticsData>("/api/admin/analytics");

  const pendingKyc = kyc?.stats?.by_status?.find((s) => s.status === "PENDING")?.count ?? "—";
  const formatGHS = (n: number) => `GH₵${n.toLocaleString("en-GH", { minimumFractionDigits: 0 })}`;

  const stats = [
    { label: "Total Platform Volume", value: dash ? formatGHS(dash.total_platform_volume) : "—", sub: "+12.4% vs LY" },
    { label: "Active Merchants", value: dash ? dash.active_merchants.toLocaleString() : "—", sub: "Direct Institutional Access" },
    { label: "KYC Pending Review", value: String(pendingKyc), sub: "⚠ Action Required", alert: true },
    { label: "System Uptime", value: dash?.system_uptime ?? "—", sub: "● Operational" },
  ];

  const recentActivity = dash?.recent_transactions ?? [];
  const regionalPerformance = analytics?.regional_performance ?? [];
  
  // Calculate max for graph scaling
  const graphData = dash?.liquidity_graph ?? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const maxGraphValue = Math.max(...graphData, 1);

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Oversight</h1>
        <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">Real-time platform performance and security metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${stat.alert ? "text-red-500" : "text-[color:var(--trite-ink)]"}`}>
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left Column - Liquidity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Global Liquidity Monitoring</h2>
                <p className="text-xs text-[color:var(--trite-muted)]">Intra-day flow across multi-currency gateways</p>
              </div>
              <div className="flex gap-2">
                {["24H", "7D", "1M"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      timeFilter === filter
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-black/5 text-[color:var(--trite-muted)] hover:bg-black/10"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
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
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">INBOUND</p>
                  <p className="text-xl font-bold text-[color:var(--trite-ink)]">{dash ? formatGHS(dash.liquidity_inbound) : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">OUTBOUND</p>
                  <p className="text-xl font-bold text-[color:var(--trite-ink)]">{dash ? formatGHS(dash.liquidity_outbound) : "—"}</p>
                </div>
              </div>
              <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-6 py-3 text-sm font-semibold text-white hover:bg-black transition-colors">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
 
          {/* Recent Activity Table */}
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[color:var(--trite-ink)]">Activity</h2>
                <p className="text-xs text-[color:var(--trite-muted)] mt-1">Latest platform-wide transaction flow</p>
              </div>
              <div className="flex gap-2">
                <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>
            <div className="-mx-5 overflow-x-auto px-5">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-black/5 text-left text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-wider">
                    <th className="pb-4 pr-4">Merchant Entity</th>
                    <th className="pb-4 pr-4">Type</th>
                    <th className="pb-4 pr-4">Volume (GHS)</th>
                    <th className="pb-4 pr-4">Node</th>
                    <th className="pb-4 pr-4">Status</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-sm text-[color:var(--trite-ink)]">
                  {recentActivity.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--trite-lime)]/30 font-bold text-[color:var(--trite-ink)]">
                            {tx.method.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{tx.tx_id_display}</p>
                            <p className="text-[10px] text-[color:var(--trite-muted)] uppercase tracking-tight">ID: {tx.merchant_id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-xs font-medium text-[color:var(--trite-muted)]">{tx.method}</td>
                      <td className="py-4 pr-4 font-bold">{formatGHS(tx.amount)}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{tx.gateway_node ?? "DEFAULT"}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700" :
                          tx.status === "PENDING" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            tx.status === "SUCCESS" ? "bg-emerald-500" :
                            tx.status === "PENDING" ? "bg-blue-500" : "bg-amber-500"
                          }`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="rounded-lg p-2 text-[color:var(--trite-muted)] hover:bg-black/5 hover:text-[color:var(--trite-ink)] transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-6 w-full rounded-xl bg-black/5 py-3 text-sm font-bold text-[color:var(--trite-muted)] hover:bg-black/10 hover:text-[color:var(--trite-ink)] transition-all">
              View All Transactions
            </button>
          </div>
        </div>

        {/* Right Column - Security & Performance */}
        <div className="space-y-6">
          {/* Security Alerts */}
          <div className="rounded-xl bg-[color:var(--trite-ink)] p-5 text-white">
            <h2 className="mb-4 text-lg font-semibold">Critical Security Alerts</h2>
            <div className="space-y-3">
              {dash && dash.security_alerts > 0 ? (
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-red-400" />
                    <div>
                      <p className="text-sm font-medium">{dash.security_alerts} Flagged Transactions</p>
                      <p className="text-xs text-white/60">Medium or High flag level</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/60">No active alerts</p>
              )}
            </div>
            <button className="mt-4 w-full rounded-xl bg-white/10 py-2 text-sm font-medium hover:bg-white/20">
              View All Incidents
            </button>
          </div>

          {/* Regional Performance */}
          <div className="rounded-xl border border-black/5 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-[color:var(--trite-ink)] uppercase tracking-wide">Regional Performance</h2>
            <div className="space-y-3">
              {regionalPerformance.length > 0 ? regionalPerformance.map((region) => (
                <div key={region.region}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[color:var(--trite-muted)]">{region.region}</span>
                    <span className="font-medium text-[color:var(--trite-ink)]">{region.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5">
                    <div className="h-full rounded-full bg-[color:var(--trite-lime-strong)]" style={{ width: `${region.percentage}%` }} />
                  </div>
                </div>
              )) : <p className="text-xs text-[color:var(--trite-muted)]">No regional data yet</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
