"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  ArrowLeft,
  Ban,
  CircleCheck,
  AlertTriangle,
  TrendingUp,
  Hash,
  DollarSign,
  Calendar,
  Globe,
  Mail,
  KeyRound,
  Shield,
  Receipt,
} from "lucide-react";

type MerchantProfile = {
  id: string;
  email: string;
  role: string;
  status: string;
  two_factor_enabled: boolean;
  last_login: string | null;
  created_at: string;
  merchant_id: string;
  business_name: string | null;
  merchant_display_id: string | null;
  merchant_tier: string | null;
  region: string | null;
  notification_email: string | null;
  available_balance: number | null;
  api_key_count: number;
  kyc_status: string;
  payments_paused: boolean;
  payments_paused_at: string | null;
  payments_paused_reason: string | null;
};

type MerchantMetrics = {
  transaction_count: number;
  total_volume: number;
  avg_value: number;
};

type RecentTransaction = {
  id: string;
  tx_id_display: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: string;
};

type ProfileResponse = {
  profile: MerchantProfile;
  metrics: MerchantMetrics;
  recent_transactions: RecentTransaction[];
};

export default function MerchantProfilePage() {
  const router = useRouter();
  const params = useParams();
  const merchantUserId = params.id as string;

  const { data, loading, error, mutate } = useAdminFetch<ProfileResponse>(`/api/admin/merchants/${merchantUserId}`);
  const [actionLoading, setActionLoading] = useState(false);

  const profile = data?.profile;
  const metrics = data?.metrics;
  const transactions = data?.recent_transactions ?? [];

  async function handleStatusChange(newStatus: string) {
    if (!profile) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/merchants/${merchantUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        mutate(); // Reload data
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  }

  // Stopping payments is separate from suspending the account: it blocks new
  // sessions on every channel AND expires the checkouts already open, which
  // is the only thing that halts money already in flight.
  async function handleTogglePayments() {
    if (!profile) return;
    const pausing = !profile.payments_paused;
    let reason: string | null = null;
    if (pausing) {
      reason = prompt(
        "Stop this merchant from taking payments?\n\nNew payments will be refused on every channel and any open checkouts will be cancelled.\n\nReason (shown to the merchant):"
      );
      if (reason === null) return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/merchants/${merchantUserId}/payment-controls`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: pausing, reason }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to update payment acceptance.");
        return;
      }
      if (pausing && json.sessions_expired) {
        alert(`Payments stopped. ${json.sessions_expired} open checkout(s) cancelled.`);
      }
      mutate();
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "text-emerald-600";
      case "SUSPENDED": return "text-red-500";
      case "FLAGGED": return "text-amber-500";
      case "PENDING": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "bg-emerald-50 border-emerald-200";
      case "SUSPENDED": return "bg-red-50 border-red-200";
      case "FLAGGED": return "bg-amber-50 border-amber-200";
      case "PENDING": return "bg-blue-50 border-blue-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "bg-emerald-500";
      case "SUSPENDED": return "bg-red-500";
      case "FLAGGED": return "bg-amber-500";
      case "PENDING": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getTierBadge = (tier: string | null) => {
    const colors: Record<string, string> = {
      INSTITUTIONAL: "bg-purple-100 text-purple-700",
      ENTERPRISE: "bg-indigo-100 text-indigo-700",
      MERCHANT: "bg-blue-100 text-blue-700",
      PREMIUM: "bg-emerald-100 text-emerald-700",
      STANDARD: "bg-gray-100 text-gray-700",
    };
    return colors[tier?.toUpperCase() ?? ""] ?? "bg-gray-100 text-gray-700";
  };

  const getTxStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SETTLED": return "text-emerald-600";
      case "FAILED": return "text-red-500";
      case "INITIATED": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--trite-lime)] border-t-transparent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-bold text-red-700 uppercase tracking-widest">{error || "Merchant not found"}</p>
        <button
          onClick={() => router.push("/admin/merchants")}
          className="mt-4 text-xs font-bold text-red-600 hover:text-red-700 tracking-wider uppercase"
        >
          Return to Merchant Directory
        </button>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/admin/merchants"
        className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Merchants
      </Link>

      {/* Profile Header */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner">
              <span className="text-lg font-bold text-white">
                {(profile.business_name || profile.email).slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[color:var(--trite-ink)]">
                {profile.business_name || profile.email}
              </h1>
              <p className="mt-0.5 text-xs text-[color:var(--trite-muted)]">{profile.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[color:var(--trite-ink)] bg-black/[0.03] rounded-md px-2 py-1 tracking-wider">
                  {profile.merchant_display_id || "—"}
                </span>
                <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${getTierBadge(profile.merchant_tier)}`}>
                  {profile.merchant_tier || "STANDARD"}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusBg(profile.status)} ${getStatusColor(profile.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(profile.status)}`} />
                  {profile.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {profile.status === "ACTIVE" ? (
              <button
                onClick={() => handleStatusChange("SUSPENDED")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <Ban className="h-4 w-4" />
                Suspend
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
              >
                <CircleCheck className="h-4 w-4" />
                Activate
              </button>
            )}
            {profile.status !== "FLAGGED" && (
              <button
                onClick={() => handleStatusChange("FLAGGED")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Flag for Review
              </button>
            )}
            <button
              onClick={handleTogglePayments}
              disabled={actionLoading}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors ${
                profile.payments_paused
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              <Ban className="h-4 w-4" />
              {profile.payments_paused ? "Resume Payments" : "Stop Payments"}
            </button>
          </div>

          {profile.payments_paused && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
              <Ban className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-700">
                  Not accepting payments
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Stopped {profile.payments_paused_at ? new Date(profile.payments_paused_at).toLocaleString() : ""}
                  {profile.payments_paused_reason ? ` — ${profile.payments_paused_reason}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Profile Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-[color:var(--trite-muted)]" />
            <div>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Email</p>
              <p className="mt-1 text-sm font-medium text-[color:var(--trite-ink)]">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 h-4 w-4 text-[color:var(--trite-muted)]" />
            <div>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Region</p>
              <p className="mt-1 text-sm font-medium text-[color:var(--trite-ink)]">{profile.region || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-[color:var(--trite-muted)]" />
            <div>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Created</p>
              <p className="mt-1 text-sm font-medium text-[color:var(--trite-ink)]">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-[color:var(--trite-muted)]" />
            <div>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Last Login</p>
              <p className="mt-1 text-sm font-medium text-[color:var(--trite-ink)]">
                {profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 text-[color:var(--trite-muted)]" />
            <div>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">KYC Status</p>
              <p className="mt-1 text-sm font-medium text-[color:var(--trite-ink)]">{profile.kyc_status}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-4 w-4 text-[color:var(--trite-muted)]" />
            <div>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Active API Keys</p>
              <p className="mt-1 text-sm font-medium text-[color:var(--trite-ink)]">{profile.api_key_count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Total Volume</p>
                <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">
                  GH₵{metrics.total_volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50/50">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Transaction Count</p>
                <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">
                  {metrics.transaction_count.toLocaleString()}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50/50">
                <Hash className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Avg. Transaction</p>
                <p className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">
                  GH₵{metrics.avg_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50/50">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-black/5 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="text-[10px] font-bold text-[color:var(--trite-ink)] uppercase tracking-widest">Recent Transactions</h2>
          <Link
            href={`/admin/transactions?merchant_id=${profile.merchant_id}`}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
          >
            View All →
          </Link>
        </div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-8 w-8 text-black/10 mb-3" />
            <p className="text-xs font-medium text-[color:var(--trite-muted)]">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-black/5 text-left text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-wider">
                  <th className="py-3 px-6">TX ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-black/[0.01] transition-colors">
                    <td className="py-3 px-6">
                      <span className="text-xs font-medium tracking-wider text-[color:var(--trite-ink)]">{tx.tx_id_display}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold text-[color:var(--trite-ink)]">
                        {tx.currency === "GHS" ? "GH₵" : tx.currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wider">{tx.method}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-black/[0.02] rounded-full px-2 py-0.5 ${getTxStatusColor(tx.status)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          tx.status === "SETTLED" ? "bg-emerald-500" :
                          tx.status === "FAILED" ? "bg-red-500" : "bg-blue-500"
                        }`} />
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs font-medium text-[color:var(--trite-muted)]">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
