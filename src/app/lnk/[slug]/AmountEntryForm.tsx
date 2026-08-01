"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AmountEntryFormProps {
  slug: string;
  merchantName: string;
  title: string;
  description: string | null;
  currency: string;
}

export default function AmountEntryForm({
  slug,
  merchantName,
  title,
  description,
  currency,
}: AmountEntryFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/link-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start checkout. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/pay/${data.session_id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-8 sm:p-10 ring-1 ring-black/5 w-full">
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-muted)]">
        Pay to Merchant
      </div>
      <h2 className="mt-1 text-xl font-bold text-[color:var(--trite-ink)]">{merchantName}</h2>
      <p className="mt-3 text-sm font-semibold text-[color:var(--trite-ink)]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[color:var(--trite-muted)]">{description}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-[color:var(--trite-ink)]">
            Amount to Pay ({currency})
          </label>
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[color:var(--trite-muted)]">
              {currency}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-black/20 pl-16 pr-4 py-3.5 text-lg font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#22c55e] transition-all"
            />
          </div>
          <p className="mt-1.5 text-xs text-[color:var(--trite-muted)]">
            The merchant has left the amount up to you.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 border border-red-100">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#22c55e] py-4 text-sm font-bold text-white hover:bg-[#1ea74f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Starting Checkout..." : "Continue to Payment"}
        </button>
      </form>
    </div>
  );
}
