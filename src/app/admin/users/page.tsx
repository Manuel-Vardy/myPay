"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

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
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Search by Name, Email, or Merchant ID..."
                className="h-10 w-80 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <BellIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <SettingsIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
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
                <UserPlusIcon className="h-4 w-4" />
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
                      <TrendingUpIcon className="h-3 w-3" />
                      +4.3% Monthly
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
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
                    <UserPlusIcon className="h-5 w-5 text-emerald-600" />
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
                    <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[300px] max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
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
                <SlidersIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
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
                            <MoreVerticalIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
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

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H15" />
    </svg>
  );
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}
