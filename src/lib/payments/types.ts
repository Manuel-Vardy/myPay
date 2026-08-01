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
