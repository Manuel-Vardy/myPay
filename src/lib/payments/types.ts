// ============================================================
// Provider-agnostic types for mobile money payment processing.
// Any new provider (Hubtel, Paystack, etc.) implements the
// MobileMoneyProvider interface — nothing else needs to change.
// ============================================================

/** Supported mobile money networks in Ghana. */
export type MobileMoneyNetwork = "MTN" | "TELECEL" | "AT";

// ---------- Initiate Payment ----------

export interface InitiatePaymentParams {
  /** The mobile money network the payer is on. */
  network: MobileMoneyNetwork;
  /** Payer's phone number, e.g. "233250XXXXXXX". */
  phoneNumber: string;
  /** Amount to collect in the given currency. */
  amount: string;
  /** ISO currency code, e.g. "GHS". */
  currency: string;
  /** Your unique reference for this transaction (idempotency key). */
  externalRef: string;
  /** Optional human-readable description. */
  reference?: string;
  /** OTP code, if the provider requires one. */
  otpCode?: string;
  /** USSD session id, if resuming a session. */
  sessionId?: string;
  /**
   * Payer's email, where one is known. Paystack requires an email on every
   * charge and synthesises a placeholder without it; Moolre and ANM ignore
   * this field entirely.
   */
  payerEmail?: string;
}

export interface InitiatePaymentResult {
  /** Whether the initiation call itself succeeded. */
  success: boolean;
  /** Provider-side reference / transaction ID. */
  providerRef?: string;
  /** If true, the payer needs to supply an OTP before retrying. */
  requiresOtp?: boolean;
  /** Human-readable message from the provider. */
  message?: string;
  /** Raw response body for logging / debugging. */
  rawResponse: unknown;
}

// ---------- Check Status ----------

export interface CheckStatusParams {
  /** The externalRef you passed during initiation. */
  externalRef: string;
}

// NOT_FOUND: the provider has no transaction under our reference — the
// payment was never created on their side (abandoned USSD prompt, OTP never
// completed). Distinct from PENDING so callers can decide how long to wait.
export type ProviderTxStatus = "PENDING" | "SUCCESS" | "FAILED" | "NOT_FOUND";

export interface CheckStatusResult {
  /** Normalised status. */
  status: ProviderTxStatus;
  /** Provider-side reference / transaction ID. */
  providerRef?: string;
  /** Third-party reference (e.g. telco receipt). */
  thirdPartyRef?: string;
  /** Human-readable message from the provider. */
  message?: string;
  /** Raw response body for logging / debugging. */
  rawResponse: unknown;
}

// ---------- Provider Interface ----------

/**
 * Contract that every mobile money provider adapter must fulfil.
 * The rest of the application only depends on this interface.
 */
export interface MobileMoneyProvider {
  /** Human-readable name, e.g. "Moolre", "Hubtel". */
  readonly name: string;

  /** Send a collect/charge request to the payer's phone. */
  initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;

  /** Poll the provider for the current status of a transaction. */
  checkStatus(params: CheckStatusParams): Promise<CheckStatusResult>;
}

// ============================================================
// Payouts (disbursement / settlement transfers)
//
// Kept separate from MobileMoneyProvider because collection and
// disbursement are independently licensed capabilities: ANM collects but
// cannot disburse. Adapters that can pay out declare PayoutProvider, and
// callers gate on `supportsPayouts`.
// ============================================================

/**
 * Normalised outcome of a payout attempt.
 *
 * The distinction that matters is FAILED vs UNKNOWN. FAILED means the
 * provider definitively refused — safe to return the reserve and reverse the
 * fee. UNKNOWN means we never learned the outcome (network error, unparseable
 * body); the money may already be gone, so the reserve must stay put. Any
 * ambiguity resolves to UNKNOWN.
 *
 * PENDING is a real, expected state, not a degradation: Paystack accepts a
 * transfer and reports the outcome later over its webhook.
 *
 * NOT_FOUND means the provider has no transfer under our reference — it was
 * never created. Distinct from PENDING so the reconciler can age it out.
 */
export type PayoutStatus = "SUCCESS" | "PENDING" | "FAILED" | "NOT_FOUND" | "UNKNOWN";

export interface InitiateTransferParams {
  /** Destination telco, resolved from `settlement_accounts.provider_name`. */
  network: MobileMoneyNetwork;
  /** ISO currency code, e.g. "GHS". */
  currency: string;
  /** Amount to send, in minor units. */
  amount: number;
  /** Payee's mobile money number. */
  receiver: string;
  /** Our unique reference for this payout (the settlement UUID). */
  externalRef: string;
  /** Payee's account name, where the provider needs one. */
  accountName?: string;
  /** Optional human-readable narration. */
  reference?: string;
  /**
   * Provider handles already cached for this settlement account — currently
   * `{ paystack: { recipient_code } }`. Lets an adapter skip a setup call.
   */
  accountMetadata?: Record<string, unknown>;
}

export interface CheckTransferStatusParams {
  /** The externalRef passed at initiation. */
  externalRef: string;
  /** Provider-side reference, where one was captured. */
  providerRef?: string;
}

export interface TransferResult {
  /** Normalised outcome. */
  status: PayoutStatus;
  /** Human-readable message from the provider. */
  message: string;
  /** Provider-side reference / transaction ID. */
  providerRef?: string;
  /**
   * Handles worth persisting onto `settlement_accounts.provider_metadata` so
   * the next payout can skip re-creating them.
   */
  accountMetadataPatch?: Record<string, unknown>;
  /** Raw response body for logging / debugging. */
  rawResponse: { error?: unknown } & Record<string, unknown>;
}

/** A provider that can disburse, not just collect. */
export interface PayoutProvider extends MobileMoneyProvider {
  initiateTransfer(params: InitiateTransferParams): Promise<TransferResult>;
  checkTransferStatus(params: CheckTransferStatusParams): Promise<TransferResult>;
}

/** Whether an adapter implements the payout half of the contract. */
export function supportsPayouts(
  provider: MobileMoneyProvider
): provider is PayoutProvider {
  const candidate = provider as Partial<PayoutProvider>;
  return (
    typeof candidate.initiateTransfer === "function" &&
    typeof candidate.checkTransferStatus === "function"
  );
}
