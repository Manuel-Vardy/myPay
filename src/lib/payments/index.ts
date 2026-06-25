// ============================================================
// Payment provider registry.
//
// This is the ONLY place that knows which concrete provider is
// active. The rest of the application imports getMobileMoneyProvider()
// and never touches Moolre (or any other vendor) directly.
//
// To add a new provider:
//   1. Create  src/lib/payments/newprovider.ts  implementing MobileMoneyProvider
//   2. Add a case to the switch below
//   3. Set  MOBILE_MONEY_PROVIDER=newprovider  in .env
// ============================================================

import type { MobileMoneyProvider } from "./types";
import { MoolreProvider } from "./moolre";

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

/** Singleton cache so we don't re-instantiate on every request. */
let _provider: MobileMoneyProvider | null = null;

/**
 * Returns the currently configured mobile money provider.
 * Controlled by the `MOBILE_MONEY_PROVIDER` env var (default: "moolre").
 */
export function getMobileMoneyProvider(): MobileMoneyProvider {
  if (_provider) return _provider;

  const providerName = (process.env.MOBILE_MONEY_PROVIDER || "moolre").toLowerCase();

  switch (providerName) {
    case "moolre":
      _provider = new MoolreProvider();
      break;

    // Future providers go here:
    // case "hubtel":
    //   _provider = new HubtelProvider();
    //   break;

    default:
      throw new Error(
        `Unknown mobile money provider: "${providerName}". ` +
        `Set MOBILE_MONEY_PROVIDER to one of: moolre`
      );
  }

  return _provider;
}
