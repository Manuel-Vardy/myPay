import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { isCardPaymentsEnabled, isCryptoPaymentsEnabled } from "@/lib/payments";
import { isMerchantPaused } from "@/lib/payments/controls";
import type { MobileMoneyNetwork } from "@/lib/payments";
import { chargeMobileMoney, createOrResumeTransaction } from "@/lib/payments/charge";
import { fromMinorUnits } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      method,
      payer_email,
      payer_name,
      wallet_address,
      mobile_money_number,
      mobile_money_network,
      otp_code,
      device,
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

    // ---------- Mobile money ----------

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

      // Transaction creation, OTP-retry reuse, fee quoting, device scoring and
      // provider dispatch all live in the shared orchestrator — the merchant
      // API drives the identical path.
      const outcome = await chargeMobileMoney({
        session,
        network: mobile_money_network as MobileMoneyNetwork,
        phoneNumber: mobile_money_number,
        payerEmail: payer_email,
        payerName: payer_name,
        otpCode: otp_code,
        device,
        triggeredBy: "payer:checkout",
      });

      const { transaction } = outcome;

      // OTP required — tell the frontend to collect and retry
      if (outcome.kind === "OTP_REQUIRED") {
        return Response.json(
          {
            transaction_id: transaction.id,
            tx_id_display: transaction.tx_id_display,
            status: "OTP_REQUIRED",
            message: outcome.message,
          },
          { status: 202 }
        );
      }

      if (outcome.kind === "FAILED") {
        return Response.json(
          {
            transaction_id: transaction.id,
            tx_id_display: transaction.tx_id_display,
            status: "FAILED",
            message: outcome.message,
          },
          { status: 422 }
        );
      }

      // Successfully initiated — payer should see a USSD prompt
      return Response.json(
        {
          transaction_id: transaction.id,
          tx_id_display: transaction.tx_id_display,
          status: "INITIATED",
          amount: fromMinorUnits(transaction.amount),
          currency: transaction.currency,
          method: transaction.method,
          message: outcome.message,
        },
        { status: 202 }
      );
    }

    // TODO: Dispatch to actual payment processor for other methods
    // (Turnkey/Alchemy for crypto, card processor for cards)
    // For now, non-mobile-money methods return a simulated processing state

    const { transaction } = await createOrResumeTransaction({
      session,
      method,
      payerEmail: payer_email,
      payerName: payer_name,
      walletAddress: wallet_address,
      mobileMoneyNumber: mobile_money_number,
      mobileMoneyNetwork: mobile_money_network,
      otpCode: otp_code,
      device,
      triggeredBy: "payer:checkout",
    });

    return Response.json(
      {
        transaction_id: transaction.id,
        tx_id_display: transaction.tx_id_display,
        status: transaction.status,
        amount: fromMinorUnits(transaction.amount),
        currency: transaction.currency,
        method: transaction.method,
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
