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
  UserPlus,
  TrendingUp,
  SlidersHorizontal,
  MoreVertical
} from "lucide-react";

type UserStatus = "active" | "suspended" | "flagged" | "pending";
type UserTier = "Merchant" | "Premium" | "Standard" | "Institutional";

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar?: string;
  merchantId: string;
  tier: UserTier;
  status: UserStatus;
  lastLogin: string;
  volumeGhana: string;
  transactions: number;
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

const demoUsers: User[] = [
  {
    id: "USR-001",
    name: "Elena Rodriguez",
    email: "elena@galaventure.io",
    initials: "ER",
    merchantId: "TR-99428-X",
    tier: "Merchant",
    status: "active",
    lastLogin: "2 mins ago",
    volumeGhana: "GH₵2.4M",
    transactions: 1847,
  },
  {
    id: "USR-002",
    name: "Marcus Thorne",
    email: "m.thorne@icloud.com",
    initials: "MT",
    merchantId: "IND-88216-P",
    tier: "Premium",
    status: "suspended",
    lastLogin: "14 hours ago",
    volumeGhana: "GH₵890K",
    transactions: 432,
  },
  {
    id: "USR-003",
    name: "Sarah Jenkins",
    email: "jenkins.s@global-pay.com",
    initials: "SJ",
    merchantId: "TR-11844-L",
    tier: "Merchant",
    status: "active",
    lastLogin: "45 mins ago",
    volumeGhana: "GH₵5.1M",
    transactions: 3214,
  },
  {
    id: "USR-004",
    name: "Kwame Asante",
    email: "kwame.a@accrafintech.gh",
    initials: "KA",
    merchantId: "GH-77281-A",
    tier: "Institutional",
    status: "active",
    lastLogin: "1 hour ago",
    volumeGhana: "GH₵12.8M",
    transactions: 8921,
  },
  {
    id: "USR-005",
    name: "Abena Mensah",
    email: "abena@kumasimarkets.gh",
    initials: "AM",
    merchantId: "GH-99123-K",
    tier: "Merchant",
    status: "flagged",
    lastLogin: "5 mins ago",
    volumeGhana: "GH₵1.2M",
    transactions: 654,
  },
  {
    id: "USR-006",
    name: "Yaw Boateng",
    email: "y.boateng@temafinance.gh",
    initials: "YB",
    merchantId: "GH-44567-T",
    tier: "Premium",
    status: "active",
    lastLogin: "3 hours ago",
    volumeGhana: "GH₵3.7M",
    transactions: 2156,
  },
  {
    id: "USR-007",
    name: "Kevin Zhang",
    email: "kevin.z@fintech.org",
    initials: "KZ",
    merchantId: "IND-22589-Q",
    tier: "Standard",
    status: "flagged",
    lastLogin: "1 min ago",
    volumeGhana: "GH₵45K",
    transactions: 89,
  },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    return demoUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.merchantId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || user.status === statusFilter.toLowerCase();
      const matchesTier = tierFilter === "All" || user.tier === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [searchQuery, statusFilter, tierFilter]);

  const totalUsers = 1284092;
  const newThisMonth = 12;
  const kycVerified = 94.2;

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "text-emerald-600";
      case "suspended":
        return "text-red-500";
      case "flagged":
        return "text-amber-500";
      case "pending":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusDot = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "suspended":
        return "bg-red-500";
      case "flagged":
        return "bg-amber-500";
      case "pending":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierBadge = (tier: UserTier) => {
    const colors = {
      Institutional: "bg-purple-100 text-purple-700",
      Merchant: "bg-blue-100 text-blue-700",
      Premium: "bg-emerald-100 text-emerald-700",
      Standard: "bg-gray-100 text-gray-700",
    };
    return colors[tier] || colors.Standard;
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
            <span className="text-xs font-medium text-[color:var(--trite-muted)]">Institutional Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Search by Name, Email, or Merchant ID..."
                className="h-10 w-80 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <Bell className="h-5 w-5 text-[color:var(--trite-ink)]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <Settings className="h-5 w-5 text-[color:var(--trite-ink)]" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <div className="h-10 w-10 rounded-full bg-[color:var(--trite-lime)] flex items-center justify-center">
                <span className="text-sm font-semibold text-[color:var(--trite-ink)]">S1</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-[color:var(--trite-ink)]">admin_01</p>
                <p className="text-xs text-[color:var(--trite-muted)]">SUPERVISOR</p>
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[color:var(--trite-ink)]">User Directory</h1>
                <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Manage and audit institutional and individual user accounts.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                Register New User
              </button>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">Total Active Users</p>
                    <p className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">1,284,092</p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      <TrendingUp className="h-3 w-3" />
                      +4.3% Monthly
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">New This Month</p>
                    <p className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">+12%</p>
                    <p className="mt-2 text-xs text-[color:var(--trite-muted)]">Ahead of quarterly forecast</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <UserPlus className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">KYC Verified</p>
                    <p className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">94.2%</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-black/5">
                      <div className="h-full w-[94.2%] rounded-full bg-emerald-500" />
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[300px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
                <input
                  type="text"
                  placeholder="Filter by Name, Email, or Merchant ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              >
                <option>Status: All</option>
                <option>Active</option>
                <option>Suspended</option>
                <option>Flagged</option>
                <option>Pending</option>
              </select>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              >
                <option>Tier: All</option>
                <option>Institutional</option>
                <option>Merchant</option>
                <option>Premium</option>
                <option>Standard</option>
              </select>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <SlidersHorizontal className="h-4 w-4 text-[color:var(--trite-muted)]" />
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-black/5 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 text-left text-xs font-medium text-[color:var(--trite-muted)] uppercase">
                    <th className="py-4 px-6">User Entity</th>
                    <th className="py-4 px-4">Merchant ID</th>
                    <th className="py-4 px-4">Verification Tier</th>
                    <th className="py-4 px-4">Account Status</th>
                    <th className="py-4 px-4">Volume (GHS)</th>
                    <th className="py-4 px-4">Last Login</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900">
                            <span className="text-sm font-semibold text-white">{user.initials}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[color:var(--trite-ink)]">{user.name}</p>
                            <p className="text-xs text-[color:var(--trite-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-[color:var(--trite-ink)]">{user.merchantId}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${getTierBadge(user.tier)}`}>
                          {user.tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${getStatusColor(user.status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(user.status)}`} />
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[color:var(--trite-ink)]">{user.volumeGhana}</span>
                        <p className="text-xs text-[color:var(--trite-muted)]">{user.transactions.toLocaleString()} txns</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-[color:var(--trite-muted)]">{user.lastLogin}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View Profile
                          </button>
                          <button className="rounded-lg p-1.5 hover:bg-black/[0.03]">
                            <MoreVertical className="h-4 w-4 text-[color:var(--trite-muted)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
                <p className="text-sm text-[color:var(--trite-muted)]">
                  Showing 1-{filteredUsers.length} of {totalUsers.toLocaleString()} users
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50" disabled>
                    &lt;
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white">
                    1
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    2
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    3
                  </button>
                  <span className="text-sm text-[color:var(--trite-muted)]">...</span>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    321
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-sm text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    &gt;
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

// Icons imported from Lucide React
