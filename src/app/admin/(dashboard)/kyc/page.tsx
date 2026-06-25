"use client";

import { useMemo, useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

type KycTier = "Premium" | "Merchant" | "Standard" | "Institutional" | string;
type KycStatus = "pending" | "approved" | "flagged" | string;

type KycRow = {
  id: string; email: string; identity_id: string;
  tier: string; status: string; submitted_at: string;
  business_name: string | null;
};

type KycResponse = {
  data: KycRow[];
  stats: { by_status: Array<{ status: string; count: string }>; avg_process_time_ms: number };
  pagination: { total: number; total_pages: number };
};

type ActivityItem = {
  id: string;
  type: "approved" | "rejected" | "requested";
  actor: string;
  target: string;
  time: string;
  detailId: string;
};


export default function AdminKycPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: kycData, mutate } = useAdminFetch<KycResponse>("/api/admin/kyc", { page: String(page), per_page: "20", status: "PENDING" });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      mutate();
    } catch (err) {
      console.error(err);
      alert("Failed to update KYC status");
    } finally {
      setUpdatingId(null);
    }
  };

  const records = kycData?.data ?? [];
  const stats = kycData?.stats;
  const pagination = kycData?.pagination;

  const pendingCount = stats?.by_status?.find((s) => s.status === "PENDING")?.count ?? "0";
  const approvedCount = stats?.by_status?.find((s) => s.status === "APPROVED")?.count ?? "0";
  const rejectedCount = stats?.by_status?.find((s) => s.status === "REJECTED")?.count ?? "0";
  const avgMs = stats?.avg_process_time_ms ?? 0;
  const avgMin = avgMs > 0 ? (avgMs / 60000).toFixed(1) : "—";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (k) => k.email.toLowerCase().includes(q) || k.identity_id.toLowerCase().includes(q)
    );
  }, [query, records]);

  const demoActivity: ActivityItem[] = [
    { id: "ACT-001", type: "approved", actor: "Admin Sarah", target: "User #9921", time: "10 minutes ago", detailId: "ID: TR-KYC-0032" },
    { id: "ACT-002", type: "rejected", actor: "System", target: "User #8821 (Expired ID)", time: "2 hours ago", detailId: "ID: TR-KYC-9901" },
    { id: "ACT-003", type: "requested", actor: "Admin David", target: "User #4412", time: "4 hours ago", detailId: "ID: TR-KYC-7721" },
  ];


  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">KYC Center</h1>
          <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">Manage identity verification and compliance status.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Pending Review</p>
          <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">{pendingCount}</p>
          <p className="mt-1 text-[10px] font-bold text-blue-600 uppercase tracking-tight">+12% vs Yesterday</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-[color:var(--trite-lime)] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Approved Today</p>
          <p className="mt-2 text-2xl font-bold text-white">{approvedCount}</p>
          <p className="mt-1 text-[10px] font-bold text-white/70 uppercase tracking-tight">Active Velocity</p>
        </div>

        <div className="rounded-2xl bg-[color:var(--trite-ink)] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Rejected (24h)</p>
          <p className="mt-2 text-2xl font-bold">{rejectedCount}</p>
          <p className="mt-1 text-[10px] font-bold text-white/60 uppercase tracking-tight">Risk Mitigation</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Avg. Process Time</p>
          <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">{avgMin}m</p>
          <p className="mt-1 text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-tight">Target: &lt; 5.0m</p>
        </div>
      </div>

      {/* Verification Queue List */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 border-b border-black/5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[color:var(--trite-ink)]">Verification Queue</h2>
            <p className="text-xs text-[color:var(--trite-muted)] mt-1">Institutional identity screening lifecycle</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search identity ID..."
                className="h-11 w-full rounded-xl border border-black/10 bg-slate-50/50 pl-10 pr-4 text-sm font-medium outline-none focus:border-[color:var(--trite-lime-strong)] transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-widest text-[color:var(--trite-ink)] hover:bg-black/[0.02] transition-colors">
                <FilterIcon className="h-4 w-4" />
                Filter
              </button>
              <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition-all">
                <DownloadIcon className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="divide-y divide-black/5 lg:hidden">
          {filtered.map((k) => (
            <div key={k.id} className="p-4 space-y-4 hover:bg-black/[0.01] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
                    {k.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[color:var(--trite-ink)]">{k.business_name ?? k.email.split("@")[0]}</p>
                    <p className="text-[10px] text-[color:var(--trite-muted)] uppercase tracking-tight">{k.email}</p>
                  </div>
                </div>
                <StatusBadge status={k.status.toLowerCase() as "pending" | "approved" | "flagged"} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Identity ID</p>
                  <p className="mt-1 font-mono text-[10px] font-bold text-[color:var(--trite-ink)] truncate">{k.identity_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">Tier</p>
                  <div className="mt-1">
                    <TierBadge tier={k.tier as "Premium" | "Merchant" | "Standard"} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-black/[0.03]">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(k.id, "APPROVED")}
                    disabled={updatingId === k.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--trite-lime)] text-white hover:bg-[color:var(--trite-lime-strong)] disabled:opacity-50 shadow-sm"
                  >
                    {updatingId === k.id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckIcon className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(k.id, "REJECTED")}
                    disabled={updatingId === k.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 shadow-sm"
                  >
                    {updatingId === k.id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <XIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[9px] font-medium text-[color:var(--trite-muted)] uppercase">
                  Submitted: {new Date(k.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[color:var(--trite-muted)]">
              No KYC requests found.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-black/5 bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">User Entity</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Identity ID</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Tier</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Submitted</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((k) => (
                <tr key={k.id} className="border-b border-black/5 last:border-b-0 hover:bg-black/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
                        {k.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[color:var(--trite-ink)]">{k.business_name ?? k.email.split("@")[0]}</p>
                        <p className="text-xs text-[color:var(--trite-muted)]">{k.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[color:var(--trite-muted)]">{k.identity_id}</td>
                  <td className="px-6 py-4"><TierBadge tier={k.tier as "Premium" | "Merchant" | "Standard"} /></td>
                  <td className="px-6 py-4"><StatusBadge status={k.status.toLowerCase() as "pending" | "approved" | "flagged"} /></td>
                  <td className="px-6 py-4 text-[color:var(--trite-muted)]">{new Date(k.submitted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(k.id, "APPROVED")}
                        disabled={updatingId === k.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--trite-lime)] text-white hover:bg-[color:var(--trite-lime-strong)] disabled:opacity-50"
                      >
                        {updatingId === k.id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckIcon className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(k.id, "REJECTED")}
                        disabled={updatingId === k.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                      >
                        {updatingId === k.id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <XIcon className="h-4 w-4" />}
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[color:var(--trite-muted)] hover:bg-black/[0.08]">
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-[color:var(--trite-muted)]" colSpan={6}>
                    No KYC requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-black/5 px-6 py-4">
          <p className="text-xs text-[color:var(--trite-muted)]">
            Showing {pagination?.total === 0 ? 0 : (page - 1) * 20 + 1} - {Math.min(page * 20, pagination?.total ?? 0)} of {pagination?.total ?? 0} requests
          </p>
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination?.total_pages ?? 0))].map((_, i) => {
                const p = i + 1;
                return (
                  <button 
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                      page === p 
                        ? "bg-[color:var(--trite-ink)] text-white shadow-sm" 
                        : "border border-black/10 bg-white text-[color:var(--trite-ink)] hover:bg-black/[0.02]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(pagination?.total_pages ?? 1, p + 1))}
              disabled={page >= (pagination?.total_pages ?? 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50 transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Activity Logs */}
        <div className="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-5">
          <h3 className="text-sm font-semibold text-[color:var(--trite-ink)] uppercase tracking-wide">Recent Activity Logs</h3>
          <div className="mt-4 space-y-4">
            {demoActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  act.type === "approved" ? "bg-[color:var(--trite-lime)]" : 
                  act.type === "rejected" ? "bg-red-50" : "bg-blue-50"
                }`}>
                  {act.type === "approved" ? (
                    <CheckIcon className="h-4 w-4 text-white" />
                  ) : act.type === "rejected" ? (
                    <XIcon className="h-4 w-4 text-red-600" />
                  ) : (
                    <DocumentIcon className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-[color:var(--trite-ink)]">
                    <span className="font-semibold">{act.actor}</span>{" "}
                    {act.type === "approved" && "approved KYC for"}
                    {act.type === "rejected" && "auto-rejected"}
                    {act.type === "requested" && "requested additional documents from"}{" "}
                    <span className="font-semibold">{act.target}</span>
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--trite-muted)]">{act.time} • {act.detailId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Compliance Alert */}
          <div className="rounded-2xl bg-[color:var(--trite-ink)] p-6 text-white">
            <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Compliance Alert</p>
            <p className="mt-3 text-lg font-semibold">34 users from Greater Accra are reaching their Tier 1 limits. High-priority verification suggested.</p>
            <button className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[color:var(--trite-lime-strong)] px-4 text-sm font-semibold text-white hover:bg-[color:var(--trite-lime)]">
              Review High-Priority Queue
            </button>
          </div>

          {/* System Integrity */}
          <div className="rounded-2xl border border-black/5 bg-blue-50 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              <span className="text-sm font-semibold text-[color:var(--trite-ink)]">System Integrity</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[color:var(--trite-muted)]">
              Verification algorithms are operating at 99.8% accuracy. Last audit completed 3 days ago.
            </p>
            <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">
              Download Audit Log
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function TierBadge({ tier }: { tier: KycTier }) {
  const config = {
    "Institutional": "bg-purple-100 text-purple-700",
    "Premium": "bg-emerald-100 text-emerald-700",
    "Merchant": "bg-blue-100 text-blue-700",
    "Standard": "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${(config as any)[tier] || config.Standard}`}>
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: KycStatus }) {
  const config = {
    "pending": "bg-blue-100 text-blue-700",
    "approved": "bg-emerald-100 text-emerald-700",
    "flagged": "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium capitalize ${(config as any)[status] || "bg-slate-100 text-slate-700"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === "approved" ? "bg-emerald-500" :
        status === "pending" ? "bg-blue-500" : "bg-amber-500"
      }`} />
      {status}
    </span>
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
