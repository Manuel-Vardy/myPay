import crypto from "crypto";
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

// ---------- ANM-specific constants ----------

/** Map our canonical network names to ANM network codes. */
const CHANNEL_MAP: Record<MobileMoneyNetwork, string> = {
  MTN: "MTN",
  TELECEL: "VOD",
  AT: "AIR",
};

/** Map ANM trans_status codes to our normalised status. */
function mapTxStatus(transStatus: string): ProviderTxStatus {
  if (transStatus.startsWith("000")) {
    return "SUCCESS";
  }
  if (transStatus.startsWith("001")) {
    return "FAILED";
  }
  return "PENDING";
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

export class AnmProvider implements MobileMoneyProvider {
  readonly name = "anm";

  private get clientKey(): string {
    return requireEnv("ANM_CLIENT_KEY");
  }

  private get clientSecret(): string {
    return requireEnv("ANM_CLIENT_SECRET");
  }

  private get serviceId(): string {
    return requireEnv("ANM_SERVICE_ID");
  }

  private get baseUrl(): string {
    return process.env.ANM_BASE_URL || "https://orchard-api.anmgw.com";
  }

  private generateHeaders(body: unknown): Record<string, string> {
    const payload = JSON.stringify(body);
    const signature = crypto
      .createHmac("sha256", this.clientSecret)
      .update(payload)
      .digest("hex");

    return {
      "Content-Type": "application/json",
      Authorization: `${this.clientKey}:${signature}`,
    };
  }

  private getTimestamp(): string {
    // Format: YYYY-MM-DD HH:MI:SS
    const now = new Date();
    return now.toISOString().replace("T", " ").substring(0, 19);
  }

  // ---- Initiate Payment ----

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const nw = CHANNEL_MAP[params.network];
    
    // ANM calls this URL back on payment events. It must always resolve to
    // the payments API deployment (api.xx.com), regardless of which service
    // handles this request — never derive it from the request's own host.
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const callback_url = `${apiBaseUrl}/api/webhooks/anm`;

    const body = {
      amount: fromMinorUnits(params.amount).toFixed(2), // ANM expects float string (e.g. "10.00")
      callback_url,
      customer_number: params.phoneNumber,
      exttrid: params.externalRef,
      nw,
      reference: params.reference || "Payment",
      service_id: parseInt(this.serviceId, 10),
      trans_type: "CTM",
      ts: this.getTimestamp(),
    };

    try {
      const response = await fetch(`${this.baseUrl}/sendRequest`, {
        method: "POST",
        headers: this.generateHeaders(body),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // resp_code "015" = accepted for processing
      if (data.resp_code === "015") {
        return {
          success: true,
          requiresOtp: false, // Orchard uses USSD PIN, no OTP step needed
          message: data.resp_desc || "Payment request sent to phone",
          rawResponse: data,
        };
      }

      // Anything else is a failure
      return {
        success: false,
        message: data.resp_desc || "Payment initiation failed",
        rawResponse: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error contacting AppsNMobile",
        rawResponse: { error: String(error) },
      };
    }
  }

  // ---- Check Status ----

  async checkStatus(params: CheckStatusParams): Promise<CheckStatusResult> {
    const body = {
      exttrid: params.externalRef,
      trans_type: "TSC",
      service_id: parseInt(this.serviceId, 10),
    };

    try {
      const response = await fetch(`${this.baseUrl}/checkTransaction`, {
        method: "POST",
        headers: this.generateHeaders(body),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // If trans_status is missing, treat as pending
      if (!data.trans_status) {
        return {
          status: "PENDING",
          message: data.message || "Status unavailable",
          rawResponse: data,
        };
      }

      return {
        status: mapTxStatus(data.trans_status),
        providerRef: data.trans_id,
        message: data.message,
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
