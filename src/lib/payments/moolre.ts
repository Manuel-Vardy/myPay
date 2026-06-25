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
      amount: params.amount,
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
}
