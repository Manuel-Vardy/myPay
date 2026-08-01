"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";

type ScheduleData = {
  payout_time: string; // "HH:MM" GMT
  payout_threshold: number | null; // GHS; null = disabled
  withdrawal_age_hours: number; // 0 = aging disabled
};

export default function SettlementScheduleTab() {
  const { data, loading, error, mutate } = useAdminFetch<ScheduleData>(
    "/api/admin/settlement-schedule"
  );

  const [form, setForm] = useState({
    payoutTime: "18:00",
    payoutThreshold: "",
    withdrawalAgeHours: "24",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        payoutTime: data.payout_time,
        payoutThreshold: data.payout_threshold != null ? String(data.payout_threshold) : "",
        withdrawalAgeHours: String(data.withdrawal_age_hours ?? 24),
      });
    }
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settlement-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payout_time: form.payoutTime,
          payout_threshold: form.payoutThreshold === "" ? null : Number(form.payoutThreshold),
          withdrawal_age_hours: Number(form.withdrawalAgeHours),
        }),
      });
      if (res.ok) {
        toast.success("Settlement schedule updated");
        mutate();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update settlement schedule");
      }
    } catch {
      toast.error("Failed to update settlement schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--trite-lime-strong)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load settlement schedule: {error}</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-[color:var(--trite-muted)]">
        Merchant payouts run automatically on whichever happens first: the daily payout time,
        or the moment a merchant&apos;s available balance reaches the payout threshold.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[color:var(--trite-ink)]">
            Default Payout Time (GMT)
          </label>
          <input
            type="time"
            value={form.payoutTime}
            onChange={(e) => setForm({ ...form, payoutTime: e.target.value })}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
          />
          <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
            Daily auto-settlement runs once at this time for every merchant with a balance.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--trite-ink)]">
            Default Payout Threshold (GHS)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.payoutThreshold}
            onChange={(e) => setForm({ ...form, payoutThreshold: e.target.value })}
            placeholder="e.g. 5000.00"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] placeholder:text-gray-400 outline-none focus:border-[color:var(--trite-lime-strong)]"
          />
          <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
            Balances at or above this amount are paid out immediately. Leave empty to disable
            threshold-triggered payouts.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--trite-ink)]">
            Withdrawal Aging Window (hours)
          </label>
          <input
            type="number"
            min="0"
            max="720"
            step="1"
            value={form.withdrawalAgeHours}
            onChange={(e) => setForm({ ...form, withdrawalAgeHours: e.target.value })}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
          />
          <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
            Payments must sit in the merchant float this many hours before they can be
            withdrawn or auto-settled. Set 0 to make funds withdrawable immediately.
          </p>
        </div>
      </div>

      <div className="flex justify-end border-t border-black/5 pt-4">
        <button
          onClick={save}
          disabled={saving || !form.payoutTime || form.withdrawalAgeHours === ""}
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}
