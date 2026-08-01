// ============================================================
// Moolre mobile money provider adapter.
//
// Docs: knowledge/moolre/initiate-payment.md
//       knowledge/moolre/payment-status.md
//       knowledge/moolre/payment-webhook.md
// ============================================================

import type {
  MobileMoneyProvider,
  MobileMoneyNetwork,
  InitiatePaymentParams,
  InitiatePaymentResult,
  CheckStatusParams,
  CheckStatusResult,
  ProviderTxStatus,
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

export class MoolreProvider implements MobileMoneyProvider {
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

  // ---- Initiate Transfer (Settlement) ----

  /**
   * Maps a free-text provider name to a Moolre transfer channel.
   * Transfer channels: 1=MTN, 6=Telecel, 7=AT, 2=Instant Bank Transfer.
   * 
   * @throws Error if provider is not supported for transfers yet.
   */
  private mapTransferChannel(providerName: string): string {
    const normalized = providerName.toLowerCase();
    if (normalized.includes("mtn")) return "1";
    if (normalized.includes("telecel") || normalized.includes("vodafone")) return "6";
    if (normalized.includes("at") || normalized.includes("airteltigo")) return "7";
    
    throw new Error(`Unsupported transfer provider: ${providerName}`);
  }

  async initiateTransfer(params: {
    providerName: string;
    currency: string;
    amount: number; // minor units
    receiver: string;
    externalRef: string;
    sublistid?: string;
    reference?: string;
  }): Promise<{ success: boolean; message: string; providerRef?: string; rawResponse: any }> {
    const channel = this.mapTransferChannel(params.providerName);

    const body: Record<string, unknown> = {
      type: 1,
      channel,
      currency: params.currency,
      amount: fromMinorUnits(params.amount).toString(),
      receiver: params.receiver,
      externalref: params.externalRef,
      accountnumber: this.accountNumber,
      ...(params.sublistid && { sublistid: params.sublistid }),
      ...(params.reference && { reference: params.reference }),
    };

    try {
      const response = await fetch("https://api.moolre.com/open/transact/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-USER": this.apiUser,
          "X-API-KEY": this.apiKey, // Transfer uses Private Key
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Successful initiation — code OBGH01 and status 1
      if (data.status === "1" && data.code === "OBGH01" && data.data) {
        return {
          success: true,
          providerRef: data.data.transactionid,
          message: data.message ? (Array.isArray(data.message) ? data.message.join(" ") : data.message) : "Transfer successful",
          rawResponse: data,
        };
      }

      return {
        success: false,
        message: data.message ? (Array.isArray(data.message) ? data.message.join(" ") : data.message) : "Transfer failed",
        rawResponse: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error initiating transfer",
        rawResponse: { error: String(error) },
      };
    }
  }
}
