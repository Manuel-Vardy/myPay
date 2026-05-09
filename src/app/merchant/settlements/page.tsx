"use client";

import { useState } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";
import { useRouter } from "next/navigation";

export type APISettlementAccount = {
  id: string;
  account_type: "BANK" | "MOBILE_WALLET";
  provider_name: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
};

export type APISettlement = {
  id: string;
  merchant_id: string;
  settlement_id_display: string;
  date_range_start: string;
  date_range_end: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  account_id?: string;
  account?: APISettlementAccount | null;
  created_at: string;
};

// SVG Icons
function DownloadIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>; }
function ReceiptIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M9 14h6m-6-4h6M9 10h.01M9 14h.01M5 21l3-3 3 3 3-3 3 3V3H5v18z" /></svg>; }
function PlusIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>; }
function BankIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3l9 7H3l9-7z" /></svg>; }
function SmartphoneIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>; }
function TrashIcon({ className }: { className?: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>; }

function formatGHS(amount: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
}

export default function SettlementsPage() {
  const router = useRouter();
  const [ledgerFilter, setLedgerFilter] = useState<"all" | "deposits" | "withdrawals" | "transfers">("all");
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    account_type: "BANK",
    provider_name: "",
    account_name: "",
    account_number: "",
    branch_code: "",
    is_default: false,
  });

  const { data: fetchRes, loading, error } = useMerchantFetch<{ 
    data: APISettlement[]; 
    summary: { status: string; gross: number; fees: number; net: number; count: number }[];
    pagination: any;
  }>(
    "/api/merchant/settlements",
    { page: page.toString(), per_page: "20" }
  );

  const { data: accountsRes, loading: accountsLoading } = useMerchantFetch<{ data: APISettlementAccount[] }>("/api/merchant/settlement-accounts");

  const settlements = fetchRes?.data ?? [];
  const accounts = accountsRes?.data ?? [];

  // Derived metrics from summary API
  let totalSettlements = 0;
  let totalFees = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  let stablecoinTotal = 0; // Mock this or derive if currency field exists. For now, 0.

  if (fetchRes?.summary) {
    fetchRes.summary.forEach(stat => {
      if (stat.status === "COMPLETED") {
        totalSettlements += Number(stat.net);
        totalFees += Number(stat.fees);
      } else if (stat.status === "PENDING" || stat.status === "PROCESSING") {
        pendingAmount += Number(stat.net);
        pendingCount += Number(stat.count);
      }
    });
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to remove this account?")) return;
    try {
      const res = await fetch(`/api/merchant/settlement-accounts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) alert(json.error);
      else router.refresh(); // Or a mutate call if we used SWR. For now, router.refresh handles server components but since useMerchantFetch is client side, let's just force reload.
      window.location.reload();
    } catch (e: any) {
      alert("Failed to delete");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/merchant/settlement-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.error) {
        setErrorMsg(json.error);
      } else {
        setAddModalOpen(false);
        setForm({ account_type: "BANK", provider_name: "", account_name: "", account_number: "", branch_code: "", is_default: false });
        window.location.reload();
      }
    } catch (e: any) {
      setErrorMsg("Failed to add account");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Accounting
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
            Settlement Reports
          </h1>
          <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Manage payout accounts and track completed settlements</p>
        </div>
        <div className="flex gap-2">
          <button className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
            <ReceiptIcon className="h-4 w-4" />
            Download PDF
          </button>
          <button className="flex h-10 items-center gap-2 rounded-lg bg-[color:var(--trite-ink)] px-4 text-sm font-semibold text-white hover:bg-black">
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Settlement Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[color:var(--trite-muted)]">Total Completed</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">{formatGHS(totalSettlements)}</div>
          <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Lifetime settled volume</div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[color:var(--trite-muted)]">Stablecoin Volume</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">$0.00</div>
          <div className="mt-1 text-xs text-[color:var(--trite-muted)]">Pending USDT settlement mix</div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[color:var(--trite-muted)]">Pending</span>
            {pendingCount > 0 && (
               <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
               Processing
             </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">{formatGHS(pendingAmount)}</div>
          <div className="mt-1 text-xs text-[color:var(--trite-muted)]">{pendingCount} in queue</div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[color:var(--trite-muted)]">Total Fees</span>
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
              Avg 1.0%
            </span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--trite-ink)]">{formatGHS(totalFees)}</div>
          <div className="mt-1 text-xs text-[color:var(--trite-muted)]">All time network fees</div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--trite-ink)]">Settlement Accounts</h2>
            <p className="text-xs text-[color:var(--trite-muted)]">Saved destinations for payouts</p>
          </div>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[color:var(--trite-lime-strong)] px-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Account
          </button>
        </div>

        {accountsLoading ? (
          <div className="text-sm text-[color:var(--trite-muted)] py-4 text-center">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="text-sm text-[color:var(--trite-muted)] py-6 text-center border-t border-black/5">
            No settlement accounts configured. Add one to receive automatic payouts.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="relative flex p-4 rounded-xl border border-black/10 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  {acc.account_type === "BANK" ? <BankIcon className="h-5 w-5 text-blue-600" /> : <SmartphoneIcon className="h-5 w-5 text-green-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-[color:var(--trite-ink)]">{acc.provider_name}</h3>
                    {acc.is_default && (
                      <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-blue-700">Default</span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-xs font-medium text-[color:var(--trite-ink)]">{acc.account_name}</div>
                  <div className="mt-0.5 text-xs text-[color:var(--trite-muted)]">{acc.account_number}</div>
                </div>
                <button 
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  aria-label="Delete account"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button onClick={() => setLedgerFilter("all")} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${ledgerFilter === "all" ? "bg-[color:var(--trite-ink)] text-white" : "bg-black/[0.04] text-[color:var(--trite-ink)] hover:bg-black/[0.06]"}`}>All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#f8f9fa]">
              <tr className="text-left border-b border-black/5">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Date</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Settlement ID</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Account</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Status</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Gross</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Fee</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Net</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-black/5 last:border-b-0 hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[color:var(--trite-ink)]">
                      {new Date(s.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-[color:var(--trite-ink)]">{s.settlement_id_display}</div>
                  </td>
                  <td className="px-5 py-4">
                    {s.account ? (
                      <div>
                        <div className="font-medium text-[color:var(--trite-ink)]">{s.account.provider_name}</div>
                        <div className="text-xs text-[color:var(--trite-muted)]">{s.account.account_number}</div>
                      </div>
                    ) : (
                      <span className="text-[color:var(--trite-muted)] italic">Manual</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${
                      s.status === "COMPLETED" ? "bg-[color:var(--trite-lime)]/20 text-[color:var(--trite-ink)]" : "bg-amber-100 text-amber-700"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.status === "COMPLETED" ? "bg-[color:var(--trite-lime-strong)]" : "bg-amber-500"}`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-[color:var(--trite-ink)]">{formatGHS(s.gross_amount)}</td>
                  <td className="px-5 py-4 text-right text-xs font-medium text-red-500">-{formatGHS(s.fees)}</td>
                  <td className="px-5 py-4 text-right font-bold text-[color:var(--trite-ink)]">{formatGHS(s.net_amount)}</td>
                </tr>
              ))}
              {settlements.length === 0 && !loading && (
                <tr>
                  <td className="py-12 text-center text-sm text-[color:var(--trite-muted)]" colSpan={7}>
                    No settlements found matching.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {settlements.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-[color:var(--trite-muted)]">
              Page {fetchRes?.pagination?.page} of {fetchRes?.pagination?.total_pages}
            </div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page-1)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[color:var(--trite-muted)] disabled:opacity-50 hover:bg-black/[0.02]">
                Previous
              </button>
              <button disabled={page >= (fetchRes?.pagination?.total_pages ?? 0)} onClick={() => setPage(page+1)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-[color:var(--trite-ink)]">Add Settlement Account</h2>
            {errorMsg && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errorMsg}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[color:var(--trite-ink)]">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm({...form, account_type: "BANK"})} className={`border p-2 rounded-lg text-sm font-medium ${form.account_type === "BANK" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>Bank Account</button>
                  <button type="button" onClick={() => setForm({...form, account_type: "MOBILE_WALLET"})} className={`border p-2 rounded-lg text-sm font-medium ${form.account_type === "MOBILE_WALLET" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}>Mobile Wallet</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[color:var(--trite-ink)]">Provider Name</label>
                <input required type="text" value={form.provider_name} onChange={(e) => setForm({...form, provider_name: e.target.value})} placeholder={form.account_type === "BANK" ? "e.g. GCB Bank" : "e.g. MTN MoMo"} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[color:var(--trite-ink)]">Account Name</label>
                <input required type="text" value={form.account_name} onChange={(e) => setForm({...form, account_name: e.target.value})} placeholder="Matches ID/Business Registration" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[color:var(--trite-ink)]">Account Number</label>
                <input required type="text" value={form.account_number} onChange={(e) => setForm({...form, account_number: e.target.value})} placeholder={form.account_type === "BANK" ? "Bank Account Number" : "Mobile Number"} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]" />
              </div>

              {form.account_type === "BANK" && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[color:var(--trite-ink)]">Branch Code (Optional)</label>
                  <input type="text" value={form.branch_code} onChange={(e) => setForm({...form, branch_code: e.target.value})} placeholder="Optional branch/sort code" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]" />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm({...form, is_default: e.target.checked})} className="h-4 w-4 rounded border-gray-300 accent-[color:var(--trite-ink)]" />
                <label htmlFor="is_default" className="text-sm font-medium text-[color:var(--trite-ink)]">Set as default payout account</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={adding} className="px-4 py-2 text-sm font-semibold bg-[color:var(--trite-ink)] text-white rounded-lg hover:bg-black disabled:opacity-50">
                  {adding ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
