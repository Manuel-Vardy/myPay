"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  Users,
  Receipt,
  ShieldCheck,
  FileText,
  Key,
  HelpCircle,
  Settings,
  LogOut,
  Search,
  Bell,
  Filter,
  Download,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  FileText as FileIcon
} from "lucide-react";

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
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "transactions", label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { id: "kyc", label: "KYC Center", href: "/admin/kyc", icon: ShieldCheck },
  { id: "logs", label: "Logs", href: "/admin/logs", icon: FileText },
  { id: "roles", label: "Roles", href: "/admin/roles", icon: Key },
  { id: "support", label: "Support", href: "/admin/support", icon: HelpCircle },
];

const bottomItems = [
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
  { id: "logout", label: "Logout", href: "/admin/login", icon: LogOut },
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
                <Bell className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <HelpCircle className="h-5 w-5 text-[color:var(--trite-ink)]" />
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
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name or ID..."
                      className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
                    />
                  </div>
                  <button className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                  <button className="flex h-10 items-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-4 text-sm font-medium text-white hover:bg-black">
                    <Download className="h-4 w-4" />
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
                            <Check className="h-4 w-4" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                            <X className="h-4 w-4" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[color:var(--trite-muted)] hover:bg-black/[0.08] hover:text-[color:var(--trite-ink)]">
                            <ChevronRight className="h-4 w-4" />
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
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--trite-ink)] text-xs font-semibold text-white">1</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">2</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">3</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <ChevronRight className="h-4 w-4" />
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
                          <Check className="h-4 w-4 text-[color:var(--trite-ink)]" />
                        ) : act.type === "rejected" ? (
                          <X className="h-4 w-4 text-red-600" />
                        ) : (
                          <FileIcon className="h-4 w-4 text-blue-600" />
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
                    <ShieldCheck className="h-5 w-5 text-[color:var(--trite-ink)]" />
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

