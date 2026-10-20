// ============================================================
// Moolre mobile money provider adapter.
//
// Docs: knowledge/moolre/initiate-payment.md
//       knowledge/moolre/payment-status.md
//       knowledge/moolre/payment-webhook.md
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
  PayoutStatus,
  ProviderTxStatus,
  TransferResult,
} from "./types";
import { fromMinorUnits } from "@/lib/utils";

// ---------- Moolre-specific constants ----------

/** Map our canonical network names to Moolre channel codes. */
const CHANNEL_MAP: Record<MobileMoneyNetwork, string> = {
  MTN: "13",
  TELECEL: "6",
  AT: "7",
};

/** Map Moolre txstatus integers to our normalised status. */
function mapTxStatus(txstatus: number): ProviderTxStatus {
  switch (txstatus) {
    case 1:
      return "SUCCESS";
    case 2:
      return "FAILED";
    case 3:
      // Moolre answers SS07 "Transaction not found" with txstatus 3 when no
      // transaction exists under this externalref.
      return "NOT_FOUND";
    default:
      return "PENDING"; // 0 or anything unexpected
  }
}

// ---------- Environment helpers ----------

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// ---------- Provider ----------

export class MoolreProvider implements PayoutProvider {
  readonly name = "Moolre";

  private get apiUser(): string {
    return requireEnv("MOOLRE_API_USER");
  }

  private get apiKey(): string {
    return requireEnv("MOOLRE_API_KEY");
  }

  private get apiPubKey(): string {
    return requireEnv("MOOLRE_API_PUBKEY");
  }

  private get accountNumber(): string {
    return requireEnv("MOOLRE_ACCOUNT_NUMBER");
  }

  // ---- Initiate Payment ----

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const channel = CHANNEL_MAP[params.network];

    const body: Record<string, unknown> = {
      type: 1,
      channel,
      currency: params.currency,
      payer: params.phoneNumber,
      amount: fromMinorUnits(params.amount),
      externalref: params.externalRef,
      accountnumber: this.accountNumber,
      ...(params.reference && { reference: params.reference }),
      ...(params.otpCode && { otpcode: params.otpCode }),
      ...(params.sessionId && { sessionid: params.sessionId }),
    };

    try {
      const response = await fetch("https://api.moolre.com/open/transact/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-USER": this.apiUser,
          "X-API-KEY": this.apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // OTP required — code TP14
      if (data.code === "TP14") {
        return {
          success: true,
          requiresOtp: true,
          message: data.message,
          rawResponse: data,
        };
      }

      // Phone verification successful — code TP17
      // The OTP was accepted. Moolre now expects a follow-up call to the
      // same endpoint with the same externalref but WITHOUT otpcode to
      // actually initiate the USSD payment prompt.
      if (data.code === "TP17") {
        const followUpBody = { ...body };
        delete followUpBody.otpcode;

        const followUpResponse = await fetch("https://api.moolre.com/open/transact/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-USER": this.apiUser,
            "X-API-KEY": this.apiKey,
          },
          body: JSON.stringify(followUpBody),
        });

        const followUpData = await followUpResponse.json();

        // The follow-up should return TR099 (payment initiated)
        if (followUpData.status === 1 && followUpData.code === "TR099") {
          return {
            success: true,
            providerRef: followUpData.data,
            message: followUpData.message,
            rawResponse: followUpData,
          };
        }

        // If Moolre asks for OTP again on the follow-up, surface it
        if (followUpData.code === "TP14") {
          return {
            success: true,
            requiresOtp: true,
            message: followUpData.message,
            rawResponse: followUpData,
          };
        }

        // Any other follow-up response is unexpected — treat as failure
        return {
          success: false,
          message: followUpData.message || "Payment initiation failed after phone verification",
          rawResponse: followUpData,
        };
      }

      // Successful initiation — code TR099
      if (data.status === 1 && data.code === "TR099") {
        return {
          success: true,
          providerRef: data.data, // Moolre returns its ref in `data`
          message: data.message,
          rawResponse: data,
        };
      }

      // Anything else is a failure / validation error
      return {
        success: false,
        message: data.message || "Payment initiation failed",
        rawResponse: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error contacting Moolre",
        rawResponse: { error: String(error) },
      };
    }
  }

  // ---- Check Status ----

  async checkStatus(params: CheckStatusParams): Promise<CheckStatusResult> {
    const body = {
      type: 1,
      idtype: "1", // 1 = lookup by externalref
      id: params.externalRef,
      accountnumber: this.accountNumber,
    };

    try {
      const response = await fetch("https://api.moolre.com/open/transact/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-USER": this.apiUser,
          "X-API-PUBKEY": this.apiPubKey,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === 1 && data.data) {
        return {
          status: mapTxStatus(data.data.txstatus),
          providerRef: data.data.transactionid,
          thirdPartyRef: data.data.thirdpartyref,
          message: data.message,
          rawResponse: data,
        };
      }

      // If the API didn't return meaningful data, treat as pending
      return {
        status: "PENDING",
        message: data.message || "Status unavailable",
        rawResponse: data,
      };
    } catch (error) {
      // Network failures should not flip a transaction to FAILED — keep PENDING
      return {
        status: "PENDING",
        message: error instanceof Error ? error.message : "Network error checking status",
        rawResponse: { error: String(error) },
      };
    }
  }

  // ---- Payouts ----

  /**
   * Moolre transfer channels. A different map from CHANNEL_MAP: the collection
   * and transfer endpoints do not share channel numbering (MTN is 13 to
   * collect, 1 to send).
   */
  private static readonly TRANSFER_CHANNEL_MAP: Record<MobileMoneyNetwork, string> = {
    MTN: "1",
    TELECEL: "6",
    AT: "7",
  };

  /**
   * Moolre transfers are synchronous — the POST response is the outcome, so
   * this never returns PENDING. Only an unreachable API leaves us unsure.
   */
  async initiateTransfer(params: InitiateTransferParams): Promise<TransferResult> {
    const channel = MoolreProvider.TRANSFER_CHANNEL_MAP[params.network];

    const body: Record<string, unknown> = {
      type: 1,
      channel,
      currency: params.currency,
      amount: fromMinorUnits(params.amount).toString(),
      receiver: params.receiver,
      externalref: params.externalRef,
      accountnumber: this.accountNumber,
      ...(params.reference && { reference: params.reference }),
    };

    try {
      const response = await fetch("https://api.moolre.com/open/transact/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-USER": this.apiUser,
          "X-API-KEY": this.apiKey, // Transfer uses the private key
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Successful initiation — code OBGH01. Note `status` comes back as the
      // string "1" here, unlike the numeric 1 on payment/status.
      if (String(data.status) === "1" && data.code === "OBGH01" && data.data) {
        return {
          status: "SUCCESS",
          providerRef: data.data.transactionid,
          message: flattenMessage(data.message) || "Transfer successful",
          rawResponse: data,
        };
      }

      // A parsed rejection is definitive — Moolre looked at it and said no
      // (unsupported channel, insufficient balance, duplicate externalref).
      return {
        status: "FAILED",
        message: flattenMessage(data.message) || "Transfer failed",
        rawResponse: data,
      };
    } catch (error) {
      // Never FAILED: the transfer may have gone through and reversing the
      // reserve here would double-pay the merchant.
      return {
        status: "UNKNOWN",
        message: error instanceof Error ? error.message : "Network error initiating transfer",
        rawResponse: { error: String(error) },
      };
    }
  }

  /**
   * Look a transfer up by our own reference. Transfers are synchronous, so
   * this exists for the reconciler: it resolves settlements left in an
   * UNKNOWN state by a network failure mid-transfer.
   */
  async checkTransferStatus(params: CheckTransferStatusParams): Promise<TransferResult> {
    const body = {
      type: 1,
      idtype: "1", // 1 = lookup by externalref
      id: params.externalRef,
      accountnumber: this.accountNumber,
    };

    try {
      const response = await fetch("https://api.moolre.com/open/transact/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-USER": this.apiUser,
          "X-API-PUBKEY": this.apiPubKey,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === 1 && data.data) {
        return {
          status: TX_TO_PAYOUT_STATUS[mapTxStatus(data.data.txstatus)],
          providerRef: data.data.transactionid,
          message: flattenMessage(data.message) || "Transfer status retrieved",
          rawResponse: data,
        };
      }

      // No usable body: we learned nothing. Leave the settlement reserved.
      return {
        status: "UNKNOWN",
        message: flattenMessage(data.message) || "Transfer status unavailable",
        rawResponse: data,
      };
    } catch (error) {
      return {
        status: "UNKNOWN",
        message: error instanceof Error ? error.message : "Network error checking transfer status",
        rawResponse: { error: String(error) },
      };
    }
  }
}

/** Moolre sometimes returns `message` as an array of strings. */
function flattenMessage(message: unknown): string {
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string") return message;
  return "";
}

/** The status lookup is shared with collections, so reuse its mapping. */
const TX_TO_PAYOUT_STATUS: Record<ProviderTxStatus, PayoutStatus> = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  NOT_FOUND: "NOT_FOUND",
  PENDING: "PENDING",
};
