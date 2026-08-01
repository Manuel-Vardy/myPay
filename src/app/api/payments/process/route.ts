import { type NextRequest } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";
import { getMobileMoneyProvider, isCardPaymentsEnabled, isCryptoPaymentsEnabled } from "@/lib/payments";
import { isMerchantPaused } from "@/lib/payments/controls";
import type { MobileMoneyNetwork } from "@/lib/payments";
import type { Transaction } from "@/lib/types";
import { fromMinorUnits } from "@/lib/utils";
import { recordTransactionEvent } from "@/lib/payments/tx-events";
import { quoteFee } from "@/lib/fees";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      method,
      payer_email,
      wallet_address,
      mobile_money_number,
      mobile_money_network,
      otp_code,
    } = body;

    if (!session_id || !method) {
      return Response.json(
        { error: "session_id and method are required" },
        { status: 400 }
      );
    }

    // Validate session
    const session = await db("payment_sessions")
      .where({ id: session_id, status: "ACTIVE" })
      .first();

    if (!session) {
      return Response.json(
        { error: "Invalid or inactive payment session" },
        { status: 400 }
      );
    }

    if (new Date(session.expires_at) < new Date()) {
      await db("payment_sessions")
        .where({ id: session_id })
        .update({ status: "EXPIRED" });
      return Response.json(
        { error: "Payment session has expired" },
        { status: 410 }
      );
    }

    // Pausing expires outstanding sessions, so this is belt-and-braces:
    // it closes the race where a session is minted as the pause commits.
    const sessionMerchant = await db("merchants")
      .where({ id: session.merchant_id })
      .first("id", "payments_paused_at");
    if (sessionMerchant && isMerchantPaused(sessionMerchant)) {
      return Response.json(
        { error: "This merchant is not currently accepting payments" },
        { status: 403 }
      );
    }

    // Card payments are admin-gated until the acquiring bank is wired up.
    // The checkout UI hides the option, but refuse here too.
    if (method === "CARD" && !(await isCardPaymentsEnabled())) {
      return Response.json(
        { error: "Card payments are currently unavailable" },
        { status: 403 }
      );
    }

    // Crypto is admin-gated too (e.g. switched off during a provider incident).
    if (method === "CRYPTO" && !(await isCryptoPaymentsEnabled())) {
      return Response.json(
        { error: "Crypto payments are currently unavailable" },
        { status: 403 }
      );
    }

    // Mobile money specific validation
    if (method === "MOBILE_MONEY") {
      if (!mobile_money_number) {
        return Response.json(
          { error: "mobile_money_number is required for mobile money payments" },
          { status: 400 }
        );
      }
      if (!mobile_money_network || !["MTN", "TELECEL", "AT"].includes(mobile_money_network)) {
        return Response.json(
          { error: "mobile_money_network must be one of: MTN, TELECEL, AT" },
          { status: 400 }
        );
      }
    }

    // ---- OTP retry detection ----
    // If an otp_code is provided AND an INITIATED transaction already exists
    // for this session, this is a retry of the same Moolre initiate call.
    // We must reuse the existing transaction (and its externalref / tx_id_display)
    // so Moolre receives the same externalref it saw on the first call.
    // Definite assignment: set either in the OTP-retry branch or the
    // create-transaction branch below.
    let result!: Transaction;
    let isOtpRetry = false;

    if (otp_code) {
      const existingTx = await db("transactions")
        .where({ payment_session_id: session_id, status: "INITIATED" })
        .orderBy("created_at", "desc")
        .first();

      if (existingTx) {
        result = existingTx;
        isOtpRetry = true;
      }
    }

    // ---- Create transaction (only on first attempt) ----
    if (!isOtpRetry) {
      const txIdDisplay = `TX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

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

      result = await db.transaction(async (trx) => {
        const [transaction] = await trx("transactions")
          .insert({
            tx_id_display: txIdDisplay,
            merchant_id: session.merchant_id,
            payment_session_id: session_id,
            amount: chargeAmount.toString(),
            currency: session.currency,
            crypto_amount: chargeAmount.toString(), // 1:1 simplified
            crypto_currency: "USDT",
            method,
            status: "INITIATED",
            payer_email: payer_email || null,
            payer_wallet_address: wallet_address || null,
            fee_basis_amount: session.amount,
            metadata: JSON.stringify({
              session_id,
              mobile_money_number: mobile_money_number || null,
              mobile_money_network: mobile_money_network || null,
            }),
          })
          .returning("*");

        await recordTransactionEvent(trx, {
          transactionId: transaction.id,
          fromStatus: null, // first event
          toStatus: "INITIATED",
          triggeredBy: "payer:checkout",
          payload: {
            method,
            mobile_money_network: mobile_money_network || null,
          },
        });

        // Log the payment attempt
        await trx("system_logs").insert({
          level: "INFO",
          source: "GATEWAY_API",
          event_description: `Payment initiated: ${txIdDisplay} via ${method} for ${fromMinorUnits(chargeAmount)} ${session.currency}`,
        });

        return transaction;
      });
    }

    // ---------- Dispatch to payment provider ----------

    if (method === "MOBILE_MONEY") {
      const provider = await getMobileMoneyProvider();
      let providerResult = await provider.initiatePayment({
        network: mobile_money_network as MobileMoneyNetwork,
        phoneNumber: mobile_money_number,
        amount: String(result.amount),
        currency: session.currency,
        externalRef: result.tx_id_display,
        reference: session.description || undefined,
        otpCode: otp_code || undefined,
      });
      let activeProviderName = provider.name;

      // Fallback logic
      if (!providerResult.success && !providerResult.requiresOtp) {
        const { getFallbackMobileMoneyProvider } = await import("@/lib/payments");
        const fallbackProvider = await getFallbackMobileMoneyProvider();
        
        if (fallbackProvider) {
          console.warn(`Primary provider ${provider.name} failed, falling back to ${fallbackProvider.name}...`);
          
          const fallbackResult = await fallbackProvider.initiatePayment({
            network: mobile_money_network as MobileMoneyNetwork,
            phoneNumber: mobile_money_number,
            amount: String(result.amount),
            currency: session.currency,
            externalRef: result.tx_id_display, // reuse the tx_id_display
            reference: session.description || undefined,
            otpCode: otp_code || undefined,
          });

          // If the fallback succeeded (or requested OTP), use its result
          if (fallbackResult.success || fallbackResult.requiresOtp) {
            providerResult = fallbackResult;
            activeProviderName = fallbackProvider.name;
          }
        }
      }

      // Store provider response in metadata
      const currentMetadata = typeof result.metadata === 'string'
        ? JSON.parse(result.metadata)
        : (result.metadata || {});

      await db("transactions")
        .where({ id: result.id })
        .update({
          metadata: JSON.stringify({
            ...currentMetadata,
            provider: activeProviderName,
            provider_ref: providerResult.providerRef || null,
            provider_response: providerResult.rawResponse,
          }),
        });

      // OTP required — tell the frontend to collect and retry
      if (providerResult.requiresOtp) {
        return Response.json(
          {
            transaction_id: result.id,
            tx_id_display: result.tx_id_display,
            status: "OTP_REQUIRED",
            message: providerResult.message || "Please enter the OTP sent to your phone",
          },
          { status: 202 }
        );
      }

      // Provider-side failure — mark transaction failed
      if (!providerResult.success) {
        const failureReason =
          providerResult.message || "Payment initiation failed at provider";
        await db.transaction(async (trx) => {
          await trx("transactions")
            .where({ id: result.id })
            .update({
              status: "FAILED",
              failure_reason: failureReason,
              updated_at: new Date(),
            });
          await recordTransactionEvent(trx, {
            transactionId: result.id,
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

        return Response.json(
          {
            transaction_id: result.id,
            tx_id_display: result.tx_id_display,
            status: "FAILED",
            message: providerResult.message || "Payment initiation failed",
          },
          { status: 422 }
        );
      }

      // Successfully initiated — payer should see a USSD prompt
      return Response.json(
        {
          transaction_id: result.id,
          tx_id_display: result.tx_id_display,
          status: "INITIATED",
          amount: fromMinorUnits(result.amount),
          currency: result.currency,
          method: result.method,
          message: "Payment prompt sent to your phone. Please approve it.",
        },
        { status: 202 }
      );
    }

    // TODO: Dispatch to actual payment processor for other methods
    // (Turnkey/Alchemy for crypto, card processor for cards)
    // For now, non-mobile-money methods return a simulated processing state

    return Response.json(
      {
        transaction_id: result.id,
        tx_id_display: result.tx_id_display,
        status: result.status,
        amount: fromMinorUnits(result.amount),
        currency: result.currency,
        method: result.method,
        message: "Payment is being processed",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Payment process error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
