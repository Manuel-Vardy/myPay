"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type KycStatus = "pending" | "approved" | "flagged";
type KycTier = "Premium" | "Merchant" | "Standard";

type KycRow = {
  id: string;
  name: string;
  email: string;
  initials: string;
  identityId: string;
  tier: KycTier;
  status: KycStatus;
  submitted: string;
};

type ActivityItem = {
  id: string;
  type: "approved" | "rejected" | "requested";
  actor: string;
  target: string;
  time: string;
  detailId: string;
};

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

const demoKyc: KycRow[] = [
  {
    id: "KYC-001",
    name: "Jonathan Sterling",
    email: "sterling.j@global.com",
    initials: "JS",
    identityId: "TR-8829-KYC-9",
    tier: "Premium",
    status: "pending",
    submitted: "2 mins ago",
  },
  {
    id: "KYC-002",
    name: "Aria Montgomery",
    email: "aria.m@techflow.io",
    initials: "AM",
    identityId: "TR-9011-KYC-2",
    tier: "Merchant",
    status: "pending",
    submitted: "14 mins ago",
  },
  {
    id: "KYC-003",
    name: "Benjamin Kalu",
    email: "b.kalu@afrimail.com",
    initials: "BK",
    identityId: "TR-7722-KYC-8",
    tier: "Premium",
    status: "flagged",
    submitted: "1 hour ago",
  },
  {
    id: "KYC-004",
    name: "Chloe Huang",
    email: "chloe@creatives.com",
    initials: "CH",
    identityId: "TR-1102-KYC-5",
    tier: "Standard",
    status: "pending",
    submitted: "3 hours ago",
  },
  {
    id: "KYC-005",
    name: "Kwame Asante",
    email: "kwame.a@accrafintech.gh",
    initials: "KA",
    identityId: "GH-77281-A",
    tier: "Merchant",
    status: "pending",
    submitted: "4 hours ago",
  },
  {
    id: "KYC-006",
    name: "Abena Mensah",
    email: "abena@kumasimarkets.gh",
    initials: "AM",
    identityId: "GH-99123-K",
    tier: "Premium",
    status: "flagged",
    submitted: "5 hours ago",
  },
];

const demoActivity: ActivityItem[] = [
  {
    id: "ACT-001",
    type: "approved",
    actor: "Admin Sarah",
    target: "User #9921",
    time: "10 minutes ago",
    detailId: "ID: TR-KYC-0032",
  },
  {
    id: "ACT-002",
    type: "rejected",
    actor: "System",
    target: "User #8821 (Expired ID)",
    time: "2 hours ago",
    detailId: "ID: TR-KYC-9901",
  },
  {
    id: "ACT-003",
    type: "requested",
    actor: "Admin David",
    target: "additional documents from User #4412",
    time: "4 hours ago",
    detailId: "ID: TR-KYC-7721",
  },
];

export default function AdminKycPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("kyc");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return demoKyc;
    return demoKyc.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.email.toLowerCase().includes(q) ||
        k.identityId.toLowerCase().includes(q)
    );
  }, [query]);

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
            <span className="text-xs font-medium text-[color:var(--trite-muted)]">Financial Architect</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Search KYC requests..."
                className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Global Overview
            </button>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Audit Trail
            </button>
            <button className="h-10 rounded-xl bg-[color:var(--trite-ink)] px-4 text-sm font-medium text-white hover:bg-black">
              + Create Report
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <BellIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <HelpCircleIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-sm font-medium text-white">JW</span>
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
              <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2">
                <p className="text-xs font-medium text-emerald-700">● System Status: Operational</p>
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
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-[color:var(--trite-ink)]">KYC Center</h1>
              <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Manage user identity verification and compliance status.</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">Pending Review</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">124</p>
                <p className="mt-1 text-xs text-blue-600">+12% from yesterday</p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[color:var(--trite-lime)] p-5">
                <p className="text-xs font-medium text-[color:var(--trite-ink)]/70 uppercase tracking-wide">Approved Today</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">458</p>
                <p className="mt-1 text-xs text-[color:var(--trite-ink)]/70">High verification rate</p>
              </div>

              <div className="rounded-2xl bg-[color:var(--trite-ink)] p-5 text-white">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Rejected (24h)</p>
                <p className="mt-2 text-2xl font-semibold">12</p>
                <p className="mt-1 text-xs text-white/60">Primarily poor document quality</p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">Avg. Process Time</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">4.2m</p>
                <p className="mt-1 text-xs text-[color:var(--trite-muted)]">Target: &lt; 5.0m</p>
              </div>
            </div>

            {/* Verification Queue Table */}
            <div className="mb-6 rounded-2xl border border-black/5 bg-white">
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
                <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Verification Queue</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name or ID..."
                      className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
                    />
                  </div>
                  <button className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                    <FilterIcon className="h-4 w-4" />
                    Filters
                  </button>
                  <button className="flex h-10 items-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-4 text-sm font-medium text-white hover:bg-black">
                    <DownloadIcon className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">User Entity</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Identity ID</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Tier</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Submitted</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filtered.map((k) => (
                    <tr key={k.id} className="border-b border-black/5 last:border-b-0 hover:bg-black/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
                            {k.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[color:var(--trite-ink)]">{k.name}</p>
                            <p className="text-xs text-[color:var(--trite-muted)]">{k.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[color:var(--trite-muted)]">{k.identityId}</td>
                      <td className="px-6 py-4">
                        <TierBadge tier={k.tier} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="px-6 py-4 text-[color:var(--trite-muted)]">{k.submitted}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime-strong)]">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                            <XIcon className="h-4 w-4" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[color:var(--trite-muted)] hover:bg-black/[0.08] hover:text-[color:var(--trite-ink)]">
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-6 py-10 text-center text-sm text-[color:var(--trite-muted)]" colSpan={6}>
                        No KYC requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
                <p className="text-xs text-[color:var(--trite-muted)]">Showing 1 - {filtered.length} of 124 requests</p>
                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--trite-ink)] text-xs font-semibold text-white">1</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">2</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">3</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Activity Logs */}
              <div className="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-5">
                <h3 className="text-sm font-semibold text-[color:var(--trite-ink)] uppercase tracking-wide">Recent Activity Logs</h3>
                <div className="mt-4 space-y-4">
                  {demoActivity.map((act) => (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                        act.type === "approved" ? "bg-[color:var(--trite-lime)]" : act.type === "rejected" ? "bg-red-100" : "bg-blue-100"
                      }`}>
                        {act.type === "approved" ? (
                          <CheckIcon className="h-4 w-4 text-[color:var(--trite-ink)]" />
                        ) : act.type === "rejected" ? (
                          <XIcon className="h-4 w-4 text-red-600" />
                        ) : (
                          <DocumentIcon className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-[color:var(--trite-ink)]">
                          <span className="font-semibold">{act.actor}</span>{" "}
                          {act.type === "approved" && "approved KYC for"}
                          {act.type === "rejected" && "auto-rejected"}
                          {act.type === "requested" && "requested additional documents from"}{" "}
                          <span className="font-semibold">{act.target}</span>
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{act.time} • {act.detailId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6 lg:col-span-7">
                {/* Compliance Alert */}
                <div className="rounded-2xl bg-[color:var(--trite-ink)] p-6 text-white">
                  <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Compliance Alert</p>
                  <p className="mt-3 text-lg font-semibold">34 users from Greater Accra are reaching their Tier 1 limits. High-priority verification suggested.</p>
                  <button className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[color:var(--trite-lime-strong)] px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]">
                    Review High-Priority Queue
                  </button>
                </div>

                {/* System Integrity */}
                <div className="rounded-2xl border border-black/5 bg-blue-50 p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
                    <span className="text-sm font-semibold text-[color:var(--trite-ink)]">System Integrity</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--trite-muted)]">
                    Verification algorithms are operating at 99.8% accuracy. Last audit completed 3 days ago.
                  </p>
                  <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Download Audit Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: KycTier }) {
  const colors =
    tier === "Premium"
      ? "bg-[color:var(--trite-ink)] text-white"
      : tier === "Merchant"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${colors}`}>
      {tier.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: KycStatus }) {
  const config =
    status === "pending"
      ? { text: "Pending Review", color: "bg-blue-50 text-blue-700" }
      : status === "flagged"
      ? { text: "Flagged Risk", color: "bg-red-50 text-red-700" }
      : { text: "Approved", color: "bg-[color:var(--trite-lime)]/30 text-[color:var(--trite-ink)]" };

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${config.color}`}>
      {status === "flagged" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
      {config.text}
    </span>
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
