"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle, ChevronDown } from "lucide-react";
import { fromMinorUnits } from "@/lib/utils";

type TxEvent = {
  id: string;
  from_status: string | null;
  to_status: string;
  triggered_by: string;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
};

type TxDetail = {
  id: string;
  tx_id_display: string;
  merchant_name?: string | null;
  merchant_display_id?: string | null;
  amount: number | string;
  currency: string;
  crypto_amount: string | null;
  crypto_currency: string | null;
  crypto_network_hash: string | null;
  method: string;
  rail: string | null;
  status: string;
  failure_reason: string | null;
  processing_fee: number | string;
  gateway_reference: string | null;
  momo_reference: string | null;
  payer_email: string | null;
  payer_phone: string | null;
  payer_wallet_address: string | null;
  metadata: Record<string, unknown> | string | null;
  created_at: string;
  updated_at: string;
};

/** metadata may arrive as a JSON string or an object depending on the driver. */
function parseMetadata(raw: TxDetail["metadata"]): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function statusChipClass(status: string) {
  switch (status) {
    case "SETTLED":
    case "CAPTURED":
    case "PARTIALLY_CAPTURED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "AUTHORIZED":
    case "AUTHENTICATED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "INITIATED":
    case "PENDING_AUTH":
    case "PENDING_SETTLEMENT":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "FAILED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function dotClass(status: string) {
  switch (status) {
    case "SETTLED":
    case "CAPTURED":
      return "bg-emerald-500";
    case "AUTHORIZED":
    case "AUTHENTICATED":
      return "bg-blue-500";
    case "FAILED":
      return "bg-red-500";
    case "EXPIRED":
    case "CANCELLED":
    case "REVERSED":
      return "bg-gray-400";
    default:
      return "bg-amber-500";
  }
}

/** Human-readable line from an event's raw provider payload, if any. */
function eventMessage(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const msg =
    payload.providerMessage ?? payload.provider_message ?? payload.networkHash;
  if (typeof msg === "string" && msg.trim()) return msg;
  return null;
}

export function TransactionTimeline({ events }: { events: TxEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-black/5 bg-black/[0.01] p-4 text-sm text-[color:var(--trite-muted)]">
        No status events recorded for this transaction.
      </p>
    );
  }

  return (
    <ol className="relative ml-2 border-l border-black/10">
      {events.map((ev) => {
        const message = eventMessage(ev.raw_payload);
        return (
          <li key={ev.id} className="relative pb-5 pl-5 last:pb-0">
            <span
              className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${dotClass(ev.to_status)}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusChipClass(ev.to_status)}`}
              >
                {ev.to_status.toLowerCase()}
              </span>
              {ev.from_status && (
                <span className="text-[10px] uppercase tracking-wider text-[color:var(--trite-muted)]">
                  from {ev.from_status.toLowerCase()}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
              {new Date(ev.created_at).toLocaleString()} · {ev.triggered_by}
            </p>
            {message && (
              <p className="mt-1 text-xs text-[color:var(--trite-ink)]">{message}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface TransactionDetailModalProps {
  /** Transaction UUID to show; null = closed. */
  txId: string | null;
  /** "/api/admin/transactions" or "/api/merchant/transactions" */
  endpointBase: string;
  onClose: () => void;
}

export default function TransactionDetailModal({
  txId,
  endpointBase,
  onClose,
}: TransactionDetailModalProps) {
  if (!txId) return null;
  // key remounts the inner modal per transaction, resetting its fetch state
  return (
    <TransactionDetailModalInner
      key={txId}
      txId={txId}
      endpointBase={endpointBase}
      onClose={onClose}
    />
  );
}

function TransactionDetailModalInner({
  txId,
  endpointBase,
  onClose,
}: TransactionDetailModalProps & { txId: string }) {
  const [detail, setDetail] = useState<{ transaction: TxDetail; events: TxEvent[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${endpointBase}/${txId}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) setError(json.error);
        else setDetail(json);
      })
      .catch(() => !cancelled && setError("Failed to load transaction detail"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [txId, endpointBase]);

  const tx = detail?.transaction;
  const formatMoney = (v: number | string, currency: string) =>
    `${currency} ${fromMinorUnits(v).toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const metadata = tx ? parseMetadata(tx.metadata) : null;
  const momoNumber =
    tx?.method === "MOBILE_MONEY" && typeof metadata?.mobile_money_number === "string"
      ? metadata.mobile_money_number
      : null;
  const momoNetwork =
    typeof metadata?.mobile_money_network === "string" ? metadata.mobile_money_network : null;

  const summaryRows: [string, string][] = tx
    ? ([
        ["Amount", formatMoney(tx.amount, tx.currency)],
        ["Processing Fee", formatMoney(tx.processing_fee, tx.currency)],
        ["Method", tx.rail ? `${tx.method} · ${tx.rail}` : tx.method],
        tx.merchant_name
          ? ["Merchant", `${tx.merchant_name} (${tx.merchant_display_id ?? ""})`]
          : null,
        momoNumber
          ? ["Mobile Number", momoNetwork ? `${momoNumber} (${momoNetwork})` : momoNumber]
          : null,
        tx.payer_email ? ["Payer Email", tx.payer_email] : null,
        tx.payer_phone ? ["Payer Phone", tx.payer_phone] : null,
        tx.payer_wallet_address ? ["Payer Wallet", tx.payer_wallet_address] : null,
        tx.gateway_reference ? ["Gateway Ref", tx.gateway_reference] : null,
        tx.momo_reference ? ["MoMo Ref", tx.momo_reference] : null,
        tx.method === "CRYPTO" && tx.crypto_amount && tx.crypto_currency
          ? ["Crypto", `${Number(tx.crypto_amount)} ${tx.crypto_currency}`]
          : null,
        tx.method === "CRYPTO" && tx.crypto_network_hash
          ? ["Network Hash", tx.crypto_network_hash]
          : null,
        ["Created", new Date(tx.created_at).toLocaleString()],
      ].filter(Boolean) as [string, string][])
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-[color:var(--trite-ink)]">
              Transaction Detail
            </h3>
            <p className="mt-0.5 text-xs font-mono text-[color:var(--trite-muted)]">
              {tx?.tx_id_display ?? txId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {tx && (
              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusChipClass(tx.status)}`}
              >
                {tx.status.toLowerCase()}
              </span>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[color:var(--trite-muted)] hover:bg-black/5 hover:text-[color:var(--trite-ink)] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {loading && (
            <p className="text-sm text-[color:var(--trite-muted)]">Loading…</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {tx && (
            <>
              {tx.failure_reason && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                      Failure Reason
                    </p>
                    <p className="mt-1 text-sm text-red-700">{tx.failure_reason}</p>
                  </div>
                </div>
              )}

              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {summaryRows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                      {label}
                    </dt>
                    <dd className="mt-0.5 break-all text-sm text-[color:var(--trite-ink)]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                  Progress
                </p>
                <TransactionTimeline events={detail?.events ?? []} />
              </div>

              {metadata && Object.keys(metadata).length > 0 && (
                <details className="group rounded-xl border border-black/5 bg-black/[0.01]">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                      Metadata
                    </span>
                    <ChevronDown className="h-4 w-4 text-[color:var(--trite-muted)] transition-transform group-open:rotate-180" />
                  </summary>
                  <pre className="overflow-x-auto border-t border-black/5 px-4 py-3 text-xs leading-relaxed text-[color:var(--trite-ink)]">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
