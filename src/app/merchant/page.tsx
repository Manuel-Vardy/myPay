"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";
import { HUBS } from "@/constants/hubs";
import { useEffect } from "react";



type DashboardData = {
  available_balance: number;
  balance_currency: string;
  daily_volume: number;
  total_transactions: number;
  gateway_health: "OPERATIONAL" | "DEGRADED" | "DOWN";
  merchant: { business_name: string; merchant_display_id: string; tier: string };
  stablecoin_holdings: { USDC: number; USDT: number; Total: number };
  revenue_chart: {
    day: { label: string; value: number }[];
    week: { label: string; value: number }[];
    month: { label: string; value: number }[];
    year: { label: string; value: number }[];
  };
};

type TxRow = {
  id: string;
  tx_id_display: string;
  method: string;
  status: string;
  amount: number;
  created_at: string;
};

type SettlementRow = {
  id: string;
  settlement_id_display: string;
  gross_amount: number;
  fees: number;
  method: string;
  net_amount: number;
  status: string;
  date_range_start: string;
  date_range_end: string;
};

const formatGHS = (amount: number) => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [txFilter, setTxFilter] = useState<"all" | "fiat" | "stablecoin" | "crypto">("all");
  const [txStatus, setTxStatus] = useState<"all" | "success" | "pending" | "failed">("all");
  const [txSearch, setTxSearch] = useState("");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [chartPeriod, setChartPeriod] = useState<"day" | "week" | "month" | "year">("week");
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("");
  const [convertFrom, setConvertFrom] = useState<"USDC" | "USDT">("USDC");

  const { data: dashData } = useMerchantFetch<DashboardData>("/api/merchant/dashboard");
  const { data: txData } = useMerchantFetch<{ data: TxRow[] }>("/api/merchant/transactions", { per_page: "5" });
  const { data: settlementData } = useMerchantFetch<{ data: SettlementRow[] }>("/api/merchant/settlements");

  const transactions = txData?.data ?? [];

  return (
    <>
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--trite-ink)]">
              Welcome back, Merchant.
            </h1>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Your institutional portal is ready. Global markets are stable, and your
              transaction success rate is currently exceeding the 98th percentile.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                      Available Institutional Balance
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold sm:text-4xl">{formatGHS(dashData?.available_balance ?? 0)}</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <WalletIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-600"
                    type="button"
                  >
                    Withdraw Funds
                  </button>
                  <button
                    onClick={() => router.push("/merchant/transactions")}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
                    type="button"
                  >
                    View Transactions
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[color:var(--trite-ink)] p-6 text-white ring-1 ring-black/10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-white/80">Settlement Status</div>
                    <div className="mt-2 text-2xl font-bold">Next: Today 18:00</div>
                    <p className="mt-2 text-xs leading-5 text-white/80">
                      Auto-settlement to GCB Bank account ending in 4421. Expected: {formatGHS(dashData ? Math.max(0, dashData.available_balance * 0.985) : 0)}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <HistoryIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <button 
                  onClick={() => router.push("/merchant/settlements")}
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[color:var(--trite-lime)] px-4 text-xs font-semibold text-white hover:bg-[color:var(--trite-lime-strong)]"
                >
                  Manage Settlements
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Stablecoin Balance Card */}
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 p-5 ring-1 ring-green-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-green-800">
                    Stablecoin Holdings
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <CoinIcon className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700">USDC</span>
                    <span className="text-sm font-semibold text-green-900">
                      ${(dashData?.stablecoin_holdings?.USDC ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700">USDT</span>
                    <span className="text-sm font-semibold text-green-900">
                      ${(dashData?.stablecoin_holdings?.USDT ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="mt-2 border-t border-green-200 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-800">Total</span>
                      <span className="text-lg font-semibold text-green-900">
                        ${(dashData?.stablecoin_holdings?.Total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setConvertModalOpen(true)}
                    className="flex-1 rounded-lg bg-green-600 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Convert to GHS
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[color:var(--trite-muted)]">
                    Daily Volume
                  </div>
                  <span className="text-xs font-semibold text-[color:var(--trite-lime-strong)]">
                    +10.4%
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                  {formatGHS(dashData?.daily_volume ?? 0)}
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-black/[0.04]">
                  <div className="h-2 w-3/4 rounded-full bg-blue-500" />
                </div>
                <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Last 24h</div>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[color:var(--trite-muted)]">
                    Success Rate
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--trite-lime)]">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-[color:var(--trite-ink)]">
                    {dashData?.gateway_health ?? "—"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[color:var(--trite-muted)]">
                  Stability detected
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5">
            {/* Enhanced Filters */}
            <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-black/10 px-3 py-1.5 focus-within:border-[color:var(--trite-lime-strong)]">
                <SearchIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full text-sm text-gray-900 outline-none"
                />
              </div>
              <select
                value={txFilter}
                onChange={(e) => setTxFilter(e.target.value as any)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
              >
                <option value="all">All Currencies</option>
                <option value="fiat">Fiat (GHS)</option>
                <option value="stablecoin">Stablecoins (USDC/USDT)</option>
                <option value="crypto">Crypto (BTC)</option>
              </select>
              <select
                value={txStatus}
                onChange={(e) => setTxStatus(e.target.value as any)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-[color:var(--trite-lime-strong)]"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">
                Recent Transactions
              </h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Date & Time
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Transaction ID
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
                {transactions
                  .filter((tx) => {
                    if (txSearch && !tx.tx_id_display.toLowerCase().includes(txSearch.toLowerCase()) &&
                        !tx.method.toLowerCase().includes(txSearch.toLowerCase())) return false;
                    if (txFilter === "stablecoin" && tx.method !== "CRYPTO" && tx.method !== "DIGITAL_WALLET") return false;
                    if (txFilter === "fiat" && (tx.method === "CRYPTO" || tx.method === "DIGITAL_WALLET")) return false;
                    if (txFilter === "crypto" && tx.method !== "CRYPTO") return false;
                    if (txStatus !== "all" && tx.status.toLowerCase() !== txStatus) return false;
                    return true;
                  })
                  .map((tx) => {
                    const d = new Date(tx.created_at);
                    return (
                  <tr key={tx.id} className="border-b border-black/5 last:border-b-0">
                    <td className="py-4">
                      <div className="font-medium text-[color:var(--trite-ink)]">
                        {d.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="text-xs text-[color:var(--trite-muted)]">{d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })} UTC</div>
                    </td>
                    <td className="py-4 text-[color:var(--trite-muted)]">{tx.tx_id_display}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {tx.method === "CARD" ? (
                          <CreditCardIcon className="h-4 w-4 text-blue-500" />
                        ) : tx.method === "CRYPTO" ? (
                          <CoinIcon className="h-4 w-4 text-orange-500" />
                        ) : tx.method.includes("USDC") ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                            <span className="text-[8px] font-bold text-green-700">$</span>
                          </div>
                        ) : tx.method.includes("USDT") ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100">
                            <span className="text-[8px] font-bold text-teal-700">T</span>
                          </div>
                        ) : (
                          <SmartphoneIcon className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-[color:var(--trite-muted)]">{tx.method}</span>
                        {tx.method.includes("USDC") && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            STABLE
                          </span>
                        )}
                        {tx.method.includes("USDT") && (
                          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                            STABLE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          tx.status === "SUCCESS"
                            ? "bg-[color:var(--trite-lime)] text-white"
                            : tx.status === "PROCESSING" || tx.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right font-semibold text-[color:var(--trite-ink)]">
                      {formatGHS(tx.amount)}
                    </td>
                  </tr>
                    );
                  })}
              </tbody>
            </table>
            </div>
            <div className="mt-5 flex justify-center border-t border-black/5 pt-5">
              <Link
                href="/merchant/transactions"
                className="flex items-center gap-2 rounded-xl border border-black/10 px-6 py-2.5 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.03] transition-colors"
              >
                View All Transactions
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Revenue Overview</h2>
                <p className="text-xs text-[color:var(--trite-muted)]">Track your earnings over time</p>
              </div>
              <div className="flex items-center gap-1 self-start rounded-lg bg-black/[0.04] p-1 sm:self-auto">
                {(["day", "week", "month", "year"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      chartPeriod === period
                        ? "bg-white text-[color:var(--trite-ink)] shadow-sm"
                        : "text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <BarChart period={chartPeriod} data={dashData?.revenue_chart?.[chartPeriod] ?? []} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] p-5 ring-1 ring-black/5">
              <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                Merchant Intelligence
              </div>
              <p className="mt-2 text-xs leading-5 text-[color:var(--trite-muted)]">
                Optimization tip: Switch to USDC settlements to reduce transaction fees by an
                estimated 12% this quarter.
              </p>
              <button className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                Read Full Analysis
                <ArrowRightIcon className="h-3 w-3" />
              </button>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[color:var(--trite-muted)]">
                    System Status
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                    All Systems Operational
                  </div>
                  <div className="text-xs text-[color:var(--trite-lime-strong)]">
                    Live tracking active
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--trite-lime)]">
                  <KeyIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[color:var(--trite-muted)]">
                    API Key Health
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                    {dashData ? `${dashData.total_transactions} Transactions` : "—"}
                  </div>
                  <div className="text-xs text-[color:var(--trite-muted)]">
                    Last rotated 12 days ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Withdraw Funds Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">Withdraw Funds</h2>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-[color:var(--trite-muted)]">Available Balance</div>
              <div className="text-2xl font-bold text-[color:var(--trite-ink)]">{formatGHS(dashData?.available_balance ?? 0)}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Withdrawal Amount (GHS)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Withdrawal Method</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWithdrawMethod("bank")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      withdrawMethod === "bank"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                    }`}
                  >
                    <BankIcon className="h-4 w-4" />
                    Bank Transfer
                  </button>
                  <button
                    onClick={() => setWithdrawMethod("momo")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      withdrawMethod === "momo"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                    }`}
                  >
                    <SmartphoneIcon className="h-4 w-4" />
                    Mobile Money
                  </button>
                </div>
              </div>

              {withdrawMethod === "momo" && (
                <div>
                  <label className="text-sm font-medium text-[color:var(--trite-ink)]">Network Provider</label>
                  <select className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500">
                    <option value="">Select network...</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="vodafone">Vodafone Cash</option>
                    <option value="airteltigo">AirtelTigo Money</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">
                  {withdrawMethod === "bank" ? "Destination Account" : "Mobile Money Number"}
                </label>
                <select className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500">
                  {withdrawMethod === "bank" ? (
                    <>
                      <option>GCB Bank - ****4421 (Kwame Asante)</option>
                      <option>Ecobank - ****8829 (Kwame Asante)</option>
                    </>
                  ) : (
                    <>
                      <option>+233 24 XXX XXXX (MTN MoMo)</option>
                      <option>+233 20 XXX XXXX (Vodafone Cash)</option>
                      <option>+233 26 XXX XXXX (AirtelTigo Money)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--trite-muted)]">Amount</span>
                  <span className="font-medium text-[color:var(--trite-ink)]">₵0.00</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-[color:var(--trite-muted)]">Fee</span>
                  <span className="font-medium text-[color:var(--trite-lime-strong)]">FREE</span>
                </div>
                <div className="mt-2 border-t border-black/10 pt-2 flex justify-between text-sm">
                  <span className="font-medium text-[color:var(--trite-ink)]">Total</span>
                  <span className="font-bold text-[color:var(--trite-ink)]">₵0.00</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                Cancel
              </button>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Convert to GHS Modal */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">Convert Stablecoin to GHS</h2>
              <button
                onClick={() => setConvertModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-xl bg-green-50 p-4">
              <div className="text-xs text-green-700">Available Stablecoin Balance</div>
              <div className="text-2xl font-bold text-green-900">
                ${(dashData?.stablecoin_holdings?.Total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-green-600">
                USDC: ${(dashData?.stablecoin_holdings?.USDC ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 
                USDT: ${(dashData?.stablecoin_holdings?.USDT ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Select Stablecoin</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConvertFrom("USDC")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      convertFrom === "USDC"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[8px] font-bold text-green-700">$</span>
                    USDC
                  </button>
                  <button
                    onClick={() => setConvertFrom("USDT")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      convertFrom === "USDT"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[8px] font-bold text-teal-700">T</span>
                    USDT
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Amount to Convert (USD)</label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-500"
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-[color:var(--trite-muted)]">Available: {convertFrom === "USDC" ? "$12,450.00" : "$8,230.50"}</span>
                  <button
                    onClick={() => setConvertAmount(convertFrom === "USDC" ? "12450" : "8230.50")}
                    className="text-green-600 hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--trite-muted)]">Exchange Rate</span>
                  <span className="font-medium text-[color:var(--trite-ink)]">1 USD = ₵15.50</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-[color:var(--trite-muted)]">Conversion Fee (0.5%)</span>
                  <span className="font-medium text-[color:var(--trite-ink)]">
                    {convertAmount ? formatGHS(Number(convertAmount) * 0.005 * 15.50) : "₵0.00"}
                  </span>
                </div>
                <div className="mt-2 border-t border-black/10 pt-2 flex justify-between text-sm">
                  <span className="font-medium text-[color:var(--trite-ink)]">You Will Receive</span>
                  <span className="font-bold text-green-700">
                    {convertAmount ? formatGHS(Number(convertAmount) * 15.50 * 0.995) : "₵0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConvertModalOpen(false)}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (convertAmount) {
                    setConvertAmount("");
                    setConvertModalOpen(false);
                  }
                }}
                disabled={!convertAmount}
                className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Convert Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BarChart({ period, data }: { period: "day" | "week" | "month" | "year", data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[color:var(--trite-ink)]">
          {new Intl.NumberFormat("en-GH", {
            style: "currency",
            currency: "GHS",
            minimumFractionDigits: 0,
          }).format(total)}
        </span>
        <span className="text-sm text-[color:var(--trite-muted)]">
          Total {period === "day" ? "today" : period === "week" ? "this week" : period === "month" ? "this month" : "this year"}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((item, index) => {
          const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full flex items-end justify-center h-32">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                  style={{ height: `${heightPercent}%` }}
                >
                  {item.value > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-black px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                      {formatGHS(item.value)}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-[color:var(--trite-muted)] whitespace-nowrap">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
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

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
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
