"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGridIcon },
  { id: "analytics", label: "Analytics", href: "/dashboard/analytics", icon: BarChartIcon },
  { id: "transactions", label: "Transactions", href: "/dashboard/transactions", icon: ReceiptIcon },
  { id: "customers", label: "Customers", href: "/dashboard/customers", icon: UsersIcon },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

const demoTransactions = [
  {
    id: "TRX-8821-XL-81",
    date: "Oct 24, 2023",
    time: "14:23 UTC",
    method: "Visa ending in 4421",
    status: "success",
    amount: 450.0,
    type: "deposit",
  },
  {
    id: "TRX-1382-ZN-99",
    date: "Oct 24, 2023",
    time: "12:05 UTC",
    method: "BTC Lightning",
    status: "success",
    amount: 1200.5,
    type: "deposit",
  },
  {
    id: "TRX-4429-LX-12",
    date: "Oct 23, 2023",
    time: "22:18 UTC",
    method: "USDC (ERC-20)",
    status: "pending",
    amount: 3000.0,
    type: "withdrawal",
  },
  {
    id: "TRX-9912-BN-44",
    date: "Oct 23, 2023",
    time: "09:15 UTC",
    method: "Mobile Money",
    status: "success",
    amount: 2600.0,
    type: "deposit",
  },
  {
    id: "TRX-7733-KP-88",
    date: "Oct 22, 2023",
    time: "16:30 UTC",
    method: "Bank Transfer",
    status: "success",
    amount: 500.0,
    type: "transfer",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [ledgerFilter, setLedgerFilter] = useState<"all" | "deposits" | "withdrawals" | "transfers">("all");

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
                        if (item.id === "analytics") {
                          router.push("/dashboard/analytics");
                        } else if (item.id === "transactions") {
                          router.push("/dashboard/transactions");
                        } else if (item.id === "customers") {
                          router.push("/dashboard/customers");
                        } else {
                          setActiveTab(item.id);
                          router.push(item.href);
                        }
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
                placeholder="Search transactions, customers or analytics..."
                className="w-full bg-transparent outline-none placeholder:text-black/30"
              />
            </div>
            <Link
              href="#"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Merchant
            </Link>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--trite-ink)]">
              Welcome back, Merchant.
            </h1>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Your institutional portal is ready. Global markets are stable, and your
              transaction success rate is currently exceeding the 98th percentile.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                      Available Institutional Balance
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{formatGHS(1250)}</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <WalletIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-600"
                    type="button"
                  >
                    Withdraw Funds
                  </button>
                  <button
                    onClick={() => setLedgerModalOpen(true)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
                    type="button"
                  >
                    View Ledger
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[color:var(--trite-muted)]">
                    Daily Volume
                  </div>
                  <span className="text-xs font-semibold text-[color:var(--trite-lime-strong)]">
                    +10.4%
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
                  {formatGHS(48902)}
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-black/[0.04]">
                  <div className="h-2 w-3/4 rounded-full bg-blue-500" />
                </div>
                <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Last 24h</div>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[color:var(--trite-muted)]">
                    Success Rate
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--trite-lime)]">
                    <CheckIcon className="h-4 w-4 text-[color:var(--trite-ink)]" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-[color:var(--trite-ink)]">
                    99.2%
                  </span>
                  <span className="text-xs text-[color:var(--trite-muted)]">Average</span>
                </div>
                <div className="mt-1 text-xs text-[color:var(--trite-lime-strong)]">
                  Exceptional operational stability detected
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">
                Recent Transactions
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Date & Time
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Transaction ID
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
                {demoTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-black/5 last:border-b-0">
                    <td className="py-4">
                      <div className="font-medium text-[color:var(--trite-ink)]">
                        {tx.date}
                      </div>
                      <div className="text-xs text-[color:var(--trite-muted)]">{tx.time}</div>
                    </td>
                    <td className="py-4 text-[color:var(--trite-muted)]">{tx.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {tx.method.includes("Visa") ? (
                          <CreditCardIcon className="h-4 w-4 text-blue-500" />
                        ) : tx.method.includes("BTC") ? (
                          <CoinIcon className="h-4 w-4 text-orange-500" />
                        ) : (
                          <CoinIcon className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-[color:var(--trite-muted)]">{tx.method}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          tx.status === "success"
                            ? "bg-[color:var(--trite-lime)]/20 text-[color:var(--trite-ink)]"
                            : "bg-black/[0.04] text-[color:var(--trite-muted)]"
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right font-semibold text-[color:var(--trite-ink)]">
                      {formatGHS(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] p-5 ring-1 ring-black/5">
              <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                Merchant Intelligence
              </div>
              <p className="mt-2 text-xs leading-5 text-[color:var(--trite-muted)]">
                Optimization tip: Switch to USDC settlements to reduce transaction fees by an
                estimated 12% this quarter.
              </p>
              <button className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                Read Full Analysis
                <ArrowRightIcon className="h-3 w-3" />
              </button>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[color:var(--trite-muted)]">
                    System Status
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                    All Systems Operational
                  </div>
                  <div className="text-xs text-[color:var(--trite-lime-strong)]">
                    Live tracking active
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--trite-lime)]">
                  <KeyIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[color:var(--trite-muted)]">
                    API Key Health
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                    9 Active Keys
                  </div>
                  <div className="text-xs text-[color:var(--trite-muted)]">
                    Last rotated 12 days ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Withdraw Funds Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">Withdraw Funds</h2>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-[color:var(--trite-muted)]">Available Balance</div>
              <div className="text-2xl font-bold text-[color:var(--trite-ink)]">{formatGHS(1250)}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Withdrawal Amount (GHS)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Withdrawal Method</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWithdrawMethod("bank")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      withdrawMethod === "bank"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                    }`}
                  >
                    <BankIcon className="h-4 w-4" />
                    Bank Transfer
                  </button>
                  <button
                    onClick={() => setWithdrawMethod("momo")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      withdrawMethod === "momo"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                    }`}
                  >
                    <SmartphoneIcon className="h-4 w-4" />
                    Mobile Money
                  </button>
                </div>
              </div>

              {withdrawMethod === "momo" && (
                <div>
                  <label className="text-sm font-medium text-[color:var(--trite-ink)]">Network Provider</label>
                  <select className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500">
                    <option value="">Select network...</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="vodafone">Vodafone Cash</option>
                    <option value="airteltigo">AirtelTigo Money</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">
                  {withdrawMethod === "bank" ? "Destination Account" : "Mobile Money Number"}
                </label>
                <select className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500">
                  {withdrawMethod === "bank" ? (
                    <>
                      <option>GCB Bank - ****4421 (Kwame Asante)</option>
                      <option>Ecobank - ****8829 (Kwame Asante)</option>
                    </>
                  ) : (
                    <>
                      <option>+233 24 XXX XXXX (MTN MoMo)</option>
                      <option>+233 20 XXX XXXX (Vodafone Cash)</option>
                      <option>+233 26 XXX XXXX (AirtelTigo Money)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--trite-muted)]">Amount</span>
                  <span className="font-medium text-[color:var(--trite-ink)]">₵0.00</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-[color:var(--trite-muted)]">Fee</span>
                  <span className="font-medium text-[color:var(--trite-lime-strong)]">FREE</span>
                </div>
                <div className="mt-2 border-t border-black/10 pt-2 flex justify-between text-sm">
                  <span className="font-medium text-[color:var(--trite-ink)]">Total</span>
                  <span className="font-bold text-[color:var(--trite-ink)]">₵0.00</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                Cancel
              </button>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Ledger Modal */}
      {ledgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">Transaction Ledger</h2>
                <p className="text-xs text-[color:var(--trite-muted)]">View your complete transaction history</p>
              </div>
              <button
                onClick={() => setLedgerModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setLedgerFilter("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  ledgerFilter === "all"
                    ? "bg-[color:var(--trite-ink)] text-white"
                    : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLedgerFilter("deposits")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  ledgerFilter === "deposits"
                    ? "bg-[color:var(--trite-ink)] text-white"
                    : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setLedgerFilter("withdrawals")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  ledgerFilter === "withdrawals"
                    ? "bg-[color:var(--trite-ink)] text-white"
                    : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
                }`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setLedgerFilter("transfers")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  ledgerFilter === "transfers"
                    ? "bg-[color:var(--trite-ink)] text-white"
                    : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
                }`}
              >
                Transfers
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Date</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Description</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Amount</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Balance</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {demoTransactions
                  .filter((t) => ledgerFilter === "all" || t.type === ledgerFilter.slice(0, -1))
                  .map((t, i, arr) => {
                    const runningBalance = arr.slice(0, i + 1).reduce((acc, curr) => {
                      return curr.type === "deposit" || curr.type === "transfer"
                        ? acc + curr.amount
                        : acc - curr.amount;
                    }, 0);
                    return (
                      <tr key={t.id} className="border-b border-black/5">
                        <td className="py-3">
                          <div className="font-medium text-[color:var(--trite-ink)]">{t.date}</div>
                          <div className="text-xs text-[color:var(--trite-muted)]">{t.time}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-[color:var(--trite-ink)]">
                            {t.type === "deposit" && "Deposit - "}
                            {t.type === "withdrawal" && "Withdrawal - "}
                            {t.type === "transfer" && "Transfer - "}
                            {t.method}
                          </div>
                          <div className="text-xs text-[color:var(--trite-muted)]">{t.id}</div>
                        </td>
                        <td className={`py-3 text-right font-medium ${t.type === "withdrawal" ? "text-red-600" : "text-green-600"}`}>
                          {t.type === "withdrawal" ? "-" : "+"}{formatGHS(t.amount)}
                        </td>
                        <td className="py-3 text-right font-medium text-[color:var(--trite-ink)]">{formatGHS(runningBalance)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <div className="mt-6 flex items-center justify-between">
              <button className="flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.03]">
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => setLedgerModalOpen(false)}
                className="rounded-lg bg-[color:var(--trite-ink)] px-6 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
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

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
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

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
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

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
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
