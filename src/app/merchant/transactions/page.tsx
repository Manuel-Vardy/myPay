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

type TxStatus = "completed" | "pending" | "failed" | "flagged";
type TxMethod = "Card" | "Mobile Money" | "Bank Transfer" | "Crypto";

type Transaction = {
  id: string;
  date: string;
  time: string;
  customer: string;
  email: string;
  method: TxMethod;
  status: TxStatus;
  amount: number;
  reference: string;
};

const demoTransactions: Transaction[] = [
  {
    id: "TXN-9281-XM",
    date: "Oct 24, 2023",
    time: "14:23 UTC",
    customer: "Kofi Mensah",
    email: "kofi@example.com",
    method: "Mobile Money",
    status: "completed",
    amount: 12500.0,
    reference: "REF-8821",
  },
  {
    id: "TXN-8821-LQ",
    date: "Oct 24, 2023",
    time: "12:05 UTC",
    customer: "Ama Owusu",
    email: "ama@trite.app",
    method: "Card",
    status: "completed",
    amount: 8420.5,
    reference: "REF-7732",
  },
  {
    id: "TXN-7742-BZ",
    date: "Oct 23, 2023",
    time: "22:18 UTC",
    customer: "Kwame Asante",
    email: "kwame@biz.com",
    method: "Bank Transfer",
    status: "pending",
    amount: 45000.0,
    reference: "REF-5541",
  },
  {
    id: "TXN-6612-KR",
    date: "Oct 23, 2023",
    time: "18:45 UTC",
    customer: "Nana Yaa",
    email: "nana@shop.com",
    method: "Mobile Money",
    status: "completed",
    amount: 3200.0,
    reference: "REF-3321",
  },
  {
    id: "TXN-5531-PT",
    date: "Oct 22, 2023",
    time: "09:12 UTC",
    customer: "Yaw Boateng",
    email: "yaw@tech.io",
    method: "Crypto",
    status: "flagged",
    amount: 8900.0,
    reference: "REF-9912",
  },
  {
    id: "TXN-4429-LX",
    date: "Oct 22, 2023",
    time: "16:30 UTC",
    customer: "Abena Kumi",
    email: "abena@retail.com",
    method: "Card",
    status: "failed",
    amount: 5600.0,
    reference: "REF-2234",
  },
];

const methodMix = [
  { name: "Mobile Money", percent: 52, color: "bg-[color:var(--trite-lime-strong)]" },
  { name: "Credit / Debit Cards", percent: 31, color: "bg-blue-500" },
  { name: "Bank Transfers", percent: 12, color: "bg-purple-500" },
  { name: "Crypto", percent: 5, color: "bg-orange-500" },
];

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("transactions");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TxStatus | "all">("all");

  const formatGHS = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTransactions = useMemo(() => {
    return demoTransactions.filter((tx) => {
      const matchesQuery =
        query.length === 0 ||
        tx.id.toLowerCase().includes(query.toLowerCase()) ||
        tx.customer.toLowerCase().includes(query.toLowerCase()) ||
        tx.email.toLowerCase().includes(query.toLowerCase()) ||
        tx.reference.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const completed = filteredTransactions.filter((tx) => tx.status === "completed").length;
    const pending = filteredTransactions.filter((tx) => tx.status === "pending").length;
    const failed = filteredTransactions.filter((tx) => tx.status === "failed").length;
    const flagged = filteredTransactions.filter((tx) => tx.status === "flagged").length;
    return { total, completed, pending, failed, flagged, count: filteredTransactions.length };
  }, [filteredTransactions]);

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
                placeholder="Search transactions..."
                className="w-full bg-transparent text-gray-900 outline-none placeholder:text-black/30"
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
                Transaction Overview
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--trite-ink)]">
                Transaction Monitoring
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
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Total Volume</span>
                <span className="rounded-full bg-[color:var(--trite-lime)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--trite-ink)]">
                  +18.2%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {formatGHS(stats.total)}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">{stats.count} transactions</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Completed</span>
                <span className="rounded-full bg-[color:var(--trite-lime)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--trite-ink)]">
                  {Math.round((stats.completed / (stats.count || 1)) * 100)}%
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {stats.completed}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Successful payments</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Pending</span>
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                  Active
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {stats.pending}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Awaiting confirmation</div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[color:var(--trite-muted)]">Issues</span>
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                  {stats.failed + stats.flagged}
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                {stats.failed + stats.flagged}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Failed + Flagged</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-[color:var(--trite-ink)]">
                    Recent Transactions
                  </div>
                  <div className="text-xs text-[color:var(--trite-muted)]">
                    View and manage all payment transactions
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm">
                    <SearchIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search TXN, customer..."
                      className="w-48 bg-transparent text-gray-900 outline-none placeholder:text-black/30"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                />
                <FilterChip
                  label="Completed"
                  active={statusFilter === "completed"}
                  onClick={() => setStatusFilter("completed")}
                  variant="success"
                />
                <FilterChip
                  label="Pending"
                  active={statusFilter === "pending"}
                  onClick={() => setStatusFilter("pending")}
                  variant="neutral"
                />
                <FilterChip
                  label="Failed"
                  active={statusFilter === "failed"}
                  onClick={() => setStatusFilter("failed")}
                  variant="danger"
                />
                <FilterChip
                  label="Flagged"
                  active={statusFilter === "flagged"}
                  onClick={() => setStatusFilter("flagged")}
                  variant="warning"
                />
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 text-left">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Transaction
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                      Customer
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
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-black/5 last:border-b-0">
                      <td className="py-4">
                        <div className="font-medium text-[color:var(--trite-ink)]">{tx.id}</div>
                        <div className="text-xs text-[color:var(--trite-muted)]">
                          {tx.date} • {tx.time}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--trite-ink)] text-xs font-semibold text-white">
                            {tx.customer.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-[color:var(--trite-ink)]">{tx.customer}</div>
                            <div className="text-xs text-[color:var(--trite-muted)]">{tx.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon method={tx.method} />
                          <span className="text-[color:var(--trite-muted)]">{tx.method}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-4 text-right font-semibold text-[color:var(--trite-ink)]">
                        {formatGHS(tx.amount)}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td
                        className="py-10 text-center text-sm text-[color:var(--trite-muted)]"
                        colSpan={5}
                      >
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-[color:var(--trite-muted)]">
                  Showing {filteredTransactions.length} of {demoTransactions.length} transactions
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    Previous
                  </button>
                  <button className="flex h-8 items-center justify-center rounded-lg bg-[color:var(--trite-ink)] px-3 text-xs font-medium text-white">
                    1
                  </button>
                  <button className="flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    2
                  </button>
                  <button className="flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
              <div className="text-lg font-semibold">Payment Method Mix</div>
              <div className="mt-1 text-xs text-white/60">Distribution by transaction count</div>
              <div className="mt-6 space-y-4">
                {methodMix.map((method) => (
                  <div key={method.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{method.name}</span>
                      <span className="font-semibold">{method.percent}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                      <div className={`h-2 rounded-full ${method.color}`} style={{ width: `${method.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300">
                View detailed breakdown
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-[color:var(--trite-lime)] p-6 ring-1 ring-black/5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-[color:var(--trite-ink)]/70">
                    Mobile Money Dominance
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">
                    52% of transactions
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--trite-ink)]/70">
                    Ghana&apos;s preferred payment method. MTN MoMo and Vodafone Cash leading adoption.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--trite-ink)]/10">
                  <SmartphoneIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[color:var(--trite-ink)] p-6 text-white ring-1 ring-black/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-white/60">Settlement Status</div>
                  <div className="mt-2 text-2xl font-bold">Next: Today 18:00</div>
                  <p className="mt-2 text-xs leading-5 text-white/60">
                    Auto-settlement to GCB Bank account ending in 4421. Expected: {formatGHS(stats.total * 0.985)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <BankIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <button className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[color:var(--trite-lime-strong)] px-4 text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]">
                Manage Settlements
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  variant = "default",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "success" | "danger" | "neutral" | "warning";
}) {
  const activeStyles = {
    default: "bg-[color:var(--trite-ink)] text-white",
    success: "bg-[color:var(--trite-lime-strong)] text-[color:var(--trite-ink)]",
    danger: "bg-red-500 text-white",
    neutral: "bg-blue-500 text-white",
    warning: "bg-amber-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-semibold transition-colors ${
        active ? activeStyles[variant] : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: TxStatus }) {
  const config = {
    completed: { text: "Completed", color: "bg-[color:var(--trite-lime)]/20 text-[color:var(--trite-ink)]" },
    pending: { text: "Pending", color: "bg-blue-50 text-blue-600" },
    failed: { text: "Failed", color: "bg-red-50 text-red-600" },
    flagged: { text: "Flagged", color: "bg-amber-50 text-amber-600" },
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config[status].color}`}>
      {config[status].text}
    </span>
  );
}

function MethodIcon({ method }: { method: TxMethod }) {
  if (method === "Mobile Money") return <SmartphoneIcon className="h-4 w-4 text-[color:var(--trite-lime-strong)]" />;
  if (method === "Card") return <CreditCardIcon className="h-4 w-4 text-blue-500" />;
  if (method === "Bank Transfer") return <BankIcon className="h-4 w-4 text-purple-500" />;
  return <CoinIcon className="h-4 w-4 text-orange-500" />;
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

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
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
