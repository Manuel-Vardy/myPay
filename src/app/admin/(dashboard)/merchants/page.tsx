"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  Search,
  UserPlus,
  TrendingUp,
  ShieldCheck,
  Users,
} from "lucide-react";

type ApiUser = {
  id: string; email: string; role: string; status: string;
  last_login: string | null; created_at: string;
  business_name: string | null; merchant_display_id: string | null;
  merchant_tier: string | null; available_balance: number | null;
};

export default function AdminMerchantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const params: Record<string, string> = { page: String(currentPage), per_page: "20", role: "MERCHANT" };
  if (searchQuery) params.search = searchQuery;
  if (statusFilter !== "All") params.status = statusFilter.toUpperCase();

  const { data: usersData } = useAdminFetch<{ data: ApiUser[]; pagination: { total: number; total_pages: number } }>("/api/admin/users", params);
  const users = usersData?.data ?? [];
  const pagination = usersData?.pagination;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "text-emerald-600";
      case "SUSPENDED": return "text-red-500";
      case "PENDING": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "bg-emerald-500";
      case "SUSPENDED": return "bg-red-500";
      case "PENDING": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getTierBadge = (tier: string | null) => {
    const colors: Record<string, string> = {
      INSTITUTIONAL: "bg-purple-100 text-purple-700",
      MERCHANT: "bg-blue-100 text-blue-700",
      PREMIUM: "bg-emerald-100 text-emerald-700",
      STANDARD: "bg-gray-100 text-gray-700",
    };
    return colors[tier?.toUpperCase() ?? ""] ?? "bg-gray-100 text-gray-700";
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Merchant Directory</h1>
          <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">Manage and audit merchant accounts.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          <UserPlus className="h-4 w-4" />
          Add Merchant
        </button>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Total Active Merchants</p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">{pagination?.total.toLocaleString() ?? "—"}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" />
                +4.3% Growth
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50/50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">New This Month</p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">+12.4%</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Target Achieved</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50/50">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 sm:col-span-2 md:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">KYC Compliance</p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">94.2%</p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-black/5">
                <div className="h-full w-[94.2%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50/50">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
          <input
            type="text"
            placeholder="Search merchant accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm font-medium outline-none focus:border-[color:var(--trite-lime-strong)] transition-all placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[color:var(--trite-lime-strong)] transition-all lg:w-40"
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
            className="h-12 flex-1 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[color:var(--trite-lime-strong)] transition-all lg:w-40"
          >
            <option>Tier: All</option>
            <option>Institutional</option>
            <option>Merchant</option>
            <option>Premium</option>
            <option>Standard</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-2xl border border-black/5 bg-white overflow-hidden shadow-sm">
        {/* Mobile View: Cards */}
        <div className="divide-y divide-black/5 lg:hidden">
          {users.map((user) => (
            <div key={user.id} className="p-4 space-y-4 hover:bg-black/[0.01] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner">
                    <span className="text-xs font-bold text-white">{user.email.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[color:var(--trite-ink)]">{user.business_name ?? user.email.split("@")[0]}</p>
                    <p className="text-[10px] text-[color:var(--trite-muted)] uppercase tracking-tight">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Merchant ID</p>
                  <p className="mt-1 font-mono text-[10px] font-bold text-[color:var(--trite-ink)] truncate">
                    {user.merchant_display_id ?? user.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Status</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(user.status)}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Tier</p>
                  <span className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getTierBadge(user.merchant_tier ?? user.role)}`}>
                    {(user.merchant_tier ?? user.role)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Balance</p>
                  <p className="mt-1 text-[11px] font-bold text-[color:var(--trite-ink)]">
                    {user.available_balance != null ? `GH₵${Number(user.available_balance).toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/[0.03]">
                <p className="text-[9px] font-medium text-[color:var(--trite-muted)]">
                  Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                </p>
                <Link href={`/admin/merchants/${user.id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600">View Profile</Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-black/5 text-left text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-wider">
                <th className="py-4 px-6">Merchant</th>
                <th className="py-4 px-4">Merchant ID</th>
                <th className="py-4 px-4">Tier</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Volume (GHS)</th>
                <th className="py-4 px-4">Last Login</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-black/[0.01] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner">
                        <span className="text-xs font-bold text-white">{user.email.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[color:var(--trite-ink)]">{user.business_name ?? user.email.split("@")[0]}</p>
                        <p className="text-[10px] text-[color:var(--trite-muted)] uppercase tracking-tight">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium capitalize tracking-wider text-[color:var(--trite-ink)]">
                    {user.merchant_display_id ?? user.id.slice(0, 8)}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getTierBadge(user.merchant_tier ?? user.role)}`}>
                      {(user.merchant_tier ?? user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/[0.02] ${getStatusColor(user.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(user.status)}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-[color:var(--trite-ink)]">
                    {`GH₵${Number(user?.available_balance || 0).toLocaleString()}`}
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-[color:var(--trite-muted)]">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end">
                      <Link href={`/admin/merchants/${user.id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">View Profile</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-black/5 px-6 py-4 bg-slate-50/30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
            Total {pagination?.total.toLocaleString() ?? 0} institutional accounts
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-sm font-bold text-[color:var(--trite-muted)] hover:bg-black/5 disabled:opacity-50 transition-all shadow-sm">&lt;</button>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--trite-ink)] text-xs font-bold text-white shadow-sm">{currentPage}</span>
            <button onClick={() => setCurrentPage(p => Math.min(pagination?.total_pages ?? 1, p + 1))} disabled={currentPage >= (pagination?.total_pages ?? 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-sm font-bold text-[color:var(--trite-muted)] hover:bg-black/5 disabled:opacity-50 transition-all shadow-sm">&gt;</button>
          </div>
        </div>
      </div>
    </>
  );
}
