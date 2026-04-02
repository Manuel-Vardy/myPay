"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGridIcon },
  { id: "users", label: "Users", href: "/admin/users", icon: UsersIcon },
  { id: "transactions", label: "Transactions", href: "/admin/transactions", icon: ReceiptIcon },
  { id: "kyc", label: "KYC Center", href: "/admin/kyc", icon: ShieldCheckIcon },
  { id: "logs", label: "Logs", href: "/admin/logs", icon: FileTextIcon },
  { id: "roles", label: "Roles", href: "/admin/roles", icon: KeyIcon },
  { id: "support", label: "Support", href: "/admin/support", icon: HelpCircleIcon },
];

const bottomItems = [
  { id: "settings", label: "Settings", href: "/admin/settings", icon: SettingsIcon },
  { id: "logout", label: "Logout", href: "/admin/login", icon: LogOutIcon },
];

const stats = [
  { label: "Total Platform Volume", value: "GH₵142.5B", sub: "+12.4% vs LY" },
  { label: "Active Merchants", value: "2,840", sub: "Direct Institutional Access" },
  { label: "KYC Pending Review", value: "124", sub: "⚠ Action Required", alert: true },
  { label: "System Uptime", value: "99.99%", sub: "● Operational" },
];

const recentActivity = [
  { id: "TX-001", entity: "Accra Global Ltd", type: "Cross-border Settlement", volume: "GH₵1,240,000.00", gateway: "ACC-EAST-1", status: "Settled" },
  { id: "TX-002", entity: "Kumasi Markets", type: "Liquidity Injection", volume: "GH₵4,500,000.00", gateway: "KSI-NORTH", status: "Processing" },
  { id: "TX-003", entity: "Tema Finance", type: "Card Issuance Fee", volume: "GH₵850.00", gateway: "TMA-CENTRAL", status: "Settled" },
  { id: "TX-004", entity: "Cape Coast Traders", type: "Mobile Money", volume: "GH₵125,000.00", gateway: "CC-WEST", status: "Pending" },
  { id: "TX-005", entity: "Tamale Enterprises", type: "Bank Transfer", volume: "GH₵2,750,000.00", gateway: "TML-NORTH", status: "Processing" },
];

const securityAlerts = [
  { type: "warning", title: "Unusual IP Concentration", desc: "Region: Greater Accra", time: "14:22:18 UTC" },
  { type: "critical", title: "Large Transaction Freeze", desc: "TX #GH-9821-AC-99", time: "13:45:02 UTC" },
  { type: "info", title: "Maintenance Window", desc: "Scheduled for Sunday 02:00 UTC", time: "01:00:00 UTC" },
];

const regionalPerformance = [
  { region: "Greater Accra", percentage: 47 },
  { region: "Ashanti", percentage: 31 },
  { region: "Northern", percentage: 12 },
  { region: "Western", percentage: 10 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [timeFilter, setTimeFilter] = useState("24H");

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/tritee-logo.png"
                alt="Trite logo"
                width={120}
                height={28}
                priority
              />
            </Link>
            <span className="text-xs font-medium text-[color:var(--trite-muted)]">Institutional Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Global system search..."
                className="h-10 w-72 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <BellIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <ShieldIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <div className="h-10 w-10 rounded-full bg-[color:var(--trite-lime)] flex items-center justify-center">
                <span className="text-sm font-semibold text-[color:var(--trite-ink)]">ID</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-[color:var(--trite-ink)]">Institutional Director</p>
                <p className="text-xs text-[color:var(--trite-muted)]">System Admin Profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-black/5 bg-white">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)]"
                            : "text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-black/5 px-3 py-4">
              <div className="mb-4 rounded-lg bg-[color:var(--trite-lime)]/30 px-3 py-2">
                <p className="text-xs font-semibold text-[color:var(--trite-ink)]">SYSTEM STATUS: ACTIVE</p>
              </div>
              <ul className="space-y-1">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-[color:var(--trite-ink)]">Institutional Oversight</h1>
              <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Real-time platform performance and security metrics.</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="rounded-2xl border border-black/5 bg-white p-5">
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - Liquidity */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-black/5 bg-white p-6">
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
                  <div className="h-48 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-end justify-between px-4 pb-4 pt-8">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                      <div key={i} className="w-full mx-0.5">
                        <div
                          className="rounded-t bg-[color:var(--trite-lime-strong)]/80 hover:bg-[color:var(--trite-lime-strong)] transition-colors"
                          style={{ height: `${h * 2}px` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-xs text-[color:var(--trite-muted)]">INBOUND</p>
                        <p className="text-lg font-semibold text-[color:var(--trite-ink)]">GH₵8.4B</p>
                      </div>
                      <div>
                        <p className="text-xs text-[color:var(--trite-muted)]">OUTBOUND</p>
                        <p className="text-lg font-semibold text-[color:var(--trite-ink)]">GH₵5.8B</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black">
                      <DownloadIcon className="h-4 w-4" />
                      Export Report
                    </button>
                  </div>
                </div>

                {/* Recent Activity Table */}
                <div className="rounded-2xl border border-black/5 bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Recent Institutional Activity</h2>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                        <FilterIcon className="h-3.5 w-3.5" />
                        Filter
                      </button>
                      <button className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                        <ArrowUpDownIcon className="h-3.5 w-3.5" />
                        Sort
                      </button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/5 text-left text-xs font-medium text-[color:var(--trite-muted)] uppercase">
                        <th className="pb-3 pr-4">Merchant Entity</th>
                        <th className="pb-3 pr-4">Transaction Type</th>
                        <th className="pb-3 pr-4">Volume (GHS)</th>
                        <th className="pb-3 pr-4">Gateway Node</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity) => (
                        <tr key={activity.id} className="border-b border-black/5 last:border-0">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--trite-lime)]/30">
                                <span className="text-sm font-semibold text-[color:var(--trite-ink)]">{activity.entity.split(" ")[0][0]}{activity.entity.split(" ")[1]?.[0] || ""}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[color:var(--trite-ink)]">{activity.entity}</p>
                                <p className="text-xs text-[color:var(--trite-muted)]">Merchant ID: 88{Math.floor(Math.random() * 100)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-sm text-[color:var(--trite-muted)]">{activity.type}</td>
                          <td className="py-4 pr-4 text-sm font-medium text-[color:var(--trite-ink)]">{activity.volume}</td>
                          <td className="py-4 pr-4">
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">{activity.gateway}</span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                              activity.status === "Settled" ? "text-emerald-600" :
                              activity.status === "Processing" ? "text-blue-600" :
                              "text-amber-600"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                activity.status === "Settled" ? "bg-emerald-500" :
                                activity.status === "Processing" ? "bg-blue-500" :
                                "bg-amber-500"
                              }`} />
                              {activity.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <button className="rounded-lg p-1.5 hover:bg-black/[0.03]">
                              <MoreVerticalIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">View All Transactions</button>
                </div>
              </div>

              {/* Right Column - Security & Performance */}
              <div className="space-y-6">
                {/* Security Alerts */}
                <div className="rounded-2xl bg-[color:var(--trite-ink)] p-5 text-white">
                  <h2 className="mb-4 text-lg font-semibold">Critical Security Alerts</h2>
                  <div className="space-y-3">
                    {securityAlerts.map((alert, idx) => (
                      <div key={idx} className="rounded-xl bg-white/10 p-3">
                        <div className="mb-2 flex items-start gap-2">
                          <div className={`mt-0.5 h-2 w-2 rounded-full ${
                            alert.type === "critical" ? "bg-red-400" :
                            alert.type === "warning" ? "bg-amber-400" :
                            "bg-blue-400"
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-white/60">{alert.desc}</p>
                            <p className="mt-1 text-xs text-white/40">{alert.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full rounded-xl bg-white/10 py-2 text-sm font-medium hover:bg-white/20">
                    View All Incidents
                  </button>
                </div>

                {/* Regional Performance */}
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                  <h2 className="mb-4 text-sm font-semibold text-[color:var(--trite-ink)] uppercase tracking-wide">Regional Performance</h2>
                  <div className="space-y-3">
                    {regionalPerformance.map((region) => (
                      <div key={region.region}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-[color:var(--trite-muted)]">{region.region}</span>
                          <span className="font-medium text-[color:var(--trite-ink)]">{region.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/5">
                          <div
                            className="h-full rounded-full bg-[color:var(--trite-lime-strong)]"
                            style={{ width: `${region.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Icons
function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.592-2.783 6.375 6.375 0 01-11.592 2.783M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.592-2.783 6.375 6.375 0 01-11.592 2.783M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.392 4.396 9.78 9.829 9.78 1.645.001 3.26-.337 4.78-1.003.657-.283 1.113-.78 1.333-1.423A9.713 9.713 0 0022.083 12.75c0-1.454-.146-2.87-.453-4.236A11.994 11.994 0 003.745 4.986 11.959 11.959 0 0012.499 2.25z" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.317.53a3 3 0 01-5.317-.53m5.317.53V12.75A1.5 1.5 0 0014.25 12h-.904a1.5 1.5 0 00-1.5 1.5v2.336c0 .607.197 1.217.573 1.702.242.312.578.53.962.6.46.086.93.032 1.37-.137z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.392 4.396 9.78 9.829 9.78 1.645.001 3.26-.337 4.78-1.003.657-.283 1.113-.78 1.333-1.423A9.713 9.713 0 0022.083 12.75c0-1.454-.146-2.87-.453-4.236A11.994 11.994 0 003.745 4.986 11.959 11.959 0 0012.499 2.25z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  );
}

function ArrowUpDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  );
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}
