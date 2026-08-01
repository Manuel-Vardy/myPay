// GET /api/payments/crypto-tokens — List available crypto tokens from Triton.
// Public endpoint (no auth required) — called by the checkout page to let
// the payer see supported assets (e.g., USDT, USDC) and their active network options.

import { getCryptoProvider } from "@/lib/payments";

export async function GET() {
  try {
    const crypto = getCryptoProvider();
    const tokens = await crypto.listTokens();

    // Filter to active tokens, and only active network deployments for each token
    const activeTokens = tokens
      .filter((t) => t.isActive)
      .map((t) => ({
        ...t,
        networks: t.networks.filter((n) => n.isActive),
      }));

    return Response.json(activeTokens);
  } catch (error: any) {
    console.error("Failed to fetch crypto tokens:", error);
    return Response.json(
      { error: "Failed to fetch available tokens" },
      { status: 502 }
    );
  }
}
