"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  Shield,
  ArrowRight,
  ArrowUpDown,
  Download,
  Filter,
  MoreVertical,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Pause,
  Play,
  Check,
  Copy,
  RefreshCw,
  Send,
  MessageSquare,
  Wifi,
  Server,
  Database,
  Zap,
  Lock,
  Unlock,
  CreditCard,
  Smartphone,
  Globe,
  MapPin,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Slash
} from "lucide-react";

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

const stats = [
  { label: "Total Platform Volume", value: "GH₵142.5B", sub: "+12.4% vs LY" },
  { label: "Active Merchants", value: "2,840", sub: "Direct Institutional Access" },
  { label: "KYC Pending Review", value: "124", sub: "⚠ Action Required", alert: true },
  { label: "System Uptime", value: "99.99%", sub: "● Operational" },
];

const recentActivity = [
  { id: "TX-001", entity: "Accra Global Ltd", type: "Cross-border Settlement", volume: "GH₵1,240,000.00", gateway: "ACC-EAST-1", status: "Settled", merchantId: "8842" },
  { id: "TX-002", entity: "Kumasi Markets", type: "Liquidity Injection", volume: "GH₵4,500,000.00", gateway: "KSI-NORTH", status: "Processing", merchantId: "8815" },
  { id: "TX-003", entity: "Tema Finance", type: "Card Issuance Fee", volume: "GH₵850.00", gateway: "TMA-CENTRAL", status: "Settled", merchantId: "8891" },
  { id: "TX-004", entity: "Cape Coast Traders", type: "Mobile Money", volume: "GH₵125,000.00", gateway: "CC-WEST", status: "Pending", merchantId: "8833" },
  { id: "TX-005", entity: "Tamale Enterprises", type: "Bank Transfer", volume: "GH₵2,750,000.00", gateway: "TML-NORTH", status: "Processing", merchantId: "8872" },
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Global system search..."
                className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <Bell className="h-5 w-5 text-[color:var(--trite-ink)]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <Shield className="h-5 w-5 text-[color:var(--trite-ink)]" />
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
                      <Download className="h-4 w-4" />
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
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                      </button>
                      <button className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                        <ArrowUpDown className="h-3.5 w-3.5" />
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
                                <p className="text-xs text-[color:var(--trite-muted)]">Merchant ID: {activity.merchantId}</p>
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
                              <MoreVertical className="h-4 w-4 text-[color:var(--trite-muted)]" />
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

// Icons are now imported from Lucide React library
