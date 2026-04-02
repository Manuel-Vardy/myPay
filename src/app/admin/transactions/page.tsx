"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

type TxStatus = "success" | "pending" | "failed" | "flagged";
type TxMethod = "Card" | "Mobile Money" | "Bank Transfer" | "Crypto" | "SWIFT" | "Internal";
type TxType = "Debit" | "Credit";

interface Transaction {
  id: string;
  txId: string;
  user: string;
  merchantId: string;
  type: TxType;
  amount: number;
  currency: string;
  method: TxMethod;
  status: TxStatus;
  flag?: string;
  timestamp: string;
  initials: string;
}

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

const demoTransactions: Transaction[] = [
  {
    id: "TX-001",
    txId: "TX-8492049-AC1",
    user: "Aether Labs",
    merchantId: "TR-99283",
    type: "Credit",
    amount: 124500.00,
    currency: "GHS",
    method: "SWIFT",
    status: "success",
    timestamp: "2024-01-15T14:23:00Z",
    initials: "AL",
  },
  {
    id: "TX-002",
    txId: "TX-8391-K11",
    user: "Elena Vance",
    merchantId: "IND-8821",
    type: "Debit",
    amount: 240.50,
    currency: "GHS",
    method: "Card",
    status: "failed",
    flag: "MISMATCH",
    timestamp: "2024-01-15T13:45:00Z",
    initials: "EV",
  },
  {
    id: "TX-003",
    txId: "TX-3820-AX5",
    user: "Global Markets",
    merchantId: "TR-99222",
    type: "Credit",
    amount: 85000.00,
    currency: "GHS",
    method: "Bank Transfer",
    status: "pending",
    flag: "HIGH",
    timestamp: "2024-01-15T12:30:00Z",
    initials: "GM",
  },
  {
    id: "TX-004",
    txId: "TX-5541-R82",
    user: "Marcus Thorne",
    merchantId: "IND-2200",
    type: "Debit",
    amount: 1120.99,
    currency: "GHS",
    method: "Mobile Money",
    status: "success",
    timestamp: "2024-01-15T11:15:00Z",
    initials: "MT",
  },
  {
    id: "TX-005",
    txId: "TX-7721-GH3",
    user: "Kwame Asante",
    merchantId: "GH-77281",
    type: "Credit",
    amount: 45000.00,
    currency: "GHS",
    method: "Bank Transfer",
    status: "success",
    timestamp: "2024-01-15T10:45:00Z",
    initials: "KA",
  },
  {
    id: "TX-006",
    txId: "TX-9912-CC1",
    user: "Abena Mensah",
    merchantId: "GH-99123",
    type: "Debit",
    amount: 3200.00,
    currency: "GHS",
    method: "Mobile Money",
    status: "flagged",
    flag: "SUSPICIOUS",
    timestamp: "2024-01-15T09:30:00Z",
    initials: "AM",
  },
  {
    id: "TX-007",
    txId: "TX-4456-TM2",
    user: "Yaw Boateng",
    merchantId: "GH-44567",
    type: "Credit",
    amount: 8900.00,
    currency: "GHS",
    method: "Internal",
    status: "success",
    timestamp: "2024-01-15T08:15:00Z",
    initials: "YB",
  },
  {
    id: "TX-008",
    txId: "TX-2234-AC4",
    user: "Accra Fintech",
    merchantId: "GH-11234",
    type: "Credit",
    amount: 250000.00,
    currency: "GHS",
    method: "SWIFT",
    status: "pending",
    flag: "LARGE",
    timestamp: "2024-01-15T07:00:00Z",
    initials: "AF",
  },
];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const filteredTransactions = useMemo(() => {
    return demoTransactions.filter((tx) => {
      const matchesSearch =
        tx.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.merchantId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || tx.status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const formatAmount = (amount: number, currency: string) => {
    return `GH₵${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: TxStatus) => {
    switch (status) {
      case "success":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "flagged":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFlagColor = (flag?: string) => {
    if (!flag) return "";
    if (flag === "HIGH" || flag === "SUSPICIOUS") return "text-red-500";
    if (flag === "MISMATCH") return "text-amber-500";
    if (flag === "LARGE") return "text-blue-500";
    return "text-gray-500";
  };

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
                placeholder="Global Search..."
                className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
              Global Overview
            </button>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Audit Trail
            </button>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Generate Payment Link
            </button>
            <button className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700">
              Create Report
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <BellIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
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
              <h1 className="text-3xl font-semibold text-[color:var(--trite-ink)]">Transaction Monitoring</h1>
              <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
                Real-time architectural overview of platform liquidity and transaction integrity. Maintain security across 14 merchant channels and cross-border gateways.
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Search Transaction ID */}
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide mb-3">Search Transaction ID</p>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
                  <input
                    type="text"
                    placeholder="TX-8492049..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-xl border border-black/10 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>
              </div>

              {/* Status & Priority */}
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide mb-3">Status & Priority</p>
                <div className="flex flex-wrap gap-2">
                  {["All", "Success", "Failed", "Flagged"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-lg px-4 py-2 text-xs font-medium ${
                        statusFilter === status
                          ? status === "All" ? "bg-[color:var(--trite-ink)] text-white" :
                            status === "Success" ? "bg-emerald-600 text-white" :
                            status === "Failed" ? "bg-red-500 text-white" :
                            "bg-amber-500 text-white"
                          : "bg-black/5 text-[color:var(--trite-muted)] hover:bg-black/10"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Export */}
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide mb-3">Export</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                    <FileTextIcon className="h-4 w-4" />
                    CSV
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                    <FileIcon className="h-4 w-4" />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Live Ledger Table */}
            <div className="mb-6 rounded-2xl border border-black/5 bg-white">
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Live Ledger</h2>
                  <p className="text-xs text-[color:var(--trite-muted)]">Showing 1-{Math.min(filteredTransactions.length, rowsPerPage)} of 2,492 transactions</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[color:var(--trite-muted)]">
                  <CalendarIcon className="h-4 w-4" />
                  Oct 12 - Oct 19, 2023
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 text-left text-xs font-medium text-[color:var(--trite-muted)] uppercase">
                    <th className="py-3 px-6">TX ID</th>
                    <th className="py-3 px-4">User/Merchant</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Currency</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, rowsPerPage).map((tx) => (
                    <tr key={tx.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                      <td className="py-4 px-6">
                        <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-blue-50">
                          <span className="text-xs font-mono font-medium text-blue-600">{tx.txId.split("-")[1]}</span>
                        </div>
                        <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{tx.txId.split("-").slice(2).join("-")}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900">
                            <span className="text-sm font-semibold text-white">{tx.initials}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[color:var(--trite-ink)]">{tx.user}</p>
                            <p className="text-xs text-[color:var(--trite-muted)]">Merchant #{tx.merchantId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-[color:var(--trite-ink)]">{formatAmount(tx.amount, tx.currency)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{tx.currency}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon method={tx.method} />
                          <span className="text-sm text-[color:var(--trite-muted)]">{tx.method}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            tx.status === "success" ? "bg-emerald-500" :
                            tx.status === "pending" ? "bg-blue-500" :
                            tx.status === "failed" ? "bg-red-500" :
                            "bg-amber-500"
                          }`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {tx.flag ? (
                          <div className="flex items-center gap-1.5">
                            <AlertTriangleIcon className={`h-4 w-4 ${getFlagColor(tx.flag)}`} />
                            <span className={`text-xs font-medium ${getFlagColor(tx.flag)}`}>{tx.flag}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[color:var(--trite-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[color:var(--trite-muted)]">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="h-8 rounded-lg border border-black/10 bg-white px-2 text-sm outline-none"
                  >
                    <option>15</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[color:var(--trite-muted)]">1-{Math.min(rowsPerPage, filteredTransactions.length)} of 2,492</span>
                  <div className="flex items-center gap-1">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50" disabled>
                      &lt;&lt;
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50" disabled>
                      &lt;
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                      &gt;
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                      &gt;&gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Architect Insights */}
              <div className="lg:col-span-2 rounded-2xl bg-[color:var(--trite-ink)] p-6 text-white">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Architect Insights</p>
                <h3 className="mt-3 text-xl font-semibold">Anomaly detection is operating at 99.8% precision.</h3>
                <div className="mt-4 flex items-center gap-4">
                  <button className="rounded-xl bg-[color:var(--trite-lime)] px-5 py-2.5 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime-strong)]">
                    Review Security Audit
                  </button>
                  <span className="text-xs text-white/60">Latest scan: 6 minutes ago</span>
                </div>
              </div>

              {/* Liquidity Pulse */}
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Liquidity Pulse</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-[color:var(--trite-muted)]">GHS Reserve</span>
                      <span className="font-medium text-[color:var(--trite-ink)]">GH₵24.5M</span>
                    </div>
                    <div className="h-2 rounded-full bg-black/5">
                      <div className="h-full w-[85%] rounded-full bg-blue-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-[color:var(--trite-muted)]">USD Equivalent</span>
                      <span className="font-medium text-[color:var(--trite-ink)]">$2.4M</span>
                    </div>
                    <div className="h-2 rounded-full bg-black/5">
                      <div className="h-full w-[45%] rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
                <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                  Manage Gateways →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Method Icon Component
function MethodIcon({ method }: { method: string }) {
  if (method === "SWIFT") {
    return (
      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    );
  }
  if (method === "Card") {
    return (
      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    );
  }
  if (method === "Bank Transfer") {
    return (
      <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    );
  }
  if (method === "Mobile Money") {
    return (
      <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
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

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}
