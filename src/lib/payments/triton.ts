// ============================================================
// Triton crypto payment provider adapter.
//
// Wraps the Triton API for invoice creation, address assignment,
// and invoice status checking. All requests are signed using the
// existing tritonFetch() helper (Ed25519 PKCS#8 signatures).
// ============================================================

import { tritonFetch } from "@/app/api/triton/triton-sign";

// ---------- Config ----------

function getConfig() {
  const baseUrl = process.env.TRITON_API_BASE_URL;
  const keyId = process.env.TRITON_KEY_ID;
  const privateKeyBase64 = process.env.TRITON_PRIVATE_KEY_BASE64;

  if (!baseUrl || !keyId || !privateKeyBase64) {
    throw new Error(
      "Missing Triton config. Set TRITON_API_BASE_URL, TRITON_KEY_ID, and TRITON_PRIVATE_KEY_BASE64 in .env"
    );
  }

  return { baseUrl, keyId, privateKeyBase64 };
}

// ---------- DTOs (from Triton OpenAPI spec) ----------

export interface CreateInvoiceParams {
  /** Merchant ID in our system — maps to Triton's externalAccountId. */
  externalAccountId: string;
  /** Idempotency reference — e.g. session ID or deterministic key. */
  externalInvoiceId: string;
  /** Fiat currency code, e.g. "GHS". */
  currencyId: string;
  /** Amount in fiat minor units (pesewas for GHS), as a string. */
  amount: string;
}

export interface InvoiceResponse {
  id: string;
  externalInvoiceId: string;
  externalAccountId: string;
  currencyId: string;
  currencyMinorUnitDecimals: number;
  amount: string;
  status:
    | "CREATED"
    | "ACTIVE"
    | "PARTIALLY_PAID"
    | "PAID"
    | "CANCELLED"
    | "REVIEW_REQUIRED"
    | "QUARANTINED";
  tokenDecimals: number | null;
  rateScale: number;
  lockedRate: string | null;
  rateLockedAt: string | null;
  tokenAmount: string | null;
  amountPaid: string | null;
  paymentAsset: "USDT" | "USDC" | null;
  networkId: string | null;
  assignedAddressId: string | null;
  depositAddress: string | null;
  addressAssignedAt: string | null;
  addressLeaseExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignAddressParams {
  paymentAsset: "USDT" | "USDC";
  networkId: string;
}

export interface PaymentInstructions {
  invoiceId: string;
  paymentAsset: "USDT" | "USDC";
  networkId: string;
  depositAddress: string;
  tokenAmount: string;
  currencyMinorUnitDecimals: number;
  tokenDecimals: number;
  rateScale: number;
  lockedRate: string;
  rateLockedAt: string;
  addressLeaseExpiresAt: string;
}

export interface InvoicePayment {
  id: string;
  hash: string;
  amount: string;
  asset: "USDT" | "USDC";
  status: "PENDING" | "CONFIRMED" | "SWEPT" | "REVIEW_REQUIRED" | "FAILED";
  contributedToAmountPaid: boolean;
}

export interface NetworkSummary {
  id: string;
  name: string;
  logo: string | null;
  blockchainVmCode: string;
  chainId: string | null;
  nativeGasAsset: "ETH" | "SOL" | "TRX";
  explorerUrl: string | null;
  isActive: boolean;
}

export interface TokenNetworkSummary {
  networkId: string;
  networkName: string;
  blockchainVmCode: string;
  decimals: number;
  contractOrMintAddress: string;
  isActive: boolean;
}

export interface TokenSummary {
  id: string;
  symbol: string;
  name: string;
  logo: string | null;
  isActive: boolean;
  networks: TokenNetworkSummary[];
}


// ---------- Provider Class ----------

export class TritonProvider {
  readonly name = "Triton";

  /**
   * POST /invoices — Create a new payment invoice.
   * Returns the invoice in CREATED state.
   */
  async createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
    const config = getConfig();
    const body = JSON.stringify({
      externalAccountId: params.externalAccountId,
      externalInvoiceId: params.externalInvoiceId,
      currencyId: params.currencyId,
      amount: params.amount,
    });

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "POST",
      url: "/invoices",
      body,
      headers: {
        "Idempotency-Key": params.externalInvoiceId,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Triton POST /invoices failed (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * POST /invoices/:id/address — Assign a deposit address to an invoice.
   * Locks a rate and returns deposit instructions.
   */
  async assignAddress(
    invoiceId: string,
    params: AssignAddressParams
  ): Promise<PaymentInstructions> {
    const config = getConfig();
    const body = JSON.stringify({
      paymentAsset: params.paymentAsset,
      networkId: params.networkId,
    });

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "POST",
      url: `/invoices/${invoiceId}/address`,
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Triton POST /invoices/${invoiceId}/address failed (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * GET /invoices/:id — Retrieve invoice details / check status.
   */
  async getInvoice(invoiceId: string): Promise<InvoiceResponse> {
    const config = getConfig();

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "GET",
      url: `/invoices/${invoiceId}`,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Triton GET /invoices/${invoiceId} failed (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * GET /invoices/:id/payments — List on-chain payments linked to the invoice.
   */
  async listPayments(invoiceId: string): Promise<InvoicePayment[]> {
    const config = getConfig();

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "GET",
      url: `/invoices/${invoiceId}/payments`,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Triton GET /invoices/${invoiceId}/payments failed (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * POST /admin/accounts — Register a new account.
   */
  async registerAccount(externalAccountId: string): Promise<any> {
    const config = getConfig();
    const body = JSON.stringify({ externalAccountId });

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "POST",
      url: "/admin/accounts",
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Triton POST /admin/accounts failed (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * GET /networks — List active networks.
   */
  async listNetworks(): Promise<NetworkSummary[]> {
    const config = getConfig();

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "GET",
      url: "/networks",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Triton GET /networks failed (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * GET /tokens — List active tokens with network deployments.
   */
  async listTokens(): Promise<TokenSummary[]> {
    const config = getConfig();

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "GET",
      url: "/tokens",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Triton GET /tokens failed (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  /**
   * POST /webhooks — Register a webhook endpoint.
   */
  async registerWebhook(url: string, eventTypes: string[]): Promise<{ id: string; signingSecret: string }> {
    const config = getConfig();
    const body = JSON.stringify({ url, eventTypes });

    const response = await tritonFetch({
      baseUrl: config.baseUrl,
      keyId: config.keyId,
      privateKeyBase64: config.privateKeyBase64,
      method: "POST",
      url: "/webhooks",
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Triton POST /webhooks failed (${response.status}): ${errorBody}`);
    }

    return response.json();
  }
}
