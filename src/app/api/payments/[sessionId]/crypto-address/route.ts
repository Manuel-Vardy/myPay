// POST /api/payments/[sessionId]/crypto-address
// Generates a Triton invoice and assigns a deposit address for crypto payments.
// Called when the payer clicks "Get Address" after selecting a token and network.

import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getCryptoProvider, isCryptoPaymentsEnabled } from "@/lib/payments";
import { quoteFee } from "@/lib/fees";
import type { PaymentRail } from "@/lib/types";

// Fallback defaults when the frontend doesn't send a networkId (backward compat).
const DEFAULT_NETWORK: Record<string, string> = {
  USDC: "ethereum",
  USDT: "ethereum",
};

/** Derive a payment_rail enum value from token symbol + networkId.
 *  e.g. ("USDC", "base") → "USDC_BASE", ("USDT", "solana") → "USDT_SOLANA" */
function toRail(symbol: string, networkId: string): string {
  return `${symbol}_${networkId.toUpperCase()}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { currency, networkId: incomingNetworkId } = body as {
      currency: "USDC" | "USDT";
      networkId?: string;
    };

    if (!currency || !["USDC", "USDT"].includes(currency)) {
      return Response.json(
        { error: 'currency must be "USDC" or "USDT"' },
        { status: 400 }
      );
    }

    // Admin-gated: block NEW crypto attempts while disabled. crypto-confirm
    // stays open so a payer who already received an address can complete.
    if (!(await isCryptoPaymentsEnabled())) {
      return Response.json(
        { error: "Crypto payments are currently unavailable" },
        { status: 403 }
      );
    }

    const resolvedNetworkId = incomingNetworkId || DEFAULT_NETWORK[currency];
    if (!resolvedNetworkId) {
      return Response.json(
        { error: "networkId is required for this asset" },
        { status: 400 }
      );
    }

    // 1. Validate session
    const session = await db("payment_sessions")
      .where({ id: sessionId, status: "ACTIVE" })
      .first();

    if (!session) {
      return Response.json(
        { error: "Payment session not found or inactive" },
        { status: 404 }
      );
    }

    if (new Date(session.expires_at) < new Date()) {
      return Response.json(
        { error: "Payment session has expired" },
        { status: 410 }
      );
    }

    // 2. Look up merchant for externalAccountId
    const merchant = await db("merchants")
      .where({ id: session.merchant_id })
      .first();

    if (!merchant) {
      return Response.json(
        { error: "Merchant not found" },
        { status: 500 }
      );
    }

    // 3. Check if we already have a Triton invoice for this session
    const metadata = typeof session.metadata === "string"
      ? JSON.parse(session.metadata)
      : session.metadata || {};

    const crypto = getCryptoProvider();
    let invoiceId = metadata.triton_invoice_id;

    // 3b. Resolve merchant fee-bearer preference. If they've chosen to pass
    // the fee to the customer, the invoiced amount (and therefore the
    // deposit address's expected token amount) is inflated by the fee so
    // the merchant still nets the original order amount at settlement.
    const rail = toRail(currency, resolvedNetworkId);
    const fee = await quoteFee(
      "PAYMENT_PROCESSING",
      {
        merchantId: merchant.id,
        merchantTier: merchant.tier,
        currency: session.currency,
        method: "CRYPTO",
        rail: rail as PaymentRail,
      },
      BigInt(String(session.amount))
    );
    const invoiceAmount =
      merchant.fee_bearer === "CUSTOMER"
        ? BigInt(String(session.amount)) + fee
        : BigInt(String(session.amount));

    // 4. Create Triton invoice if we don't have one yet
    if (!invoiceId) {
      try {
        const invoice = await crypto.createInvoice({
          externalAccountId: merchant.id,
          externalInvoiceId: sessionId,
          currencyId: session.currency, // e.g. "GHS"
          amount: invoiceAmount.toString(),
        });
        invoiceId = invoice.id;
      } catch (err: any) {
        // If Triton returns 404/not registered, register the account and retry
        const isNotRegisteredError =
          err.message &&
          (err.message.includes("404") ||
            err.message.includes("not registered") ||
            err.message.includes("is not registered"));

        if (isNotRegisteredError) {
          console.log(
            `Merchant ${merchant.id} not registered on Triton. Registering now...`
          );
          try {
            await crypto.registerAccount(merchant.id);
          } catch (regErr) {
            console.error(
              "Failed to register merchant account on Triton:",
              regErr
            );
            throw err; // throw original error if registration fails
          }

          // Retry invoice creation
          const invoice = await crypto.createInvoice({
            externalAccountId: merchant.id,
            externalInvoiceId: sessionId,
            currencyId: session.currency,
            amount: invoiceAmount.toString(),
          });
          invoiceId = invoice.id;
        } else {
          throw err;
        }
      }
    }

    // 5. Request deposit address (always call — gets fresh rate + address)
    const instructions = await crypto.assignAddress(invoiceId, {
      paymentAsset: currency,
      networkId: resolvedNetworkId,
    });

    // 6. rail was already derived in step 3b for the fee quote

    // 7. Store invoice details in session metadata
    const updatedMetadata = {
      ...metadata,
      triton_invoice_id: invoiceId,
      triton_deposit_address: instructions.depositAddress,
      triton_token_amount: instructions.tokenAmount,
      triton_payment_asset: instructions.paymentAsset,
      triton_network_id: instructions.networkId,
      triton_locked_rate: instructions.lockedRate,
      triton_rate_scale: instructions.rateScale,
      triton_token_decimals: instructions.tokenDecimals,
      triton_address_lease_expires_at: instructions.addressLeaseExpiresAt,
      triton_rail: rail,
      triton_total_amount: invoiceAmount.toString(),
      triton_fee_basis_amount: session.amount,
    };

    await db("payment_sessions")
      .where({ id: sessionId })
      .update({
        metadata: JSON.stringify(updatedMetadata),
        updated_at: new Date(),
      });

    // 8. Format token amount for display
    // tokenAmount is in token minor units — divide by 10^tokenDecimals
    const tokenDecimals = instructions.tokenDecimals || 6; // USDC/USDT = 6 decimals
    const displayAmount = (
      Number(instructions.tokenAmount) / Math.pow(10, tokenDecimals)
    ).toFixed(tokenDecimals > 2 ? 2 : tokenDecimals);

    return Response.json({
      address: instructions.depositAddress,
      amount: displayAmount,
      raw_token_amount: instructions.tokenAmount,
      asset: instructions.paymentAsset,
      network: instructions.networkId,
      locked_rate: instructions.lockedRate,
      expires_at: instructions.addressLeaseExpiresAt,
    });
  } catch (error) {
    console.error("Crypto address generation error:", error);
    return Response.json(
      { error: "Failed to generate deposit address. Please try again." },
      { status: 500 }
    );
  }
}
