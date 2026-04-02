"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGridIcon },
  { id: "analytics", label: "Analytics", href: "/dashboard/analytics", icon: BarChartIcon },
  { id: "transactions", label: "Transactions", href: "/dashboard/transactions", icon: ReceiptIcon },
  { id: "customers", label: "Customers", href: "/dashboard/customers", icon: CustomersIcon },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

const demoSettlements = [
  {
    id: "SETL-9281-XM",
    dateRange: "Oct 24 - Oct 31",
    grossAmount: 842900.0,
    fees: -14210.0,
    status: "completed",
  },
  {
    id: "SETL-8821-LQ",
    dateRange: "Oct 17 - Oct 23",
    grossAmount: 1029450.0,
    fees: -18490.0,
    status: "completed",
  },
  {
    id: "SETL-7742-BZ",
    dateRange: "Oct 10 - Oct 16",
    grossAmount: 921000.0,
    fees: -15800.0,
    status: "pending",
  },
];

const marketHubs = [
  { code: "GH", name: "Ghana", volume: "₵2.1M", velocity: "High", color: "text-[color:var(--trite-lime-strong)]" },
  { code: "NG", name: "Nigeria", volume: "₵892K", velocity: "Medium", color: "text-amber-500" },
  { code: "ZA", name: "South Africa", volume: "₵512K", velocity: "Surging", color: "text-blue-500" },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");

  const formatGHS = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f6f7fb]">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-black/5 bg-white">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-black/5 px-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/tritee-logo.png"
                alt="Trite logo"
                width={120}
                height={28}
                priority
              />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        router.push(item.href);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)]"
                          : "text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-black/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--trite-ink)]">
                <span className="text-sm font-semibold text-white">KA</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                  Kwame Asante
                </div>
                <div className="text-xs text-[color:var(--trite-muted)]">Verified Merchant</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex h-10 flex-1 max-w-md items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm text-[color:var(--trite-muted)]">
              <SearchIcon className="h-4 w-4" />
              <input
                placeholder="Search analytics..."
                className="w-full bg-transparent outline-none placeholder:text-black/30"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]">
                <BellIcon className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]">
                <HelpCircleIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--trite-ink)]">
                <span>Merchant Dashboard</span>
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Performance Overview
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--trite-ink)]">
                Institutional Analytics
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
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Total Revenue</span>
                <span className="rounded-full bg-[color:var(--trite-lime)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--trite-ink)]">
                  +12.4%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {formatGHS(4281092)}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">vs last 30 days</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Avg. Order Value</span>
                <span className="rounded-full bg-[color:var(--trite-lime)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--trite-ink)]">
                  +8%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {formatGHS(142.5)}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Stable growth</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Conversion Rate</span>
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                  -0.4%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                3.82%
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Optimization needed</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Success Rate</span>
                <span className="rounded-full bg-[color:var(--trite-lime)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--trite-ink)]">
                  99.8%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                99.94%
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
                <button className="flex items-center gap-1 text-xs font-medium text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]">
                  Last 30 Days
                  <ChevronDownIcon className="h-3 w-3" />
                </button>
              </div>
              <div className="h-48 w-full">
                <svg className="h-full w-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,120 C50,110 100,90 150,95 C200,100 250,60 300,50 C350,40 400,70 450,80 C500,90 550,20 600,30 L600,150 L0,150 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,120 C50,110 100,90 150,95 C200,100 250,60 300,50 C350,40 400,70 450,80 C500,90 550,20 600,30"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <circle cx="600" cy="30" r="4" fill="#3b82f6" />
                </svg>
              </div>
              <div className="mt-4 flex justify-between text-xs text-[color:var(--trite-muted)]">
                <span>01 NOV</span>
                <span>07 NOV</span>
                <span>14 NOV</span>
                <span>21 NOV</span>
                <span>28 NOV</span>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
              <div className="text-lg font-semibold">Method Mix</div>
              <div className="mt-1 text-xs text-white/60">Distribution of incoming funds</div>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Credit / Debit Cards</span>
                    <span className="font-semibold">64%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div className="h-2 w-[64%] rounded-full bg-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Digital Wallets</span>
                    <span className="font-semibold">28%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div className="h-2 w-[28%] rounded-full bg-purple-500" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Bank Transfers</span>
                    <span className="font-semibold">8%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div className="h-2 w-[8%] rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
              <button className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300">
                View regional insights
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <div className="mb-4 text-lg font-semibold text-[color:var(--trite-ink)]">
                Top Market Hubs
              </div>
              <div className="space-y-4">
                {marketHubs.map((hub) => (
                  <div key={hub.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-xs font-semibold text-[color:var(--trite-ink)]">
                        {hub.code}
                      </div>
                      <div>
                        <div className="font-medium text-[color:var(--trite-ink)]">{hub.name}</div>
                        <div className="text-xs text-[color:var(--trite-muted)]">{hub.volume} Volume</div>
                      </div>
                    </div>
                    <div className={`text-xs font-semibold ${hub.color}`}>{hub.velocity} VELOCITY</div>
                  </div>
                ))}
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
            <table className="w-full">
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
                {demoSettlements.map((s) => (
                  <tr key={s.id} className="border-b border-black/5 last:border-b-0">
                    <td className="py-4 font-medium text-[color:var(--trite-ink)]">{s.id}</td>
                    <td className="py-4 text-[color:var(--trite-muted)]">{s.dateRange}</td>
                    <td className="py-4 font-medium text-[color:var(--trite-ink)]">
                      {formatGHS(s.grossAmount)}
                    </td>
                    <td className="py-4 text-red-600">{formatGHS(s.fees)}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          s.status === "completed"
                            ? "bg-[color:var(--trite-lime)]/20 text-[color:var(--trite-ink)]"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {s.status === "completed" && <CheckIcon className="h-3 w-3" />}
                        {s.status === "pending" && <ClockIcon className="h-3 w-3" />}
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
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
      </main>
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
