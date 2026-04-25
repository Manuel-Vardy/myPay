"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/merchant", icon: LayoutGridIcon },
  { id: "analytics", label: "Analytics", href: "/merchant/analytics", icon: BarChartIcon },
  { id: "transactions", label: "Transactions", href: "/merchant/transactions", icon: ReceiptIcon },
  { id: "subscriptions", label: "Subscriptions", href: "/merchant/subscriptions", icon: RefreshCcwIcon },
  { id: "customers", label: "Customers", href: "/merchant/customers", icon: UsersIcon },
  { id: "settings", label: "Settings", href: "/merchant/settings", icon: SettingsIcon },
];

const demoSubscriptions = [
  {
    id: "SUB-8821-XL",
    customer: "Global Tech Solutions",
    wallet: "0x71C...4a21",
    plan: "Enterprise Pro",
    amount: 2500.0,
    currency: "USDC",
    status: "active",
    nextBilling: "Nov 24, 2023",
  },
  {
    id: "SUB-1382-ZN",
    customer: "Nexus Digital Agency",
    wallet: "0x3a2...99bc",
    plan: "Standard Tier",
    amount: 450.0,
    currency: "USDT",
    status: "active",
    nextBilling: "Nov 18, 2023",
  },
  {
    id: "SUB-4429-LX",
    customer: "Creative Minds Ltd",
    wallet: "0x918...12ef",
    plan: "Enterprise Pro",
    amount: 2500.0,
    currency: "USDC",
    status: "paused",
    nextBilling: "Pending",
  },
  {
    id: "SUB-9912-BN",
    customer: "Safari Web Services",
    wallet: "0x442...88aa",
    plan: "Basic Plan",
    amount: 120.0,
    currency: "USDC",
    status: "active",
    nextBilling: "Nov 12, 2023",
  },
  {
    id: "SUB-7733-KP",
    customer: "Apex Logistics",
    wallet: "0x112...dd32",
    plan: "Enterprise Pro",
    amount: 2500.0,
    currency: "USDT",
    status: "canceled",
    nextBilling: "N/A",
  },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "canceled">("all");

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredSubscriptions = demoSubscriptions.filter(s => 
    filter === "all" ? true : s.status === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f6f7fb]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 h-screen w-56 border-r border-black/5 bg-white transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
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
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[color:var(--trite-muted)]">Verified Merchant</span>
                  <VerifiedBadge className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="transition-all duration-300 lg:ml-56">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03] lg:hidden"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <Link href="/" className="lg:hidden">
                <Image
                  src="/tritee-logo.png"
                  alt="Trite logo"
                  width={90}
                  height={22}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-9 max-w-xs items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs text-[color:var(--trite-muted)] md:flex">
                <SearchIcon className="h-3.5 w-3.5" />
                <input placeholder="Search..." className="w-full bg-transparent outline-none" />
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]">
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-5">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-green-600">Stablecoin Yield</div>
              <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
                Subscriptions
              </h1>
              <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">
                Recurring institutional revenue via stablecoins.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-[color:var(--trite-ink)] px-3 text-xs font-semibold text-white hover:bg-black">
                New Plan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="text-xs font-medium text-[color:var(--trite-muted)]">MRR</div>
              <div className="mt-1 text-xl font-semibold text-[color:var(--trite-ink)]">
                {formatUSD(48250.00)}
              </div>
              <div className="mt-1 text-[10px] text-green-600">↑ 8.4%</div>
            </div>
            <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="text-xs font-medium text-[color:var(--trite-muted)]">Subscribers</div>
              <div className="mt-1 text-xl font-semibold text-[color:var(--trite-ink)]">
                124
              </div>
              <div className="mt-1 text-[10px] text-[color:var(--trite-muted)]">Stable</div>
            </div>
            <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="text-xs font-medium text-[color:var(--trite-muted)]">Churn</div>
              <div className="mt-1 text-xl font-semibold text-[color:var(--trite-ink)]">
                0.82%
              </div>
              <div className="mt-1 text-[10px] text-green-600">Excellent</div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-white ring-1 ring-black/5 overflow-hidden">
            <div className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {(["all", "active", "paused", "canceled"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`text-sm font-medium capitalize transition-colors ${
                        filter === t ? "text-[color:var(--trite-ink)]" : "text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-left border-b border-black/5">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">Plan</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">Next Billing</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[color:var(--trite-ink)]">{sub.customer}</div>
                      <div className="text-xs text-[color:var(--trite-muted)] font-mono">{sub.wallet}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[color:var(--trite-muted)]">{sub.plan}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[color:var(--trite-ink)]">
                      {sub.amount} {sub.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        sub.status === "active" ? "bg-green-100 text-green-700" :
                        sub.status === "paused" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          sub.status === "active" ? "bg-green-600" :
                          sub.status === "paused" ? "bg-amber-600" :
                          "bg-red-600"
                        }`} />
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[color:var(--trite-muted)]">{sub.nextBilling}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]">
                        <MoreHorizontalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Icons
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
    </svg>
  );
}

function RefreshCcwIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <polyline points="21 3 21 8 16 8" />
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function MoreHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-[color:var(--trite-lime-strong)] p-0.5 ${className}`}>
      <svg className="h-full w-full text-[color:var(--trite-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
