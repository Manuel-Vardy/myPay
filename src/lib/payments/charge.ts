import "server-only";
import crypto from "crypto";
import db from "@/lib/db";
import type { PaymentMethod, Transaction } from "@/lib/types";
import { fromMinorUnits, normalizeMsisdn } from "@/lib/utils";
import { quoteFee } from "@/lib/fees";
import { recordTransactionEvent } from "@/lib/payments/tx-events";
import {
  assessDevice,
  toMetadata as deviceMetadata,
  type DeviceClaim,
} from "@/lib/payments/device-risk";
import { settleMomoPayment, failMomoPayment } from "@/lib/payments/settle-momo";
import {
  getMobileMoneyProvider,
  getFallbackMobileMoneyProvider,
  MOMO_PROVIDERS,
  normaliseProviderName,
} from "@/lib/payments";
import type { MobileMoneyNetwork, MobileMoneyProvider } from "@/lib/payments";

/**
 * Mobile money charge orchestration, shared by the hosted checkout
 * (/api/payments/process) and the server-to-server merchant API
 * (/api/v1/payments/charge). Both must create transactions, quote fees and
 * drive the provider identically — the only difference is who is asking.
 */

/** The subset of a `payment_sessions` row a charge needs. */
export interface ChargeSession {
  id: string;
  merchant_id: string;
  amount: string | number;
  currency: string;
  description?: string | null;
  /**
   * Who the merchant said is paying, when the session came from the API.
   * Outranks anything typed at checkout — the merchant's own records beat a
   * payer's typo, and on crypto it is the only identity that exists.
   */
  customer_email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
}

export type ChargeOutcome =
  | { kind: "OTP_REQUIRED"; transaction: Transaction; message: string }
  | { kind: "INITIATED"; transaction: Transaction; message: string }
  | { kind: "FAILED"; transaction: Transaction; message: string };

interface CreateTransactionInput {
  session: ChargeSession;
  method: PaymentMethod;
  payerEmail?: string | null;
  payerName?: string | null;
  walletAddress?: string | null;
  mobileMoneyNumber?: string | null;
  mobileMoneyNetwork?: string | null;
  /** Presence of an OTP means this may be a retry of an existing attempt. */
  otpCode?: string | null;
  device?: DeviceClaim | null;
  /** Actor recorded on the opening transaction event. */
  triggeredBy: string;
}

/**
 * Resolve the transaction a charge attempt should run against.
 *
 * When an OTP is supplied and an INITIATED transaction already exists for the
 * session, this is a retry of the same provider call: reuse that row so the
 * provider sees the same externalRef it saw the first time. Otherwise create
 * a fresh transaction.
 */
export async function createOrResumeTransaction(
  input: CreateTransactionInput
): Promise<{ transaction: Transaction; isOtpRetry: boolean }> {
  const {
    session,
    method,
    payerEmail,
    payerName,
    walletAddress,
    mobileMoneyNumber,
    mobileMoneyNetwork,
    otpCode,
    device,
    triggeredBy,
  } = input;

  // Session identity wins over anything the payer typed. Both are normalised
  // to one spelling so the same person doesn't become two customers.
  const resolvedEmail =
    session.customer_email?.trim().toLowerCase() || payerEmail?.trim().toLowerCase() || null;
  const resolvedName = session.customer_name?.trim() || payerName?.trim() || null;
  const resolvedPhone =
    normalizeMsisdn(session.customer_phone) || normalizeMsisdn(mobileMoneyNumber) || null;

  if (otpCode) {
    const existingTx = await db("transactions")
      .where({ payment_session_id: session.id, status: "INITIATED" })
      .orderBy("created_at", "desc")
      .first();

    if (existingTx) {
      return { transaction: existingTx, isOtpRetry: true };
    }
  }

  const txIdDisplay = `TX-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

  // Resolve the merchant's fee-bearer preference. If they've chosen to
  // pass the fee to the customer, the amount charged (and sent to the
  // gateway) is inflated by the fee so the merchant still nets the
  // original order amount at settlement.
  const merchant = await db("merchants")
    .where({ id: session.merchant_id })
    .first("id", "tier", "fee_bearer");

  const fee = await quoteFee(
    "PAYMENT_PROCESSING",
    {
      merchantId: session.merchant_id,
      merchantTier: merchant?.tier,
      currency: session.currency,
      method,
    },
    BigInt(String(session.amount))
  );

  const chargeAmount =
    merchant?.fee_bearer === "CUSTOMER"
      ? BigInt(String(session.amount)) + fee
      : BigInt(String(session.amount));

  // Identify the payer's device and score it against this device's recent
  // footprint. Runs before the insert so the attempt being created is not
  // counted in its own velocity. Fails open — see device-risk.ts.
  const deviceIntel = await assessDevice(db, device);

  const transaction = await db.transaction(async (trx) => {
    const [row] = await trx("transactions")
      .insert({
        tx_id_display: txIdDisplay,
        merchant_id: session.merchant_id,
        payment_session_id: session.id,
        amount: chargeAmount.toString(),
        currency: session.currency,
        crypto_amount: chargeAmount.toString(), // 1:1 simplified
        crypto_currency: "USDT",
        method,
        status: "INITIATED",
        payer_email: resolvedEmail,
        payer_name: resolvedName,
        payer_phone: resolvedPhone,
        payer_wallet_address: walletAddress || null,
        fee_basis_amount: session.amount,
        flag_level: deviceIntel.flagLevel,
        device_visitor_id: deviceIntel.visitorId,
        device_event_id: deviceIntel.eventId,
        metadata: JSON.stringify({
          session_id: session.id,
          mobile_money_number: mobileMoneyNumber || null,
          mobile_money_network: mobileMoneyNetwork || null,
          device: deviceMetadata(deviceIntel),
        }),
      })
      .returning("*");

    await recordTransactionEvent(trx, {
      transactionId: row.id,
      fromStatus: null, // first event
      toStatus: "INITIATED",
      triggeredBy,
      payload: {
        method,
        mobile_money_network: mobileMoneyNetwork || null,
        device_visitor_id: deviceIntel.visitorId,
        flag_level: deviceIntel.flagLevel,
        flag_reasons: deviceIntel.reasons,
      },
    });

    // Log the payment attempt
    await trx("system_logs").insert({
      level: "INFO",
      source: "GATEWAY_API",
      event_description: `Payment initiated: ${txIdDisplay} via ${method} for ${fromMinorUnits(chargeAmount)} ${session.currency}`,
    });

    // Surface anything the device scoring flagged into the security log the
    // admin console reads, so it is reviewable without joining on metadata.
    if (
      deviceIntel.flagLevel === "MEDIUM" ||
      deviceIntel.flagLevel === "HIGH" ||
      deviceIntel.flagLevel === "CRITICAL"
    ) {
      await trx("system_logs").insert({
        level: deviceIntel.flagLevel === "MEDIUM" ? "WARN" : "ERROR",
        source: "FRAUD_ENGINE",
        event_description: `Device risk ${deviceIntel.flagLevel} on ${txIdDisplay}: ${deviceIntel.reasons.join(", ")}`,
        metadata: JSON.stringify({
          transaction_id: row.id,
          merchant_id: session.merchant_id,
          device: deviceMetadata(deviceIntel),
        }),
      });
    }

    return row;
  });

  return { transaction, isOtpRetry: false };
}

/**
 * Create (or resume) a transaction and drive it through the active mobile
 * money provider, retrying on the fallback provider where one is configured.
 *
 * Never settles: a successful dispatch only means the prompt is out. The
 * transaction reaches SETTLED via the provider webhook, the status poll, or
 * the reconciliation cron — all of which funnel through settleMomoPayment.
 */
export async function chargeMobileMoney(input: {
  session: ChargeSession;
  network: MobileMoneyNetwork;
  phoneNumber: string;
  payerEmail?: string | null;
  payerName?: string | null;
  otpCode?: string | null;
  device?: DeviceClaim | null;
  triggeredBy: string;
}): Promise<ChargeOutcome> {
  const { session, network, phoneNumber, payerEmail, payerName, otpCode, device, triggeredBy } =
    input;

  const { transaction } = await createOrResumeTransaction({
    session,
    method: "MOBILE_MONEY",
    payerEmail,
    payerName,
    mobileMoneyNumber: phoneNumber,
    mobileMoneyNetwork: network,
    otpCode,
    device,
    triggeredBy,
  });

  const providerParams = {
    network,
    phoneNumber,
    amount: String(transaction.amount),
    currency: session.currency,
    externalRef: transaction.tx_id_display,
    reference: session.description || undefined,
    otpCode: otpCode || undefined,
    payerEmail: payerEmail || transaction.payer_email || undefined,
  };

  const provider = await getMobileMoneyProvider();
  let providerResult = await provider.initiatePayment(providerParams);
  let activeProviderName = provider.name;

  // Fallback logic — an OTP prompt is progress, not a failure, so don't
  // restart the charge on a different provider mid-flow.
  if (!providerResult.success && !providerResult.requiresOtp) {
    const fallbackProvider = await getFallbackMobileMoneyProvider();

    if (fallbackProvider) {
      console.warn(
        `Primary provider ${provider.name} failed, falling back to ${fallbackProvider.name}...`
      );

      // Same externalRef: the transaction is the unit of retry, not the call.
      const fallbackResult = await fallbackProvider.initiatePayment(providerParams);

      if (fallbackResult.success || fallbackResult.requiresOtp) {
        providerResult = fallbackResult;
        activeProviderName = fallbackProvider.name;
      }
    }
  }

  // Store provider response in metadata
  const currentMetadata = parseMetadata(transaction.metadata);

  await db("transactions")
    .where({ id: transaction.id })
    .update({
      metadata: JSON.stringify({
        ...currentMetadata,
        provider: activeProviderName,
        provider_ref: providerResult.providerRef || null,
        provider_response: providerResult.rawResponse,
      }),
    });

  // OTP required — the caller collects it and comes back
  if (providerResult.requiresOtp) {
    return {
      kind: "OTP_REQUIRED",
      transaction,
      message: providerResult.message || "Please enter the OTP sent to your phone",
    };
  }

  // Provider-side failure — mark transaction failed
  if (!providerResult.success) {
    const failureReason = providerResult.message || "Payment initiation failed at provider";

    await db.transaction(async (trx) => {
      await trx("transactions").where({ id: transaction.id }).update({
        status: "FAILED",
        failure_reason: failureReason,
        updated_at: new Date(),
      });
      await recordTransactionEvent(trx, {
        transactionId: transaction.id,
        fromStatus: "INITIATED",
        toStatus: "FAILED",
        triggeredBy: `provider:${activeProviderName.toLowerCase()}`,
        payload: {
          provider: activeProviderName,
          providerMessage: providerResult.message || null,
          provider_response: providerResult.rawResponse ?? null,
        },
      });
    });

    return {
      kind: "FAILED",
      transaction: { ...transaction, status: "FAILED", failure_reason: failureReason },
      message: providerResult.message || "Payment initiation failed",
    };
  }

  return {
    kind: "INITIATED",
    transaction,
    message: "Payment prompt sent to your phone. Please approve it.",
  };
}

// ---------- Status polling ----------

/** How stale a provider poll must be before we make another call. */
const DEFAULT_POLL_THROTTLE_MS = 0;

/**
 * Ask the provider where an in-flight mobile money transaction stands, and
 * settle or fail it if the answer is terminal.
 *
 * Shared by the checkout status route and the merchant API status route so
 * there is exactly one copy of the settle/fail decision. Returns the
 * transaction's status after the check — unchanged if the provider is still
 * working, if the call failed, or if the poll was throttled.
 *
 * `minIntervalMs` guards the provider's rate limit against a caller polling
 * faster than payments actually move. Settlement is webhook-driven anyway,
 * so a throttled poll usually just reads a row the webhook already updated.
 */
export async function pollAndSettleMomo(
  transaction: Transaction,
  opts?: { minIntervalMs?: number }
): Promise<string> {
  if (transaction.method !== "MOBILE_MONEY" || transaction.status !== "INITIATED") {
    return transaction.status;
  }

  const metadata = parseMetadata(transaction.metadata);
  const minIntervalMs = opts?.minIntervalMs ?? DEFAULT_POLL_THROTTLE_MS;

  if (minIntervalMs > 0) {
    const lastPolledAt = metadata.last_provider_poll_at;
    if (
      typeof lastPolledAt === "string" &&
      Date.now() - new Date(lastPolledAt).getTime() < minIntervalMs
    ) {
      return transaction.status;
    }
  }

  try {
    // Resolve from metadata, not the active setting: a transaction created
    // before an admin switched providers must still be polled against the
    // provider that actually holds it.
    const provider = await resolveTransactionProvider(metadata.provider);

    if (minIntervalMs > 0) {
      await db("transactions")
        .where({ id: transaction.id })
        .update({
          metadata: JSON.stringify({
            ...metadata,
            last_provider_poll_at: new Date().toISOString(),
          }),
        });
    }

    const statusResult = await provider.checkStatus({
      externalRef: transaction.tx_id_display,
    });

    // Provider "SUCCESS" maps to the SETTLED enum value (funds are credited
    // to the merchant float by settleMomoPayment).
    // NOT_FOUND is treated like PENDING here: while the payer is still on the
    // prompt the provider may not have created the transaction yet (e.g. OTP
    // flow) — only the reconciliation cron ages those out.
    if (statusResult.status === "SUCCESS") {
      await settleMomoPayment({
        transactionId: transaction.id,
        providerRef: statusResult.providerRef || null,
        thirdPartyRef: statusResult.thirdPartyRef || null,
        providerName: provider.name,
        source: "STATUS_POLL",
      });
      return "SETTLED";
    }

    if (statusResult.status === "FAILED") {
      await failMomoPayment({
        transactionId: transaction.id,
        providerRef: statusResult.providerRef || null,
        providerMessage: statusResult.message,
        providerName: provider.name,
        source: "STATUS_POLL",
      });
      return "FAILED";
    }
  } catch (pollError) {
    // Log but don't fail the request — the caller returns the DB status
    console.warn("Provider status poll error:", pollError);
  }

  return transaction.status;
}

/**
 * Resolve the provider that owns a transaction from its recorded name,
 * falling back to the currently active one for rows written before the
 * provider was stamped into metadata.
 */
export async function resolveTransactionProvider(
  metadataProvider: unknown
): Promise<MobileMoneyProvider> {
  if (typeof metadataProvider === "string") {
    const provider = MOMO_PROVIDERS[normaliseProviderName(metadataProvider)];
    if (provider) return provider;
  }
  return getMobileMoneyProvider();
}

/** transactions.metadata is jsonb but arrives as a string on some drivers. */
export function parseMetadata(metadata: unknown): Record<string, unknown> {
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata || "{}");
    } catch {
      return {};
    }
  }
  return (metadata as Record<string, unknown>) || {};
}
