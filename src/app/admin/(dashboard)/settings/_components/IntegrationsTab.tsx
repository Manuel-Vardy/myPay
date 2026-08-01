"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Copy, Check, Settings2, ShieldCheck, CreditCard, Coins } from "lucide-react";

type ProviderConfig = {
  id: string;
  label: string;
  description: string;
  defaultWebhookUrl: string;
  eventTypes: { value: string; label: string }[];
};

// Provider webhooks always target the payments API deployment (api.xx.com),
// never the admin portal's own host — same base URL merchants use for
// /api/v1/*. Falls back to localhost for dev.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const PROVIDERS: ProviderConfig[] = [
  {
    id: "triton",
    label: "Triton",
    description: "Crypto settlement provider. Registers webhooks directly with Triton's API.",
    defaultWebhookUrl: `${API_BASE_URL}/api/webhooks/triton`,
    eventTypes: [
      { value: "invoice.paid",       label: "Invoice Paid" },
      { value: "invoice.settled",    label: "Invoice Settled" },
      { value: "transfer.completed", label: "Transfer Completed" },
      { value: "transfer.failed",    label: "Transfer Failed" },
    ],
  },
  {
    id: "moolre",
    label: "Moolre",
    description: "Mobile money provider. Saves the webhook URL Moolre will call on payment events.",
    defaultWebhookUrl: `${API_BASE_URL}/api/webhooks/moolre`,
    eventTypes: [
      { value: "payment.success", label: "Payment Success" },
      { value: "payment.failed",  label: "Payment Failed" },
      { value: "payment.pending", label: "Payment Pending" },
    ],
  },
  {
    id: "anm",
    label: "AppsNMobile (Orchard)",
    description: "Backup mobile money provider. Orchard API integration.",
    defaultWebhookUrl: `${API_BASE_URL}/api/webhooks/anm`,
    eventTypes: [
      { value: "payment.success", label: "Payment Success" },
      { value: "payment.failed",  label: "Payment Failed" },
    ],
  },
];

type WebhookRecord = {
  provider: string;
  id: string;
  url: string;
  eventTypes: string[];
};

type FormEntry = { url: string; eventTypes: string[] };

interface IntegrationsTabProps {
  webhooks: WebhookRecord[] | null;
  refreshWebhooks: () => void;
}

export default function IntegrationsTab({ webhooks, refreshWebhooks }: IntegrationsTabProps) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, FormEntry>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // MoMo Configuration State
  const [activeMomoProvider, setActiveMomoProvider] = useState<string>("moolre");
  const [fallbackEnabled, setFallbackEnabled] = useState<boolean>(false);
  const [momoConfigLoading, setMomoConfigLoading] = useState<boolean>(true);
  const [momoConfigSaving, setMomoConfigSaving] = useState<boolean>(false);
  const [momoConfigError, setMomoConfigError] = useState<string | null>(null);

  // Card Payments Toggle State
  const [cardEnabled, setCardEnabled] = useState<boolean>(false);
  const [cardConfigLoading, setCardConfigLoading] = useState<boolean>(true);
  const [cardConfigSaving, setCardConfigSaving] = useState<boolean>(false);
  const [cardConfigError, setCardConfigError] = useState<string | null>(null);

  // Crypto Payments Toggle State (crypto is live via Triton, so default on)
  const [cryptoEnabled, setCryptoEnabled] = useState<boolean>(true);
  const [cryptoConfigLoading, setCryptoConfigLoading] = useState<boolean>(true);
  const [cryptoConfigSaving, setCryptoConfigSaving] = useState<boolean>(false);
  const [cryptoConfigError, setCryptoConfigError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMomoConfig() {
      try {
        const res = await fetch("/api/admin/integrations/momo");
        if (res.ok) {
          const data = await res.json();
          setActiveMomoProvider(data.provider || "moolre");
          setFallbackEnabled(!!data.fallback_enabled);
        }
      } catch (err) {
        console.error("Failed to load momo config", err);
      } finally {
        setMomoConfigLoading(false);
      }
    }
    async function fetchCardConfig() {
      try {
        const res = await fetch("/api/admin/integrations/card");
        if (res.ok) {
          const data = await res.json();
          setCardEnabled(!!data.enabled);
        }
      } catch (err) {
        console.error("Failed to load card config", err);
      } finally {
        setCardConfigLoading(false);
      }
    }
    async function fetchCryptoConfig() {
      try {
        const res = await fetch("/api/admin/integrations/crypto");
        if (res.ok) {
          const data = await res.json();
          setCryptoEnabled(data.enabled !== false);
        }
      } catch (err) {
        console.error("Failed to load crypto config", err);
      } finally {
        setCryptoConfigLoading(false);
      }
    }
    fetchMomoConfig();
    fetchCardConfig();
    fetchCryptoConfig();
  }, []);

  async function handleSaveCryptoConfig() {
    setCryptoConfigSaving(true);
    setCryptoConfigError(null);
    try {
      const res = await fetch("/api/admin/integrations/crypto", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: cryptoEnabled }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCryptoConfigError(err.error || "Failed to save configuration.");
      }
    } catch {
      setCryptoConfigError("Network error.");
    } finally {
      setCryptoConfigSaving(false);
    }
  }

  async function handleSaveCardConfig() {
    setCardConfigSaving(true);
    setCardConfigError(null);
    try {
      const res = await fetch("/api/admin/integrations/card", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: cardEnabled }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCardConfigError(err.error || "Failed to save configuration.");
      }
    } catch {
      setCardConfigError("Network error.");
    } finally {
      setCardConfigSaving(false);
    }
  }

  async function handleSaveMomoConfig() {
    setMomoConfigSaving(true);
    setMomoConfigError(null);
    try {
      const res = await fetch("/api/admin/integrations/momo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: activeMomoProvider, fallback_enabled: fallbackEnabled }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMomoConfigError(err.error || "Failed to save configuration.");
      }
    } catch {
      setMomoConfigError("Network error.");
    } finally {
      setMomoConfigSaving(false);
    }
  }

  const connectedMap = useMemo(
    () => Object.fromEntries((webhooks ?? []).map(w => [w.provider, w])),
    [webhooks]
  );

  function handleExpand(providerId: string) {
    if (expandedProvider === providerId) {
      setExpandedProvider(null);
      return;
    }
    const config = PROVIDERS.find(p => p.id === providerId)!;
    const existing = connectedMap[providerId];
    setFormState(prev => ({
      ...prev,
      [providerId]: {
        url: existing?.url ?? config.defaultWebhookUrl,
        eventTypes: existing?.eventTypes ?? config.eventTypes.map(e => e.value),
      },
    }));
    setErrors(prev => ({ ...prev, [providerId]: "" }));
    setExpandedProvider(providerId);
  }

  function toggleEventType(providerId: string, eventValue: string) {
    setFormState(prev => {
      const current = prev[providerId]?.eventTypes ?? [];
      const updated = current.includes(eventValue)
        ? current.filter(e => e !== eventValue)
        : [...current, eventValue];
      return { ...prev, [providerId]: { ...prev[providerId], eventTypes: updated } };
    });
  }

  async function handleRegister(providerId: string) {
    const state = formState[providerId];
    if (!state?.url) return;
    setActionLoading(prev => ({ ...prev, [providerId]: true }));
    setErrors(prev => ({ ...prev, [providerId]: "" }));
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId, url: state.url, eventTypes: state.eventTypes }),
      });
      if (res.ok) {
        refreshWebhooks();
        setExpandedProvider(null);
      } else {
        const err = await res.json();
        setErrors(prev => ({ ...prev, [providerId]: err.error ?? "Registration failed." }));
      }
    } catch {
      setErrors(prev => ({ ...prev, [providerId]: "Network error. Please try again." }));
    } finally {
      setActionLoading(prev => ({ ...prev, [providerId]: false }));
    }
  }

  async function handleDisconnect(providerId: string) {
    setActionLoading(prev => ({ ...prev, [providerId]: true }));
    setErrors(prev => ({ ...prev, [providerId]: "" }));
    try {
      const res = await fetch(`/api/admin/webhooks?provider=${providerId}`, { method: "DELETE" });
      if (res.ok) {
        refreshWebhooks();
        setExpandedProvider(null);
      } else {
        const err = await res.json();
        setErrors(prev => ({ ...prev, [providerId]: err.error ?? "Disconnect failed." }));
      }
    } catch {
      setErrors(prev => ({ ...prev, [providerId]: "Network error. Please try again." }));
    } finally {
      setActionLoading(prev => ({ ...prev, [providerId]: false }));
    }
  }

  function copyToClipboard(text: string, providerId: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(providerId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Active MoMo Provider Config */}
      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Settings2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Payment Routing Configuration</h3>
            <p className="text-xs text-[color:var(--trite-muted)] mt-0.5">Configure which provider handles Mobile Money payments and fallback behavior.</p>
          </div>
        </div>

        {momoConfigLoading ? (
          <div className="h-20 flex items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[color:var(--trite-muted)] uppercase tracking-wider mb-2">
                Primary Mobile Money Provider
              </label>
              <select
                value={activeMomoProvider}
                onChange={(e) => setActiveMomoProvider(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[#22c55e] transition-colors"
              >
                <option value="moolre">Moolre</option>
                <option value="anm">AppsNMobile (Orchard)</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${fallbackEnabled ? 'bg-[#22c55e]' : 'bg-black/10'}`}>
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${fallbackEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={fallbackEnabled}
                onChange={(e) => setFallbackEnabled(e.target.checked)}
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-[color:var(--trite-ink)] group-hover:text-black transition-colors">Enable Automatic Fallback</span>
                <span className="block text-xs text-[color:var(--trite-muted)]">Automatically route to the backup provider if the primary provider's API is down.</span>
              </div>
            </label>

            {momoConfigError && (
              <p className="text-xs text-red-500">{momoConfigError}</p>
            )}

            <button
              onClick={handleSaveMomoConfig}
              disabled={momoConfigSaving}
              className="mt-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {momoConfigSaving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              Save Routing Config
            </button>
          </div>
        )}
      </div>

      {/* Card Payments Toggle */}
      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Card Payments</h3>
            <p className="text-xs text-[color:var(--trite-muted)] mt-0.5">Control whether payers can choose card payments at checkout. Cards are not yet wired to an acquiring bank — keep disabled until that integration is live.</p>
          </div>
        </div>

        {cardConfigLoading ? (
          <div className="h-12 flex items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${cardEnabled ? 'bg-[#22c55e]' : 'bg-black/10'}`}>
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${cardEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={cardEnabled}
                onChange={(e) => setCardEnabled(e.target.checked)}
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-[color:var(--trite-ink)] group-hover:text-black transition-colors">Allow card payments at checkout</span>
                <span className="block text-xs text-[color:var(--trite-muted)]">When off, the card option is hidden from payers and card attempts are rejected by the API.</span>
              </div>
            </label>

            {cardConfigError && (
              <p className="text-xs text-red-500">{cardConfigError}</p>
            )}

            <button
              onClick={handleSaveCardConfig}
              disabled={cardConfigSaving}
              className="mt-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {cardConfigSaving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              Save Card Config
            </button>
          </div>
        )}
      </div>

      {/* Crypto Payments Toggle */}
      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Coins className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Crypto Payments</h3>
            <p className="text-xs text-[color:var(--trite-muted)] mt-0.5">Control whether payers can choose crypto &amp; stablecoin payments at checkout. Enabled by default — switch off to temporarily suspend crypto (e.g. during a provider incident).</p>
          </div>
        </div>

        {cryptoConfigLoading ? (
          <div className="h-12 flex items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${cryptoEnabled ? 'bg-[#22c55e]' : 'bg-black/10'}`}>
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${cryptoEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={cryptoEnabled}
                onChange={(e) => setCryptoEnabled(e.target.checked)}
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-[color:var(--trite-ink)] group-hover:text-black transition-colors">Allow crypto payments at checkout</span>
                <span className="block text-xs text-[color:var(--trite-muted)]">When off, crypto options are hidden from payers and new crypto attempts are rejected by the API.</span>
              </div>
            </label>

            {cryptoConfigError && (
              <p className="text-xs text-red-500">{cryptoConfigError}</p>
            )}

            <button
              onClick={handleSaveCryptoConfig}
              disabled={cryptoConfigSaving}
              className="mt-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {cryptoConfigSaving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              Save Crypto Config
            </button>
          </div>
        )}
      </div>

      <hr className="border-black/5" />

      <h3 className="text-sm font-semibold text-[color:var(--trite-ink)] mb-3">Provider Webhooks</h3>
      
      <div className="space-y-3">
      {PROVIDERS.map(provider => {
        const connected = connectedMap[provider.id];
        const isExpanded = expandedProvider === provider.id;
        const form = formState[provider.id];
        const loading = actionLoading[provider.id];
        const error = errors[provider.id];
        const initials = provider.label.slice(0, 2).toUpperCase();

        return (
          <div
            key={provider.id}
            className="rounded-2xl border border-black/5 bg-white overflow-hidden"
          >
            {/* Card header row */}
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22c55e]/10 text-xs font-bold text-[#22c55e]">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[color:var(--trite-ink)]">{provider.label}</p>
                <p className="text-xs text-[color:var(--trite-muted)] mt-0.5 truncate">{provider.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {connected ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)] bg-black/5 px-2 py-0.5 rounded-full">
                    Not Connected
                  </span>
                )}
                <button
                  onClick={() => handleExpand(provider.id)}
                  className="flex items-center gap-1 rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02] transition-colors"
                >
                  Configure
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded panel */}
            {isExpanded && form && (
              <div className="border-t border-black/5 p-4 space-y-4">
                {/* Webhook URL */}
                <div>
                  <label className="block text-xs font-semibold text-[color:var(--trite-muted)] uppercase tracking-wider mb-1.5">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={e =>
                      setFormState(prev => ({
                        ...prev,
                        [provider.id]: { ...prev[provider.id], url: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[#22c55e] transition-colors"
                  />
                </div>

                {/* Event types */}
                <div>
                  <label className="block text-xs font-semibold text-[color:var(--trite-muted)] uppercase tracking-wider mb-2">
                    Event Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {provider.eventTypes.map(et => (
                      <label
                        key={et.value}
                        className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-black/[0.01] px-3 py-2 cursor-pointer hover:bg-black/[0.03] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={form.eventTypes.includes(et.value)}
                          onChange={() => toggleEventType(provider.id, et.value)}
                          className="h-3.5 w-3.5 rounded accent-[#22c55e]"
                        />
                        <span className="text-xs text-[color:var(--trite-ink)]">{et.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Webhook ID (if connected) */}
                {connected && (
                  <div>
                    <label className="block text-xs font-semibold text-[color:var(--trite-muted)] uppercase tracking-wider mb-1.5">
                      Webhook ID
                    </label>
                    <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] border border-black/5 px-3 py-2">
                      <span className="flex-1 text-xs font-mono text-[color:var(--trite-ink)] truncate">
                        {connected.id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(connected.id, provider.id)}
                        className="shrink-0 text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)] transition-colors"
                      >
                        {copiedId === provider.id ? (
                          <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline error */}
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleRegister(provider.id)}
                    disabled={loading || form.eventTypes.length === 0}
                    className="rounded-xl bg-[#22c55e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ea74f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading && !connected ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {connected ? "Update Webhook" : "Register Webhook"}
                  </button>
                  {connected && (
                    <button
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={loading}
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {loading ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      ) : null}
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
