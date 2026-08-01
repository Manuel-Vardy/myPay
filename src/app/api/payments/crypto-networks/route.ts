// GET /api/payments/crypto-networks — List available blockchain networks from Triton.
// Public endpoint (no auth required) — called by the checkout page to let
// the payer pick which network to deposit on (e.g. Ethereum, Tron, Solana).

import { getCryptoProvider } from "@/lib/payments";

export async function GET() {
  try {
    const crypto = getCryptoProvider();
    const networks = await crypto.listNetworks();

    // Only return active networks to the frontend
    const active = networks.filter((n) => n.isActive);

    return Response.json(active);
  } catch (error: any) {
    console.error("Failed to fetch crypto networks:", error);
    return Response.json(
      { error: "Failed to fetch available networks" },
      { status: 502 }
    );
  }
}
