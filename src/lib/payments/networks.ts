// ============================================================
// Canonical telco resolution for payouts.
//
// `settlement_accounts.provider_name` is free text a merchant picked in the
// portal ("MTN", "MTN MoMo", "Telecel Cash"). Three places used to substring
// match it independently — the Moolre transfer channel map, the settlement
// cron's allowlist and the withdrawal endpoint's — and they had drifted.
// Resolve once, here, to the canonical MobileMoneyNetwork; each adapter maps
// that to its own codes, exactly as the collection maps already do.
// ============================================================

import type { MobileMoneyNetwork } from "./types";

/**
 * Ordered longest-first within each network so a name that mentions two
 * brands ("AirtelTigo Money") can't match on the shorter one.
 *
 * "at" is matched on a word boundary rather than as a substring: the old
 * `includes("at")` test routed anything merely containing those letters
 * (e.g. "Stanbic Bank Cash") to AirtelTigo.
 */
const NETWORK_PATTERNS: { network: MobileMoneyNetwork; patterns: RegExp[] }[] = [
  { network: "MTN", patterns: [/\bmtn\b/] },
  { network: "TELECEL", patterns: [/\btelecel\b/, /\bvodafone\b/, /\bvoda\b/] },
  { network: "AT", patterns: [/\bairteltigo\b/, /\bairtel\b/, /\btigo\b/, /\bat\b/] },
];

/**
 * Resolve a merchant-supplied provider name to a canonical network.
 * Returns null when the name isn't a Ghanaian mobile money network — the
 * caller decides whether that's a skip or a validation error.
 */
export function resolveMomoNetwork(providerName: string): MobileMoneyNetwork | null {
  const normalised = String(providerName || "").toLowerCase();
  if (!normalised) return null;

  for (const { network, patterns } of NETWORK_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(normalised))) return network;
  }

  return null;
}

/** Human-readable network name, for log lines and error copy. */
export const NETWORK_LABELS: Record<MobileMoneyNetwork, string> = {
  MTN: "MTN MoMo",
  TELECEL: "Telecel Cash",
  AT: "AT Money",
};
