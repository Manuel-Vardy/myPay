"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/merchant", icon: LayoutGridIcon },
  { id: "analytics", label: "Analytics", href: "/merchant/analytics", icon: BarChartIcon },
  { id: "transactions", label: "Transactions", href: "/merchant/transactions", icon: ReceiptIcon },
  { id: "customers", label: "Customers", href: "/merchant/customers", icon: UsersIcon },
  { id: "settings", label: "Settings", href: "/merchant/settings", icon: SettingsIcon },
];

type CustomerTier = "institutional" | "enterprise" | "standard";
type VerificationStatus = "verified" | "pending" | "unverified";

type Customer = {
  id: string;
  name: string;
  email: string;
  tier: CustomerTier;
  volume: number;
  volumeChange: number;
  verification: VerificationStatus;
  avatar: string;
};

const demoCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "Kwame Asante",
    email: "kwame.asante@goldenstar.com.gh",
    tier: "institutional",
    volume: 2842910.0,
    volumeChange: 12.4,
    verification: "verified",
    avatar: "KA",
  },
  {
    id: "CUST-002",
    name: "Abena Osei",
    email: "abena.osei@agricorp.com.gh",
    tier: "enterprise",
    volume: 1214050.44,
    volumeChange: -3.1,
    verification: "verified",
    avatar: "AO",
  },
  {
    id: "CUST-003",
    name: "Kofi Mensah",
    email: "kofi.mensah@techghana.io",
    tier: "standard",
    volume: 212940.0,
    volumeChange: -2.5,
    verification: "pending",
    avatar: "KM",
  },
  {
    id: "CUST-004",
    name: "Akua Boateng",
    email: "akua@premiertrading.com.gh",
    tier: "institutional",
    volume: 4290442.1,
    volumeChange: 24.8,
    verification: "verified",
    avatar: "AB",
  },
];

const tierLabels: Record<CustomerTier, string> = {
  institutional: "INSTITUTIONAL",
  enterprise: "ENTERPRISE",
  standard: "STANDARD",
};

const tierColors: Record<CustomerTier, string> = {
  institutional: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
  standard: "bg-gray-100 text-gray-700",
};

export default function CustomersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("customers");
  const [tierFilter, setTierFilter] = useState<CustomerTier | "all">("all");
  const [sortBy, setSortBy] = useState("recent");

  const formatGHS = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredCustomers = useMemo(() => {
    let result = tierFilter === "all" ? demoCustomers : demoCustomers.filter((c) => c.tier === tierFilter);
    
    if (sortBy === "volume") {
      result = [...result].sort((a, b) => b.volume - a.volume);
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  }, [tierFilter, sortBy]);

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
                <span className="text-sm font-semibold text-white">AV</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                  Adrian Vance
                </div>
                <div className="text-xs text-[color:var(--trite-muted)]">Regional Director</div>
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
                placeholder="Search customer records..."
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
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--trite-ink)]">
                Customer Directory
              </h1>
              <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
                Manage institutional client relationships, track high-velocity spending patterns, and monitor verification lifecycles.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </button>
              <button className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                Add Customer
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <TierChip
                label="All Customers"
                active={tierFilter === "all"}
                onClick={() => setTierFilter("all")}
              />
              <TierChip
                label="Institutional (Tier 1)"
                active={tierFilter === "institutional"}
                onClick={() => setTierFilter("institutional")}
              />
              <TierChip
                label="Enterprise (Tier 2)"
                active={tierFilter === "enterprise"}
                onClick={() => setTierFilter("enterprise")}
              />
              <TierChip
                label="Standard"
                active={tierFilter === "standard"}
                onClick={() => setTierFilter("standard")}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[color:var(--trite-muted)]">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[color:var(--trite-ink)] outline-none"
              >
                <option value="recent">Recent Activity</option>
                <option value="volume">Total Volume</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Customer Entity
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Tier
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Total Volume
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Verification
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-black/5 last:border-b-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
                          {customer.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-[color:var(--trite-ink)]">{customer.name}</div>
                          <div className="text-xs text-[color:var(--trite-muted)]">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tierColors[customer.tier]}`}>
                        {tierLabels[customer.tier]}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="font-semibold text-[color:var(--trite-ink)]">{formatGHS(customer.volume)}</div>
                      <div className={`text-xs ${customer.volumeChange >= 0 ? "text-[color:var(--trite-lime-strong)]" : "text-red-500"}`}>
                        {customer.volumeChange >= 0 ? "+" : ""}{customer.volumeChange}%
                      </div>
                    </td>
                    <td className="py-4">
                      <VerificationBadge status={customer.verification} />
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]">
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      className="py-10 text-center text-sm text-[color:var(--trite-muted)]"
                      colSpan={5}
                    >
                      No customers found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-[color:var(--trite-muted)]">
                Showing 1 - {filteredCustomers.length} of 2,840 customers
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--trite-ink)] text-xs font-medium text-white">
                  1
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                  2
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                  3
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                  Acquisition Rate
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[color:var(--trite-lime)]">
                  <TrendingUpIcon className="h-4 w-4 text-[color:var(--trite-ink)]" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">+18.2%</div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">New customer onboarding vs last month</div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-black/[0.04]">
                <div className="h-1.5 rounded-full bg-[color:var(--trite-lime-strong)]" style={{ width: "65%" }} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                  KYC Compliance
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">94.8%</div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Verified institutional profile completion</div>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? "bg-[color:var(--trite-lime-strong)]" : "bg-black/[0.08]"}`} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Portfolio Value
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-white/20">
                  <TrendingUpIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-bold">₵48.2M</div>
              <div className="mt-1 text-xs text-white/60">Total Managed Assets (GHS)</div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-8 flex-1 rounded bg-white/10" />
                <div className="h-8 flex-1 rounded bg-white/20" />
                <div className="h-8 flex-1 rounded bg-white/30" />
                <div className="h-8 flex-1 rounded bg-white/40" />
                <div className="h-8 flex-1 rounded bg-white/50" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TierChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors ${
        active
          ? "bg-[color:var(--trite-ink)] text-white"
          : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
      }`}
    >
      {label}
    </button>
  );
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = {
    verified: { text: "VERIFIED", color: "bg-[color:var(--trite-lime)]/20 text-[color:var(--trite-ink)]", icon: CheckIcon },
    pending: { text: "PENDING", color: "bg-gray-100 text-gray-600", icon: ClockIcon },
    unverified: { text: "UNVERIFIED", color: "bg-red-50 text-red-600", icon: XIcon },
  };

  const { text, color, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${color}`}>
      <Icon className="h-3 w-3" />
      {text}
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
