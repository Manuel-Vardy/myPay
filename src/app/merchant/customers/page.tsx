"use client";

import { useMemo, useState } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";


type CustomerTier = "institutional" | "enterprise" | "standard";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  tier: CustomerTier;
  status: string;
  total_spent: number;
  transaction_count: number;
  last_transaction_at: string | null;
};

type CustomersResponse = {
  data: Customer[];
  acquisition_rate: { percentage: number; this_month: number; last_month: number };
  portfolio_value: number;
  pagination: { total: number; total_pages: number; page: number; per_page: number };
};

const tierLabels: Record<CustomerTier, string> = {
    institutional: "INSTITUTIONAL",
    enterprise: "ENTERPRISE",
    standard: "STANDARD",
};

const tierColors: Record<CustomerTier, string> = {
    institutional: "bg-blue-100 text-blue-700",
    enterprise: "bg-purple-100 text-purple-700",
    standard: "bg-gray-100 text-gray-700",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Add Customer modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerTier, setNewCustomerTier] = useState<CustomerTier>("standard");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editVolume, setEditVolume] = useState("");
  const [editTier, setEditTier] = useState<CustomerTier>("standard");

  // Key to force refetch after mutations
  const [fetchKey, setFetchKey] = useState(0);

  const fetchParams = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      sort: sortBy,
      _k: String(fetchKey),
    };
    if (search) p.search = search;
    return p;
  }, [page, sortBy, search, fetchKey]);

  const { data: customersData } = useMerchantFetch<CustomersResponse>(
    "/api/merchant/customers",
    fetchParams
  );

  const customers = customersData?.data ?? [];
  const pagination = customersData?.pagination;
  const acquisitionRate = customersData?.acquisition_rate;
  const portfolioValue = customersData?.portfolio_value ?? 0;

  const formatGHS = (amount: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2 }).format(amount);

  return (
    <>
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
                Customer Directory
              </h1>
              <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
                Manage institutional client relationships, track high-velocity spending patterns, and monitor verification lifecycles.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                Add Customer
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-[color:var(--trite-muted)]">{pagination?.total ?? 0} customers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[color:var(--trite-muted)]">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[color:var(--trite-ink)] outline-none"
              >
                <option value="recent">Recent Activity</option>
                <option value="volume">Total Volume</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-6">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Customer Entity
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Tier
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Total Volume
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-black/5 last:border-b-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
                          {(customer.name || customer.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[color:var(--trite-ink)]">{customer.name || customer.email.split("@")[0]}</div>
                          <div className="text-xs text-[color:var(--trite-muted)]">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tierColors[customer.tier]}`}>
                        {tierLabels[customer.tier]}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="font-semibold text-[color:var(--trite-ink)]">{formatGHS(customer.total_spent)}</div>
                      <div className="text-xs text-[color:var(--trite-muted)]">{customer.transaction_count} txns</div>
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setEditName(customer.name || "");
                            setEditEmail(customer.email);
                            setEditTier(customer.tier);
                            setEditVolume(customer.total_spent.toString());
                            setEditModalOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === customer.id ? null : customer.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
                          >
                            <MoreVerticalIcon className="h-4 w-4" />
                          </button>
                          {actionMenuOpen === customer.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setEditingCustomer(customer);
                                    setEditName(customer.name || "");
                                    setEditEmail(customer.email);
                                    setEditTier(customer.tier);
                                    setEditVolume(customer.total_spent.toString());
                                    setEditModalOpen(true);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-[color:var(--trite-ink)] hover:bg-black/[0.03] flex items-center gap-2"
                                >
                                  <EditIcon className="h-4 w-4" />
                                  Edit Customer
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${customer.name}?`)) {
                                      // Handle delete
                                    }
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td
                      className="py-10 text-center text-sm text-[color:var(--trite-muted)]"
                      colSpan={4}
                    >
                      No customers found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-[color:var(--trite-muted)]">
                Showing {customers.length} of {pagination?.total ?? 0} customers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-40"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--trite-ink)] text-xs font-medium text-white">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination?.total_pages ?? 1, p + 1))}
                  disabled={page >= (pagination?.total_pages ?? 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-40"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                  Acquisition Rate
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[color:var(--trite-lime)]">
                  <TrendingUpIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-[color:var(--trite-ink)]">
                {acquisitionRate ? `${acquisitionRate.percentage >= 0 ? "+" : ""}${acquisitionRate.percentage}%` : "—"}
              </div>
              <div className="mt-1 text-xs text-[color:var(--trite-muted)]">
                {acquisitionRate ? `${acquisitionRate.this_month} this month · ${acquisitionRate.last_month} last month` : "New customer onboarding vs last month"}
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-black/[0.04]">
                <div
                  className="h-1.5 rounded-full bg-[color:var(--trite-lime-strong)] transition-all duration-500"
                  style={{
                    // This month's acquisitions relative to the stronger month
                    width: `${acquisitionRate
                      ? Math.round(
                          (acquisitionRate.this_month /
                            Math.max(acquisitionRate.this_month, acquisitionRate.last_month, 1)) * 100
                        )
                      : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Portfolio Value
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-white/20">
                  <TrendingUpIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-bold">{formatGHS(portfolioValue)}</div>
              <div className="mt-1 text-xs text-white/60">Total Managed Assets (GHS)</div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-8 flex-1 rounded bg-white/10" />
                <div className="h-8 flex-1 rounded bg-white/20" />
                <div className="h-8 flex-1 rounded bg-white/30" />
                <div className="h-8 flex-1 rounded bg-white/40" />
                <div className="h-8 flex-1 rounded bg-white/50" />
              </div>
            </div>
          </div>
        </div>
      {/* Edit Customer Modal */}
      {editModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">Edit Customer</h2>
                <p className="text-xs text-[color:var(--trite-muted)]">Update customer details</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Enter Name"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g., example@gmail.com"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Customer Tier</label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value as CustomerTier)}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="enterprise">Enterprise (Tier 2)</option>
                  <option value="institutional">Institutional (Tier 1)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Volume (GHS)</label>
                <input
                  type="number"
                  value={editVolume}
                  onChange={(e) => setEditVolume(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>


            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editName && editEmail && editingCustomer) {
                    setEditModalOpen(false);
                    setEditingCustomer(null);
                  }
                }}
                disabled={!editName || !editEmail}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">Add Customer</h2>
                <p className="text-xs text-[color:var(--trite-muted)]">Create a new customer record</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Full Name</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g., Enter Name"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Email Address</label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  placeholder="e.g., example@gmail.com"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Phone Number</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="e.g., +233 24 123 4567"
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--trite-ink)]">Customer Tier</label>
                <select
                  value={newCustomerTier}
                  onChange={(e) => setNewCustomerTier(e.target.value as CustomerTier)}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="enterprise">Enterprise (Tier 2)</option>
                  <option value="institutional">Institutional (Tier 1)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setAddModalOpen(false)}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newCustomerEmail) return;
                  setAddLoading(true);
                  try {
                    const res = await fetch("/api/merchant/customers", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: newCustomerName || null,
                        email: newCustomerEmail,
                        phone: newCustomerPhone || null,
                        tier: newCustomerTier,
                      }),
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      alert(err.error || "Failed to add customer");
                      return;
                    }
                    // Reset form and refetch
                    setNewCustomerName("");
                    setNewCustomerEmail("");
                    setNewCustomerPhone("");
                    setNewCustomerTier("standard");
                    setAddModalOpen(false);
                    setFetchKey((k) => k + 1);
                  } catch {
                    alert("Network error — please try again");
                  } finally {
                    setAddLoading(false);
                  }
                }}
                disabled={!newCustomerEmail || addLoading}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLoading ? "Adding…" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TierChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors ${
        active
          ? "bg-[color:var(--trite-ink)] text-white"
          : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"
      }`}
    >
      {label}
    </button>
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="6 9 12 15 18 9" />
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
