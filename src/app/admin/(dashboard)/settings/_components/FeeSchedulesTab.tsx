"use client";

import { useState } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";

type MerchantOption = {
  id: string;
  business_name: string;
  merchant_display_id: string;
};

export type FeeScheduleRecord = {
  id: string;
  fee_type: string;
  description: string | null;
  calculation_method: string;
  flat_amount: number | string;
  percentage_rate: number | string;
  currency: string;
  minimum_amount: number | string | null;
  maximum_amount: number | string | null;
  applicability: string;
  merchant_tier: string | null;
  merchant_id: string | null;
  merchant_name: string | null;
  applicable_methods: string[] | null;
  tiered_bands: { from: number; to: number | null; rate: number }[] | null;
  is_active: boolean;
  valid_until: string | null;
};

export type FeeSchedulesData = {
  schedules: FeeScheduleRecord[];
  merchants: MerchantOption[];
};

const FEE_TYPES = [
  "PAYMENT_PROCESSING",
  "PAYMENT_GATEWAY",
  "CROSS_BORDER",
  "CRYPTO_NETWORK_GAS",
  "THREE_DS_AUTH",
  "CHARGEBACK",
  "REFUND_PROCESSING",
  "SETTLEMENT_TRANSFER",
  "SETTLEMENT_FX",
  "EARLY_SETTLEMENT",
  "SETTLEMENT_MINIMUM_SHORTFALL",
  "MONTHLY_PLATFORM",
  "API_CALL_OVERAGE",
  "DISPUTE_MANAGEMENT",
  "KYC_VERIFICATION",
];
const METHODS = ["CARD", "MOBILE_MONEY", "BANK_TRANSFER", "USSD", "CRYPTO"];
const TIERS = ["STANDARD", "PREMIUM", "ENTERPRISE"];

type FormState = {
  fee_type: string;
  description: string;
  calculation_method: string;
  flat_amount_major: string;
  percentage_rate: string;
  currency: string;
  minimum_amount_major: string;
  maximum_amount_major: string;
  applicability: string;
  merchant_tier: string;
  merchant_id: string;
  applicable_methods: string[];
  tiered_bands_json: string;
};

const EMPTY_FORM: FormState = {
  fee_type: "PAYMENT_PROCESSING",
  description: "",
  calculation_method: "PERCENTAGE",
  flat_amount_major: "0",
  percentage_rate: "0",
  currency: "GHS",
  minimum_amount_major: "",
  maximum_amount_major: "",
  applicability: "ALL_MERCHANTS",
  merchant_tier: "STANDARD",
  merchant_id: "",
  applicable_methods: [],
  tiered_bands_json: '[{"from": 0, "to": null, "rate": 1.5}]',
};

function labelize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function rateSummary(s: FeeScheduleRecord) {
  const flat = Number(s.flat_amount) / 100;
  const rate = Number(s.percentage_rate);
  switch (s.calculation_method) {
    case "FLAT":
      return `${s.currency} ${flat.toFixed(2)}`;
    case "PERCENTAGE":
      return `${rate}%`;
    case "FLAT_PLUS_PERCENTAGE":
      return `${s.currency} ${flat.toFixed(2)} + ${rate}%`;
    case "TIERED":
      return `Tiered (${s.tiered_bands?.length ?? 0} bands)`;
    default:
      return "—";
  }
}

function scopeSummary(s: FeeScheduleRecord) {
  if (s.applicability === "MERCHANT_TIER") return `${labelize(s.merchant_tier ?? "")} tier`;
  if (s.applicability === "MERCHANT_SPECIFIC") return s.merchant_name ?? "One merchant";
  return "All merchants";
}

interface FeeSchedulesTabProps {
  data: FeeSchedulesData | null;
  loading?: boolean;
  loadError?: string | null;
  refresh: () => void;
}

export default function FeeSchedulesTab({
  data,
  loading = false,
  loadError = null,
  refresh,
}: FeeSchedulesTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null); // "new" for create
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const schedules = data?.schedules ?? [];
  const merchants = data?.merchants ?? [];

  function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setEditingId("new");
  }

  function openEdit(s: FeeScheduleRecord) {
    setForm({
      fee_type: s.fee_type,
      description: s.description ?? "",
      calculation_method: s.calculation_method,
      flat_amount_major: (Number(s.flat_amount) / 100).toString(),
      percentage_rate: String(s.percentage_rate),
      currency: s.currency,
      minimum_amount_major:
        s.minimum_amount != null ? (Number(s.minimum_amount) / 100).toString() : "",
      maximum_amount_major:
        s.maximum_amount != null ? (Number(s.maximum_amount) / 100).toString() : "",
      applicability: s.applicability,
      merchant_tier: s.merchant_tier ?? "STANDARD",
      merchant_id: s.merchant_id ?? "",
      applicable_methods: s.applicable_methods ?? [],
      tiered_bands_json: JSON.stringify(s.tiered_bands ?? [], null, 0),
    });
    setError("");
    setEditingId(s.id);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMethod(method: string) {
    setForm((prev) => ({
      ...prev,
      applicable_methods: prev.applicable_methods.includes(method)
        ? prev.applicable_methods.filter((m) => m !== method)
        : [...prev.applicable_methods, method],
    }));
  }

  async function handleSave() {
    setError("");

    let tieredBands: unknown = null;
    if (form.calculation_method === "TIERED") {
      try {
        tieredBands = JSON.parse(form.tiered_bands_json);
        if (!Array.isArray(tieredBands)) throw new Error();
      } catch {
        setError("Tiered bands must be a valid JSON array.");
        return;
      }
    }

    const payload = {
      fee_type: form.fee_type,
      description: form.description || null,
      calculation_method: form.calculation_method,
      flat_amount: Math.round(Number(form.flat_amount_major || 0) * 100),
      percentage_rate: Number(form.percentage_rate || 0),
      currency: form.currency,
      minimum_amount: form.minimum_amount_major
        ? Math.round(Number(form.minimum_amount_major) * 100)
        : null,
      maximum_amount: form.maximum_amount_major
        ? Math.round(Number(form.maximum_amount_major) * 100)
        : null,
      applicability: form.applicability,
      merchant_tier: form.merchant_tier,
      merchant_id: form.merchant_id || null,
      applicable_methods: form.applicable_methods,
      tiered_bands: tieredBands,
    };

    setSaving(true);
    try {
      const isNew = editingId === "new";
      const res = await fetch(
        isNew ? "/api/admin/fee-schedules" : `/api/admin/fee-schedules/${editingId}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        refresh();
        setEditingId(null);
      } else {
        const err = await res.json();
        setError(err.error ?? "Save failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      const res = await fetch(`/api/admin/fee-schedules/${id}`, { method: "DELETE" });
      if (res.ok) refresh();
    } catch {
      // list refresh will surface state; nothing else to do
    }
  }

  const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[#22c55e] transition-colors";
  const labelClass =
    "block text-xs font-semibold text-[color:var(--trite-muted)] uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--trite-muted)]">
          Fee rules resolve in order: merchant-specific, then tier, then platform-wide.
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-[#22c55e] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1ea74f] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Schedule
        </button>
      </div>

      {/* Load failure (e.g. expired session) — distinct from "no records" */}
      {loadError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Could not load fee schedules: {loadError}
          </p>
          <button
            onClick={refresh}
            className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Schedule list */}
      <div className="space-y-2">
        {loading && !data && (
          <p className="rounded-xl border border-black/5 bg-black/[0.01] p-4 text-sm text-[color:var(--trite-muted)]">
            Loading fee schedules…
          </p>
        )}
        {!loading && !loadError && schedules.length === 0 && (
          <p className="rounded-xl border border-black/5 bg-black/[0.01] p-4 text-sm text-[color:var(--trite-muted)]">
            No fee schedules configured. Payments will settle without platform fees.
          </p>
        )}
        {schedules.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[color:var(--trite-ink)]">
                  {labelize(s.fee_type)}
                </p>
                {!s.is_active && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)] bg-black/5 px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[color:var(--trite-muted)] truncate">
                {rateSummary(s)} · {scopeSummary(s)}
                {s.applicable_methods?.length
                  ? ` · ${s.applicable_methods.map(labelize).join(", ")}`
                  : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => openEdit(s)}
                className="flex items-center gap-1 rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02] transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
              {s.is_active && (
                <button
                  onClick={() => handleDeactivate(s.id)}
                  className="flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <XCircle className="h-3 w-3" />
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / edit form */}
      {editingId && (
        <div className="rounded-2xl border border-black/5 bg-white p-4 space-y-4">
          <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">
            {editingId === "new" ? "New Fee Schedule" : "Edit Fee Schedule"}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Fee Type</label>
              <select
                value={form.fee_type}
                onChange={(e) => set("fee_type", e.target.value)}
                className={inputClass}
              >
                {FEE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {labelize(t)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Calculation</label>
              <select
                value={form.calculation_method}
                onChange={(e) => set("calculation_method", e.target.value)}
                className={inputClass}
              >
                <option value="FLAT">Flat</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT_PLUS_PERCENTAGE">Flat + Percentage</option>
                <option value="TIERED">Tiered</option>
              </select>
            </div>

            {(form.calculation_method === "FLAT" ||
              form.calculation_method === "FLAT_PLUS_PERCENTAGE") && (
              <div>
                <label className={labelClass}>Flat Amount ({form.currency})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.flat_amount_major}
                  onChange={(e) => set("flat_amount_major", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            {(form.calculation_method === "PERCENTAGE" ||
              form.calculation_method === "FLAT_PLUS_PERCENTAGE") && (
              <div>
                <label className={labelClass}>Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="99.9999"
                  step="0.0001"
                  value={form.percentage_rate}
                  onChange={(e) => set("percentage_rate", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            {form.calculation_method === "TIERED" && (
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Tiered Bands (JSON — amounts in minor units)
                </label>
                <textarea
                  rows={3}
                  value={form.tiered_bands_json}
                  onChange={(e) => set("tiered_bands_json", e.target.value)}
                  className={`${inputClass} font-mono text-xs`}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className={inputClass}
              >
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Applies To</label>
              <select
                value={form.applicability}
                onChange={(e) => set("applicability", e.target.value)}
                className={inputClass}
              >
                <option value="ALL_MERCHANTS">All merchants</option>
                <option value="MERCHANT_TIER">A merchant tier</option>
                <option value="MERCHANT_SPECIFIC">A specific merchant</option>
              </select>
            </div>

            {form.applicability === "MERCHANT_TIER" && (
              <div>
                <label className={labelClass}>Merchant Tier</label>
                <select
                  value={form.merchant_tier}
                  onChange={(e) => set("merchant_tier", e.target.value)}
                  className={inputClass}
                >
                  {TIERS.map((t) => (
                    <option key={t} value={t}>
                      {labelize(t)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {form.applicability === "MERCHANT_SPECIFIC" && (
              <div>
                <label className={labelClass}>Merchant</label>
                <select
                  value={form.merchant_id}
                  onChange={(e) => set("merchant_id", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a merchant…</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.business_name} ({m.merchant_display_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>Minimum Fee ({form.currency}, optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minimum_amount_major}
                onChange={(e) => set("minimum_amount_major", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Maximum Fee ({form.currency}, optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.maximum_amount_major}
                onChange={(e) => set("maximum_amount_major", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Payment Methods (none = all)</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {METHODS.map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-black/[0.01] px-3 py-2 cursor-pointer hover:bg-black/[0.03] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.applicable_methods.includes(m)}
                      onChange={() => toggleMethod(m)}
                      className="h-3.5 w-3.5 rounded accent-[#22c55e]"
                    />
                    <span className="text-xs text-[color:var(--trite-ink)]">{labelize(m)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-[#22c55e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ea74f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {editingId === "new" ? "Create Schedule" : "Save Changes"}
            </button>
            <button
              onClick={() => setEditingId(null)}
              disabled={saving}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
