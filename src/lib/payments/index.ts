import db from "@/lib/db";
import type { MobileMoneyProvider } from "./types";
import { MoolreProvider } from "./moolre";
import { TritonProvider } from "./triton";
import { AnmProvider } from "./anm";

// Re-export types for convenience
export type {
  MobileMoneyProvider,
  MobileMoneyNetwork,
  InitiatePaymentParams,
  InitiatePaymentResult,
  CheckStatusParams,
  CheckStatusResult,
  ProviderTxStatus,
} from "./types";

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

let _cryptoProvider: TritonProvider | null = null;

// The provider instances can be cached
const _moolre = new MoolreProvider();
const _anm = new AnmProvider();

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
  const providerName = (setting?.value?.provider || process.env.MOBILE_MONEY_PROVIDER || "moolre").toLowerCase();

  switch (providerName) {
    case "moolre":
      return _moolre;
    case "anm":
      return _anm;
    default:
      console.warn(`Unknown mobile money provider: "${providerName}". Falling back to Moolre.`);
      return _moolre;
  }
}

/**
 * Returns the fallback provider if one is configured and enabled.
 */
export async function getFallbackMobileMoneyProvider(): Promise<MobileMoneyProvider | null> {
  const setting = await db("platform_settings").where({ key: "active_momo_provider" }).first();
  const fallbackEnabled = setting?.value?.fallback_enabled === true;
  
  if (!fallbackEnabled) return null;

  const currentProvider = (setting?.value?.provider || process.env.MOBILE_MONEY_PROVIDER || "moolre").toLowerCase();
  
  // Return the alternative provider
  if (currentProvider === "moolre") return _anm;
  if (currentProvider === "anm") return _moolre;
  
  return null;
}

/**
 * Returns the Triton crypto payment provider instance.
 */
export function getCryptoProvider(): TritonProvider {
  if (_cryptoProvider) return _cryptoProvider;
  _cryptoProvider = new TritonProvider();
  return _cryptoProvider;
}
