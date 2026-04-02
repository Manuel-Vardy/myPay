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
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGridIcon },
  { id: "customers", label: "Customers", href: "/dashboard/customers", icon: UsersIcon },
  { id: "transactions", label: "Transactions", href: "/dashboard/transactions", icon: ReceiptIcon },
  { id: "kyc", label: "KYC Center", href: "/dashboard/kyc", icon: ShieldCheckIcon },
  { id: "logs", label: "Logs", href: "/dashboard", icon: FileTextIcon },
  { id: "roles", label: "Roles", href: "/dashboard", icon: KeyIcon },
  { id: "support", label: "Support", href: "/dashboard", icon: HelpCircleIcon },
];

const bottomItems = [
  { id: "settings", label: "Settings", href: "/dashboard", icon: SettingsIcon },
  { id: "logout", label: "Logout", href: "/login", icon: LogOutIcon },
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

export default function DashboardKycPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f6f7fb]">
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-black/5 bg-white">
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

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-black/40">
              Workspace
            </div>
            <ul className="mt-3 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === "kyc";
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-black/[0.03] text-[color:var(--trite-ink)]"
                          : "text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      }`}
                      type="button"
                    >
                      <span
                        className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-opacity ${
                          isActive
                            ? "bg-[color:var(--trite-lime-strong)] opacity-100"
                            : "bg-[color:var(--trite-lime-strong)] opacity-0 group-hover:opacity-40"
                        }`}
                        aria-hidden="true"
                      />
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-black/5 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-black/40">
              Account
            </div>
            <ul className="space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => router.push(item.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] transition-colors hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      type="button"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>

      <main className="ml-72">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-1 text-sm text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="uppercase tracking-wide">Back</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]"
                type="button"
              >
                <FilterIcon className="h-4 w-4" />
                Filters
              </button>
              <button
                className="flex h-10 items-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-4 text-sm font-semibold text-white hover:bg-black"
                type="button"
              >
                <DownloadIcon className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--trite-ink)]">
              KYC Center
            </h1>
            <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
              Manage user identity verification and compliance status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                Pending Review
              </div>
              <div className="mt-2 text-3xl font-semibold text-[color:var(--trite-ink)]">
                124
              </div>
              <div className="mt-1 text-xs text-blue-600">+12% from yesterday</div>
            </div>

            <div className="rounded-2xl bg-[color:var(--trite-lime)] p-5 ring-1 ring-black/5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--trite-ink)]/70">
                Approved Today
              </div>
              <div className="mt-2 text-3xl font-semibold text-[color:var(--trite-ink)]">
                458
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-ink)]/70">
                High verification rate
              </div>
            </div>

            <div className="rounded-2xl bg-[color:var(--trite-ink)] p-5 text-white ring-1 ring-black/10">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                Rejected (24h)
              </div>
              <div className="mt-2 text-3xl font-semibold">12</div>
              <div className="mt-1 text-xs text-white/60">Primarily poor document quality</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                Avg. Process Time
              </div>
              <div className="mt-2 text-3xl font-semibold text-[color:var(--trite-ink)]">
                4.2m
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Target: &lt; 5.0m</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <div className="text-lg font-semibold text-[color:var(--trite-ink)]">
                Verification Queue
              </div>
              <div className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm text-[color:var(--trite-muted)]">
                <SearchIcon className="h-4 w-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-64 bg-transparent outline-none placeholder:text-black/30"
                />
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.01] text-left">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    User Entity
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Identity ID
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((k) => (
                  <tr key={k.id} className="border-b border-black/5 last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--trite-ink)] text-xs font-semibold text-white">
                          {k.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-[color:var(--trite-ink)]">
                            {k.name}
                          </div>
                          <div className="text-xs text-[color:var(--trite-muted)]">{k.email}</div>
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
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime-strong)]"
                          type="button"
                          aria-label="Approve"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          type="button"
                          aria-label="Reject"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[color:var(--trite-muted)] hover:bg-black/[0.08] hover:text-[color:var(--trite-ink)]"
                          type="button"
                          aria-label="More"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-sm text-[color:var(--trite-muted)]"
                      colSpan={6}
                    >
                      No KYC requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
              <div className="text-xs text-[color:var(--trite-muted)]">
                Showing 1 - {filtered.length} of 124 requests
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02] hover:text-[color:var(--trite-ink)]"
                  type="button"
                  aria-label="Previous"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--trite-ink)] text-xs font-semibold text-white">
                  1
                </div>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]"
                  type="button"
                >
                  2
                </button>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]"
                  type="button"
                >
                  3
                </button>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02] hover:text-[color:var(--trite-ink)]"
                  type="button"
                  aria-label="Next"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-5">
              <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                Recent Activity Logs
              </div>
              <div className="mt-4 space-y-4">
                {demoActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                        act.type === "approved"
                          ? "bg-[color:var(--trite-lime)]"
                          : act.type === "rejected"
                          ? "bg-red-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {act.type === "approved" ? (
                        <CheckIcon className="h-4 w-4 text-[color:var(--trite-ink)]" />
                      ) : act.type === "rejected" ? (
                        <XIcon className="h-4 w-4 text-red-600" />
                      ) : (
                        <DocumentIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-[color:var(--trite-ink)]">
                        <span className="font-semibold">{act.actor}</span>{" "}
                        {act.type === "approved" && "approved KYC for"}
                        {act.type === "rejected" && "auto-rejected"}
                        {act.type === "requested" && "requested additional documents from"}{" "}
                        <span className="font-semibold">{act.target}</span>
                      </div>
                      <div className="mt-1 text-xs text-[color:var(--trite-muted)]">
                        {act.time} • {act.detailId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-7">
              <div className="rounded-2xl bg-[color:var(--trite-ink)] p-6 text-white">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Compliance Alert
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  34 users from Region X are reaching their Tier 1 limits. High-priority
                  verification suggested.
                </div>
                <button
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[color:var(--trite-lime-strong)] px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]"
                  type="button"
                >
                  Review High-Priority Queue
                </button>
              </div>

              <div className="rounded-2xl bg-[#eef2ff] p-6 ring-1 ring-black/5">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
                  <span className="text-sm font-semibold text-[color:var(--trite-ink)]">
                    System Integrity
                  </span>
                </div>
                <div className="mt-2 text-xs leading-5 text-[color:var(--trite-muted)]">
                  Verification algorithms are operating at 99.8% accuracy. Last audit completed 3
                  days ago.
                </div>
                <button
                  className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                  type="button"
                >
                  Download Audit Log
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-black/5 px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-xs text-[color:var(--trite-muted)]">
              © 2024 TRITE PSP. HIGH-END FINANCIAL ARCHITECTURE.
            </div>
            <div className="flex items-center gap-6 text-xs text-[color:var(--trite-muted)]">
              <Link href="#" className="hover:text-[color:var(--trite-ink)]">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-[color:var(--trite-ink)]">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-[color:var(--trite-ink)]">
                Security
              </Link>
              <Link href="#" className="hover:text-[color:var(--trite-ink)]">
                API Docs
              </Link>
            </div>
          </div>
        </footer>
      </main>
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors}`}>
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
      : { text: "Approved", color: "bg-[color:var(--trite-lime)]/20 text-[color:var(--trite-ink)]" };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.color}`}>
      {status === "flagged" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
      {config.text}
    </span>
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

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
      <line x1="10" y1="9" x2="8" y2="9" />
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

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
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

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
