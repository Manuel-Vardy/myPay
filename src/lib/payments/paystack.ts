// ============================================================
// Paystack mobile money provider adapter.
//
// Docs: https://paystack.com/docs/api/charge/#create
//       https://paystack.com/docs/api/charge/#check
//
// Two branches matter for Ghana mobile money, both surfaced through the
// shared MobileMoneyProvider contract:
//   - `send_otp`    — Paystack SMSes an OTP; we collect it and resubmit
//                     (same shape as Moolre's TP14).
//   - `pay_offline` — the USSD prompt goes straight to the payer's handset,
//                     no OTP round-trip.
//
// Unlike Moolre, settlement here is webhook-first: see
// src/app/api/webhooks/paystack/route.ts. checkStatus is the backstop for
// the merchant status poll and the reconciliation cron.
// ============================================================

import type {
  MobileMoneyNetwork,
  InitiatePaymentParams,
  InitiatePaymentResult,
  CheckStatusParams,
  CheckStatusResult,
  CheckTransferStatusParams,
  InitiateTransferParams,
  PayoutProvider,
  ProviderTxStatus,
  TransferResult,
} from "./types";

// ---------- Paystack-specific constants ----------

/**
 * Map our canonical network names to Paystack mobile money provider codes.
 * Paystack still uses the legacy `vod` code for Telecel (ex-Vodafone Cash).
 */
const PROVIDER_MAP: Record<MobileMoneyNetwork, string> = {
  MTN: "mtn",
  TELECEL: "vod",
  AT: "atl",
};

/**
 * Paystack identifies a mobile money payout destination by "bank code". For
 * Ghana those codes are the telco short names, and — as with PROVIDER_MAP —
 * Telecel is still carried under the legacy Vodafone code.
 */
const RECIPIENT_BANK_CODE_MAP: Record<MobileMoneyNetwork, string> = {
  MTN: "MTN",
  TELECEL: "VOD",
  AT: "ATL",
};

/**
 * Transfer states that are still in flight. Unlike a charge, this is the
 * normal outcome of POST /transfer: Paystack queues the payout and reports
 * the result over `transfer.success` / `transfer.failed`.
 */
const TRANSFER_IN_FLIGHT_STATUSES = new Set([
  "pending",
  "processing",
  "received",
  "queued",
]);

/** Transfer states that are terminal failures — safe to return the reserve. */
const TRANSFER_FAILED_STATUSES = new Set([
  "failed",
  "abandoned",
  "reversed",
]);

/**
 * Paystack charge states that mean "the payer still has to do something on
 * their handset". The charge is live; we wait for the webhook or poll.
 */
const IN_FLIGHT_STATUSES = new Set([
  "pay_offline",
  "pending",
  "ongoing",
  "processing",
  "queued",
]);

/** Paystack charge states that are terminal failures. */
const FAILED_STATUSES = new Set([
  "failed",
  "abandoned",
  "reversed",
  "timeout",
]);

/**
 * Card-only continuation states. Mobile money should never produce these —
 * if one appears, the charge is stuck in a branch we can't drive, so fail
 * loudly rather than leave the payer's transaction hanging.
 */
const UNSUPPORTED_STATUSES = new Set([
  "send_pin",
  "send_phone",
  "send_birthday",
  "send_address",
  "open_url",
]);

// ---------- Environment helpers ----------

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// ---------- Provider ----------

export class PaystackProvider implements PayoutProvider {
  readonly name = "Paystack";

  private get secretKey(): string {
    return requireEnv("PAYSTACK_SECRET_KEY");
  }

  private get baseUrl(): string {
    return process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.secretKey}`,
    };
  }

  /**
   * Paystack rejects a charge without an email. Prefer the payer's real
   * address, fall back to a configured catch-all, then to a per-transaction
   * placeholder on a domain we own.
   */
  private resolveEmail(params: InitiatePaymentParams): string {
    if (params.payerEmail) return params.payerEmail;
    if (process.env.PAYSTACK_FALLBACK_EMAIL) return process.env.PAYSTACK_FALLBACK_EMAIL;
    return `${params.externalRef.toLowerCase()}@payers.trite.tech`;
  }

  // ---- Initiate Payment ----

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    // An OTP retry is a different endpoint, not a re-charge: Paystack is
    // resuming the charge it already created under this reference.
    if (params.otpCode) {
      return this.submitOtp(params);
    }

    const provider = PROVIDER_MAP[params.network];
    if (!provider) {
      return {
        success: false,
        message: `Unsupported mobile money network: ${params.network}`,
        rawResponse: { network: params.network },
      };
    }

    // Paystack amounts are in the currency's subunit (pesewas for GHS),
    // which is exactly how transactions.amount is stored — pass it through
    // rather than round-tripping through decimals.
    const body = {
      email: this.resolveEmail(params),
      amount: String(params.amount),
      currency: params.currency,
      // Sending our own reference is what lets externalRef stay the single
      // handle across submit_otp, checkStatus and the webhook lookup.
      reference: params.externalRef,
      mobile_money: {
        phone: params.phoneNumber,
        provider,
      },
      ...(params.reference && {
        metadata: {
          custom_fields: [
            {
              display_name: "Description",
              variable_name: "description",
              value: params.reference,
            },
          ],
        },
      }),
    };

    try {
      const response = await fetch(`${this.baseUrl}/charge`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return this.mapChargeResponse(data);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error contacting Paystack",
        rawResponse: { error: String(error) },
      };
    }
  }

  /**
   * Resume a charge sitting in `send_otp`.
   *
   * Note: this is `submit_otp`, not `submit_pin` — the latter is the card-PIN
   * endpoint and will not advance a mobile money charge.
   */
  private async submitOtp(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/charge/submit_otp`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          otp: params.otpCode,
          reference: params.externalRef,
        }),
      });

      const data = await response.json();
      return this.mapChargeResponse(data);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error submitting OTP to Paystack",
        rawResponse: { error: String(error) },
      };
    }
  }

  /**
   * Both /charge and /charge/submit_otp return the same envelope, so they
   * share one mapping onto InitiatePaymentResult.
   */
  private mapChargeResponse(data: {
    status?: boolean;
    message?: string;
    data?: { status?: string; reference?: string; display_text?: string; gateway_response?: string };
  }): InitiatePaymentResult {
    // Envelope-level rejection (validation error, bad key, duplicate ref).
    if (data.status === false || !data.data) {
      return {
        success: false,
        message: data.message || "Payment initiation failed at Paystack",
        rawResponse: data,
      };
    }

    const chargeStatus = data.data.status;
    const providerRef = data.data.reference;
    const message = data.data.display_text || data.data.gateway_response || data.message;

    if (chargeStatus === "send_otp") {
      return {
        success: true,
        requiresOtp: true,
        providerRef,
        message: message || "Please enter the OTP sent to your phone",
        rawResponse: data,
      };
    }

    // `success` here means Paystack has already completed the charge. We
    // still don't settle from this response — the webhook and the status
    // poll own that transition, so there is exactly one settlement path.
    if (chargeStatus === "success" || IN_FLIGHT_STATUSES.has(chargeStatus || "")) {
      return {
        success: true,
        providerRef,
        message: message || "Payment prompt sent to your phone",
        rawResponse: data,
      };
    }

    if (UNSUPPORTED_STATUSES.has(chargeStatus || "")) {
      return {
        success: false,
        providerRef,
        message: `Paystack requested "${chargeStatus}", which mobile money cannot satisfy`,
        rawResponse: data,
      };
    }

    if (FAILED_STATUSES.has(chargeStatus || "")) {
      return {
        success: false,
        providerRef,
        message: message || "Payment failed at Paystack",
        rawResponse: data,
      };
    }

    return {
      success: false,
      providerRef,
      message: message || `Unexpected Paystack charge status: ${chargeStatus}`,
      rawResponse: data,
    };
  }

  // ---- Check Status ----

  async checkStatus(params: CheckStatusParams): Promise<CheckStatusResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/charge/${encodeURIComponent(params.externalRef)}`,
        { method: "GET", headers: this.headers() }
      );

      const data = await response.json();

      // Paystack has no charge under our reference. Distinct from pending:
      // the reconciliation cron ages these out after 24h rather than waiting
      // forever on a prompt that was never created.
      if (response.status === 404 || (data.status === false && !data.data)) {
        return {
          status: "NOT_FOUND",
          message: data.message || "No charge found at Paystack for this reference",
          rawResponse: data,
        };
      }

      if (!data.data) {
        return {
          status: "PENDING",
          message: data.message || "Status unavailable",
          rawResponse: data,
        };
      }

      return {
        status: mapChargeStatus(data.data.status),
        providerRef: data.data.reference,
        thirdPartyRef: data.data.id != null ? String(data.data.id) : undefined,
        message: data.data.gateway_response || data.message,
        rawResponse: data,
      };
    } catch (error) {
      // Network failures must not flip a transaction to FAILED — a payer who
      // approved the prompt would lose their payment. Stay PENDING.
      return {
        status: "PENDING",
        message: error instanceof Error ? error.message : "Network error checking Paystack status",
        rawResponse: { error: String(error) },
      };
    }
  }

  // ---- Payouts ----

  /**
   * Resolve the Paystack recipient code for a payee, creating one if we have
   * not seen this account before.
   *
   * Recipient codes are stable per phone+network, so they are cached on
   * `settlement_accounts.provider_metadata` and returned as a patch for the
   * caller to persist. Paystack itself de-duplicates, but creating one per
   * payout adds a second failure point in the middle of a settlement that has
   * already moved money out of the merchant float.
   */
  private async resolveRecipient(params: InitiateTransferParams): Promise<
    | { ok: true; recipientCode: string; patch?: Record<string, unknown> }
    | { ok: false; result: TransferResult }
  > {
    const cached = (params.accountMetadata as { paystack?: { recipient_code?: string } } | undefined)
      ?.paystack?.recipient_code;
    if (cached) return { ok: true, recipientCode: cached };

    const bankCode = RECIPIENT_BANK_CODE_MAP[params.network];
    if (!bankCode) {
      return {
        ok: false,
        result: {
          status: "FAILED",
          message: `Unsupported payout network: ${params.network}`,
          rawResponse: { network: params.network },
        },
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/transferrecipient`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          type: "mobile_money",
          name: params.accountName || params.receiver,
          account_number: params.receiver,
          bank_code: bankCode,
          currency: params.currency,
        }),
      });

      const data = await response.json();
      const recipientCode = data?.data?.recipient_code;

      if (data?.status === false || !recipientCode) {
        // No transfer was attempted, so refusing here costs nothing.
        return {
          ok: false,
          result: {
            status: "FAILED",
            message: data?.message || "Could not register the payout recipient at Paystack",
            rawResponse: data,
          },
        };
      }

      return {
        ok: true,
        recipientCode,
        patch: { paystack: { recipient_code: recipientCode } },
      };
    } catch (error) {
      // The recipient call is before any money moves, but we still can't tell
      // a timeout from a rejection — stay UNKNOWN and let the caller hold.
      return {
        ok: false,
        result: {
          status: "UNKNOWN",
          message:
            error instanceof Error
              ? error.message
              : "Network error registering the payout recipient at Paystack",
          rawResponse: { error: String(error) },
        },
      };
    }
  }

  async initiateTransfer(params: InitiateTransferParams): Promise<TransferResult> {
    const recipient = await this.resolveRecipient(params);
    if (!recipient.ok) return recipient.result;

    try {
      const response = await fetch(`${this.baseUrl}/transfer`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          source: "balance",
          // Paystack amounts are minor units, which is how settlements are
          // stored — pass through rather than round-tripping via decimals.
          amount: params.amount,
          currency: params.currency,
          recipient: recipient.recipientCode,
          // Our own reference, so the webhook and /transfer/verify both key
          // off the settlement id.
          reference: params.externalRef,
          ...(params.reference && { reason: params.reference }),
        }),
      });

      const data = await response.json();
      const result = this.mapTransferResponse(data, response.status);
      return recipient.patch ? { ...result, accountMetadataPatch: recipient.patch } : result;
    } catch (error) {
      // Never FAILED — the transfer may have been accepted before the socket
      // died, and returning the reserve would double-pay the merchant.
      return {
        status: "UNKNOWN",
        message: error instanceof Error ? error.message : "Network error initiating Paystack transfer",
        rawResponse: { error: String(error) },
        ...(recipient.patch && { accountMetadataPatch: recipient.patch }),
      };
    }
  }

  async checkTransferStatus(params: CheckTransferStatusParams): Promise<TransferResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transfer/verify/${encodeURIComponent(params.externalRef)}`,
        { method: "GET", headers: this.headers() }
      );

      const data = await response.json();

      // Paystack has no transfer under our reference — it was never created.
      // Distinct from PENDING so the reconciler can age it out.
      //
      // Only a 404 means that. An envelope-level `status: false` on any other
      // code is a bad key, a revoked key, or an outage — treating those as
      // "no such transfer" would eventually reverse a payout that is fine,
      // crediting the merchant float for money already sent.
      if (response.status === 404) {
        return {
          status: "NOT_FOUND",
          message: data?.message || "No transfer found at Paystack for this reference",
          rawResponse: data,
        };
      }

      if (!response.ok) {
        return {
          status: "UNKNOWN",
          message: data?.message || `Paystack returned HTTP ${response.status}`,
          rawResponse: data,
        };
      }

      return this.mapTransferResponse(data, response.status);
    } catch (error) {
      return {
        status: "UNKNOWN",
        message:
          error instanceof Error ? error.message : "Network error checking Paystack transfer status",
        rawResponse: { error: String(error) },
      };
    }
  }

  /** POST /transfer and GET /transfer/verify return the same envelope. */
  private mapTransferResponse(
    data: {
      status?: boolean;
      message?: string;
      data?: { status?: string; transfer_code?: string; reference?: string; reason?: string };
    },
    httpStatus?: number
  ): TransferResult {
    // A server-side fault tells us nothing about whether the transfer was
    // created. Never a decline.
    if (httpStatus !== undefined && httpStatus >= 500) {
      return {
        status: "UNKNOWN",
        message: data?.message || `Paystack returned HTTP ${httpStatus}`,
        rawResponse: (data ?? {}) as Record<string, unknown>,
      };
    }

    // Envelope-level rejection: validation error, insufficient balance,
    // transfers not enabled. Paystack looked at it and said no, so this is a
    // definitive decline and the reserve can go back.
    if (data?.status === false || !data?.data) {
      return {
        status: "FAILED",
        message: data?.message || "Transfer rejected by Paystack",
        rawResponse: data as Record<string, unknown>,
      };
    }

    const transferStatus = data.data.status;
    const providerRef = data.data.transfer_code || data.data.reference;
    const message = data.data.reason || data.message || "";

    if (transferStatus === "success") {
      return {
        status: "SUCCESS",
        providerRef,
        message: message || "Transfer completed",
        rawResponse: data as Record<string, unknown>,
      };
    }

    // The account still has "OTP for transfers" switched on, so Paystack is
    // waiting on a code we have no way to supply from a cron. The transfer
    // exists, so we must not reverse — surface it as UNKNOWN and let the
    // caller alert an operator to disable OTP in the Paystack dashboard.
    if (transferStatus === "otp") {
      return {
        status: "UNKNOWN",
        providerRef,
        message:
          "Paystack is holding this transfer for OTP confirmation. Disable " +
          "\"OTP for transfers\" in the Paystack dashboard (Settings → Preferences) " +
          "so API-initiated payouts can complete.",
        rawResponse: data as Record<string, unknown>,
      };
    }

    if (TRANSFER_IN_FLIGHT_STATUSES.has(transferStatus || "")) {
      return {
        status: "PENDING",
        providerRef,
        message: message || "Transfer queued at Paystack",
        rawResponse: data as Record<string, unknown>,
      };
    }

    if (TRANSFER_FAILED_STATUSES.has(transferStatus || "")) {
      return {
        status: "FAILED",
        providerRef,
        message: message || "Transfer failed at Paystack",
        rawResponse: data as Record<string, unknown>,
      };
    }

    // An unrecognised state is not a licence to reverse.
    return {
      status: "UNKNOWN",
      providerRef,
      message: message || `Unexpected Paystack transfer status: ${transferStatus}`,
      rawResponse: data as Record<string, unknown>,
    };
  }
}

/** Map a Paystack charge status onto our normalised status. */
function mapChargeStatus(status: string | undefined): ProviderTxStatus {
  if (status === "success") return "SUCCESS";
  if (FAILED_STATUSES.has(status || "")) return "FAILED";
  // send_otp, pay_offline, pending, ongoing — the payer still has work to do.
  return "PENDING";
}
