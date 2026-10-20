import db from "@/lib/db";
import type { MobileMoneyProvider, PayoutProvider } from "./types";
import { supportsPayouts } from "./types";
import { MoolreProvider } from "./moolre";
import { TritonProvider } from "./triton";
import { AnmProvider } from "./anm";
import { PaystackProvider } from "./paystack";
import { ManualPayoutProvider, MANUAL_PROVIDER_NAME } from "./manual";

// Re-export types for convenience
export type {
  MobileMoneyProvider,
  MobileMoneyNetwork,
  InitiatePaymentParams,
  InitiatePaymentResult,
  CheckStatusParams,
  CheckStatusResult,
  ProviderTxStatus,
  PayoutProvider,
  PayoutStatus,
  InitiateTransferParams,
  CheckTransferStatusParams,
  TransferResult,
} from "./types";
export { supportsPayouts } from "./types";

export { TritonProvider } from "./triton";
export type {
  CreateInvoiceParams,
  InvoiceResponse,
  AssignAddressParams,
  PaymentInstructions,
  InvoicePayment,
  NetworkSummary,
  TokenSummary,
  TokenNetworkSummary,
} from "./triton";

export { PaystackProvider } from "./paystack";
export { ManualPayoutProvider, MANUAL_PROVIDER_NAME } from "./manual";

let _cryptoProvider: TritonProvider | null = null;

// The provider instances can be cached
const _moolre = new MoolreProvider();
const _anm = new AnmProvider();
const _paystack = new PaystackProvider();
const _manual = new ManualPayoutProvider();

/**
 * Every mobile money provider, keyed by the name stored in
 * `platform_settings.active_momo_provider` and in `transactions.metadata.provider`.
 *
 * Single source of truth: the admin config, the runtime dispatch and the
 * reconciliation cron all resolve through this map, so adding a provider is
 * one entry here plus its adapter. Keys must stay lowercase a–z — callers
 * normalise with `/[^a-z]/g` before looking up.
 */
export const MOMO_PROVIDERS: Record<string, MobileMoneyProvider> = {
  moolre: _moolre,
  anm: _anm,
  appsnmobile: _anm, // alias: metadata.provider is the adapter's display name
  paystack: _paystack,
};

/** Normalise a stored/config provider name to a MOMO_PROVIDERS key. */
export function normaliseProviderName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Whether card payments are enabled platform-wide. Reads the
 * `card_payments` key in `platform_settings`; defaults to false until an
 * admin enables it (cards aren't wired to an acquiring bank yet).
 */
export async function isCardPaymentsEnabled(): Promise<boolean> {
  const setting = await db("platform_settings").where({ key: "card_payments" }).first();
  return setting?.value?.enabled === true;
}

/**
 * Whether `customer_email` is mandatory on API-created payment sessions.
 * Reads the `require_customer_identity` key in `platform_settings`.
 *
 * Defaults to false: turning this on rejects every integration that hasn't
 * added the field yet, so sessions without it are accepted and warned about
 * until an admin confirms merchants have caught up. Flip it to make the
 * customer directory complete for API traffic.
 */
export async function isCustomerIdentityRequired(): Promise<boolean> {
  const setting = await db("platform_settings")
    .where({ key: "require_customer_identity" })
    .first();
  return setting?.value?.enabled === true;
}

/**
 * Whether crypto payments are enabled platform-wide. Reads the
 * `crypto_payments` key in `platform_settings`. Unlike cards, crypto is
 * live (Triton) — so it defaults to ENABLED until an admin turns it off.
 */
export async function isCryptoPaymentsEnabled(): Promise<boolean> {
  const setting = await db("platform_settings").where({ key: "crypto_payments" }).first();
  return setting?.value?.enabled !== false;
}

/**
 * Returns the currently configured mobile money provider.
 * Reads from the `active_momo_provider` key in `platform_settings`.
 * Defaults to "moolre" if not set.
 */
export async function getMobileMoneyProvider(): Promise<MobileMoneyProvider> {
  const setting = await db("platform_settings").where({ key: "active_momo_provider" }).first();
  const providerName = normaliseProviderName(
    setting?.value?.provider || process.env.MOBILE_MONEY_PROVIDER || "moolre"
  );

  const provider = MOMO_PROVIDERS[providerName];
  if (provider) return provider;

  console.warn(`Unknown mobile money provider: "${providerName}". Falling back to Moolre.`);
  return _moolre;
}

/**
 * Returns the fallback provider if one is configured and enabled.
 *
 * An explicit `fallback_provider` in the setting wins. Without one we keep
 * the historical moolre↔anm pairing — which only ever made sense while there
 * were exactly two providers, so anything else needs to be named.
 */
export async function getFallbackMobileMoneyProvider(): Promise<MobileMoneyProvider | null> {
  const setting = await db("platform_settings").where({ key: "active_momo_provider" }).first();
  const fallbackEnabled = setting?.value?.fallback_enabled === true;

  if (!fallbackEnabled) return null;

  const currentProvider = normaliseProviderName(
    setting?.value?.provider || process.env.MOBILE_MONEY_PROVIDER || "moolre"
  );

  if (setting?.value?.fallback_provider) {
    const named = normaliseProviderName(setting.value.fallback_provider);
    // Falling back to the provider that just failed would only burn a retry.
    if (named !== currentProvider && MOMO_PROVIDERS[named]) return MOMO_PROVIDERS[named];
    return null;
  }

  if (currentProvider === "moolre") return _anm;
  if (currentProvider === "anm") return _moolre;

  return null;
}

/**
 * Returns the provider that should execute payouts.
 *
 * Payouts follow the same `active_momo_provider` setting as collections, so
 * an admin switching the primary provider switches both halves. Collection
 * and disbursement are separately licensed capabilities though — ANM can
 * collect but has no transfer API — so a provider that cannot disburse falls
 * back to Moolre rather than halting every merchant's payouts.
 */
export async function getPayoutProvider(): Promise<PayoutProvider> {
  const active = await getMobileMoneyProvider();
  if (supportsPayouts(active)) return active;

  console.warn(
    `Mobile money provider "${active.name}" cannot disburse. Paying out via ${_moolre.name}.`
  );
  await db("system_logs")
    .insert({
      level: "WARN",
      source: "PAYOUT_PROVIDER",
      event_description:
        `Active mobile money provider ${active.name} has no disbursement API — ` +
        `payouts routed to ${_moolre.name}`,
    })
    // Log failures must never block a payout.
    .catch(() => null);

  return _moolre;
}

/**
 * Resolve a payout adapter from a stored `settlements.payout_provider` name.
 *
 * The reconciler and the payout webhook must talk to whoever actually holds
 * the transfer, not to whoever is primary today — an admin switching
 * providers mid-flight would otherwise orphan settlements.
 */
export function resolvePayoutProvider(name: unknown): PayoutProvider | null {
  if (typeof name !== "string") return null;
  const key = normaliseProviderName(name);

  // Kept out of MOMO_PROVIDERS: it can pay out but must never be reachable
  // as a collection provider.
  if (key === normaliseProviderName(MANUAL_PROVIDER_NAME)) return _manual;

  const provider = MOMO_PROVIDERS[key];
  if (provider && supportsPayouts(provider)) return provider;
  return null;
}

/** The adapter used to record an out-of-band payout. */
export function getManualPayoutProvider(): PayoutProvider {
  return _manual;
}

/**
 * Returns the Triton crypto payment provider instance.
 */
export function getCryptoProvider(): TritonProvider {
  if (_cryptoProvider) return _cryptoProvider;
  _cryptoProvider = new TritonProvider();
  return _cryptoProvider;
}
