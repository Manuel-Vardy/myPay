"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
  Download,
  Filter,
  AlertTriangle,
  File,
  Calendar,
  Globe,
  CreditCard,
  Smartphone,
  Building2,
  Activity
} from "lucide-react";

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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Global Search..."
                className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
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
                <Bell className="h-5 w-5 text-[color:var(--trite-ink)]" />
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
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
                  <input
                    type="text"
                    placeholder="TX-8492049..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-xl border border-black/10 bg-slate-50 pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
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
                    <FileText className="h-4 w-4" />
                    CSV
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                    <File className="h-4 w-4" />
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
                  <Calendar className="h-4 w-4" />
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
                            <AlertTriangle className={`h-4 w-4 ${getFlagColor(tx.flag)}`} />
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

// Icons imported from Lucide React
