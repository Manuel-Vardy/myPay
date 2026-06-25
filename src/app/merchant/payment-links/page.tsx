"use client";

import { useMemo, useState, useEffect } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";

type PaymentLink = {
  id: string;
  link_id_display: string;
  merchant_id: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  redirect_url: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentLinksResponse = {
  data: PaymentLink[];
  pagination: { total: number; total_pages: number; page: number; per_page: number };
};

export default function PaymentLinksPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [fetchKey, setFetchKey] = useState(0);

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchParams = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      per_page: "10",
      _k: String(fetchKey),
    };
    if (search) p.search = search;
    return p;
  }, [page, search, fetchKey]);

  const { data: linksData, loading } = useMerchantFetch<PaymentLinksResponse>(
    "/api/merchant/payment-links",
    fetchParams
  );

  const links = linksData?.data ?? [];
  const pagination = linksData?.pagination ?? { total: 0, total_pages: 1, page: 1, per_page: 10 };

  // Helper to trigger temporary toast message
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  // Format amount
  const formatAmount = (value: number, curr: string) => {
    try {
      return new Intl.NumberFormat(curr === "GHS" ? "en-GH" : "en-US", {
        style: "currency",
        currency: curr,
      }).format(value);
    } catch {
      return `${curr} ${value.toFixed(2)}`;
    }
  };

  // Copy URL to clipboard
  const handleCopyLink = (displayId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${baseUrl}/lnk/${displayId}`;
    navigator.clipboard.writeText(fullUrl);
    triggerToast("Payment link copied to clipboard!");
  };

  // Create payment link handler
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setActionError("Title is required");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setActionError("A valid positive amount is required");
      return;
    }

    setLoadingAction(true);
    setActionError(null);

    try {
      const res = await fetch("/api/merchant/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          amount: Number(amount),
          currency,
          redirect_url: redirectUrl || undefined,
          expires_at: expiresAt || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to create payment link");
        return;
      }

      triggerToast("Payment link created successfully!");
      setCreateModalOpen(false);
      // Reset form fields
      setTitle("");
      setDescription("");
      setAmount("");
      setCurrency("GHS");
      setRedirectUrl("");
      setExpiresAt("");
      // Refresh list
      setFetchKey((prev) => prev + 1);
    } catch (err) {
      setActionError("Something went wrong. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (link: PaymentLink) => {
    try {
      const res = await fetch(`/api/merchant/payment-links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !link.is_active }),
      });

      if (!res.ok) {
        triggerToast("Failed to update status");
        return;
      }

      triggerToast(link.is_active ? "Payment link deactivated!" : "Payment link activated!");
      setFetchKey((prev) => prev + 1);
    } catch {
      triggerToast("Failed to update status");
    }
  };

  // Delete payment link
  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment link? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/merchant/payment-links/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        triggerToast("Failed to delete link");
        return;
      }

      triggerToast("Payment link deleted!");
      setFetchKey((prev) => prev + 1);
    } catch {
      triggerToast("Failed to delete link");
    }
  };

  // Telemetry details
  const activeCount = useMemo(() => {
    return links.filter(l => l.is_active).length;
  }, [links]);

  return (
    <div className="px-4 py-5 sm:p-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center bg-[color:var(--trite-ink)] text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg border border-black/10 animate-slide-up">
          <svg className="h-5 w-5 text-[#22c55e] mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Digital Asset Sales
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
            Payment Links
          </h1>
          <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
            Create reusable links for global settleable invoices, subscriptions, and products.
          </p>
        </div>
        <div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#22c55e] px-5 text-sm font-bold text-white hover:bg-[#1ea74f] shadow-sm transition-colors active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            Create Payment Link
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm">
          <span className="text-sm font-medium text-[color:var(--trite-muted)]">Total Links Created</span>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
            {pagination.total}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm">
          <span className="text-sm font-medium text-[color:var(--trite-muted)]">Active Links</span>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)] flex items-center gap-2">
            <span>{activeCount}</span>
            <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm">
          <span className="text-sm font-medium text-[color:var(--trite-muted)]">Primary Currency</span>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">
            GHS
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
        {/* Filter controls */}
        <div className="border-b border-black/5 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-black/[0.01]">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[color:var(--trite-muted)]">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by title, description or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#22c55e] transition-all text-gray-900 placeholder:text-black/30"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--trite-ink)] border-t-transparent" />
              <p className="mt-2 text-sm text-[color:var(--trite-muted)]">Loading links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 border border-black/5">
                <LinkIcon className="h-6 w-6 text-[color:var(--trite-muted)]" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[color:var(--trite-ink)]">No payment links</h3>
              <p className="mt-1 text-xs text-[color:var(--trite-muted)]">Get started by creating your first reusable link.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.01] text-xs font-bold text-[color:var(--trite-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Link Details</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-[color:var(--trite-ink)]">{link.title}</div>
                      {link.description && (
                        <div className="text-xs text-[color:var(--trite-muted)] mt-0.5 truncate max-w-[250px]">
                          {link.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[color:var(--trite-ink)]">
                      {formatAmount(link.amount, link.currency)}
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-xs bg-black/[0.04] px-2 py-1 rounded font-mono text-[color:var(--trite-ink)]">
                        {link.link_id_display}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(link)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                          link.is_active
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${link.is_active ? "bg-[#22c55e]" : "bg-red-500"}`} />
                        {link.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-xs text-[color:var(--trite-muted)]">
                      {new Date(link.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleCopyLink(link.link_id_display)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/5 hover:bg-black/[0.02] text-[color:var(--trite-ink)] transition-colors active:scale-95"
                        title="Copy Link URL"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 hover:bg-red-50 text-red-600 transition-colors active:scale-95"
                        title="Delete Link"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {pagination.total_pages > 1 && (
          <div className="border-t border-black/5 p-4 flex items-center justify-between bg-black/[0.01]">
            <span className="text-xs text-[color:var(--trite-muted)]">
              Showing page {pagination.page} of {pagination.total_pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[color:var(--trite-ink)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[0.02]"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[color:var(--trite-ink)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[0.02]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCreateModalOpen(false)}
          />

          {/* Dialog content */}
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl ring-1 ring-black/5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
              <h2 className="text-lg font-bold text-[color:var(--trite-ink)]">
                Create Payment Link
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[color:var(--trite-muted)]"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3.5 border border-red-100 text-xs text-red-600 font-semibold leading-relaxed">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-1">
                  Payment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Invoice #1024 or Digital Art Package"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Provide further information or payment instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition-all text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition-all text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition-all text-gray-900 bg-white"
                  >
                    <option value="GHS">GHS (Ghana Cedi)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USDT">USDT (Tether)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-1">
                  Redirect URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com/success"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--trite-muted)] mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition-all text-gray-900"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-black/5 mt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-semibold text-[color:var(--trite-muted)] hover:bg-black/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 rounded-xl bg-[#22c55e] py-3 text-sm font-bold text-white hover:bg-[#1ea74f] disabled:opacity-55 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  {loadingAction ? "Creating..." : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
