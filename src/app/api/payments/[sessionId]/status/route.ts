// GET /api/payments/[sessionId]/status — poll transaction status
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getMobileMoneyProvider, getCryptoProvider } from "@/lib/payments";
import {
  finaliseCryptoPayment,
  expireCryptoPayment,
} from "@/lib/payments/crypto-helpers";
import { fromMinorUnits } from "@/lib/utils";
import { chargeTransactionFee } from "@/lib/fees";
import { settleMomoPayment, failMomoPayment } from "@/lib/payments/settle-momo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const transaction = await db("transactions")
      .where({ id: sessionId })
      .first();

    if (!transaction) {
      return Response.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // --- Live provider check for in-flight mobile money transactions ---
    if (
      transaction.method === "MOBILE_MONEY" &&
      transaction.status === "INITIATED"
    ) {
      try {
        const provider = await getMobileMoneyProvider();
        const statusResult = await provider.checkStatus({
          externalRef: transaction.tx_id_display,
        });

        // If the provider reports a terminal state, update DB.
        // Provider "SUCCESS" maps to the SETTLED enum value (funds are
        // credited to the merchant float immediately below).
        // NOT_FOUND is treated like PENDING here: while the payer is on the
        // checkout page the provider may not have created the transaction
        // yet (e.g. OTP flow) — only the reconciliation cron ages those out.
        if (statusResult.status === "SUCCESS" || statusResult.status === "FAILED") {
          const newStatus =
            statusResult.status === "SUCCESS" ? "SETTLED" : "FAILED";

          if (newStatus === "SETTLED") {
            await settleMomoPayment({
              transactionId: transaction.id,
              providerRef: statusResult.providerRef || null,
              thirdPartyRef: statusResult.thirdPartyRef || null,
              providerName: provider.name,
              source: "STATUS_POLL",
            });
          } else {
            await failMomoPayment({
              transactionId: transaction.id,
              providerRef: statusResult.providerRef || null,
              providerMessage: statusResult.message,
              providerName: provider.name,
              source: "STATUS_POLL",
            });
          }

          // Update the in-memory transaction for the response below
          transaction.status = newStatus;
        }
      } catch (pollError) {
        // Log but don't fail the request — return current DB status
        console.warn("Provider status poll error:", pollError);
      }
    }

    // --- Live provider check for in-flight crypto transactions ---
    if (
      transaction.method === "CRYPTO" &&
      transaction.status === "AUTHORIZED"
    ) {
      try {
        const metadata = typeof transaction.metadata === "string"
          ? JSON.parse(transaction.metadata)
          : transaction.metadata || {};

        const invoiceId = metadata.triton_invoice_id;

        if (invoiceId) {
          const crypto = getCryptoProvider();
          const invoice = await crypto.getInvoice(invoiceId);

          if (invoice.status === "PAID") {
            // Get network hash from payments list
            let networkHash: string | null = null;
            try {
              const payments = await crypto.listPayments(invoiceId);
              const confirmed = payments.find(
                (p) => p.status === "CONFIRMED" || p.status === "SWEPT"
              );
              if (confirmed) networkHash = confirmed.hash;
            } catch {
              // Non-fatal — proceed without hash
            }

            const settled = await finaliseCryptoPayment({
              transactionId: transaction.id,
              networkHash,
              triggeredBy: "status_poll",
            });

            if (settled) {
              transaction.status = "SETTLED";
              transaction.crypto_network_hash = networkHash || transaction.crypto_network_hash;
            }
          } else if (
            invoice.status === "CANCELLED" ||
            (invoice.status === "CREATED" && metadata.triton_address_lease_expires_at &&
              new Date(metadata.triton_address_lease_expires_at) < new Date())
          ) {
            const expired = await expireCryptoPayment(
              transaction.id,
              "status_poll"
            );
            if (expired) {
              transaction.status = "EXPIRED";
            }
          }
        }
      } catch (pollError) {
        console.warn("Crypto status poll error:", pollError);
      }
    }

    // --- Build response ---
    const response: Record<string, unknown> = {
      transaction_id: transaction.id,
      tx_id_display: transaction.tx_id_display,
      status: transaction.status,
      amount: fromMinorUnits(transaction.amount),
      currency: transaction.currency,
      method: transaction.method,
    };

    // If successful, include receipt data
    if (transaction.status === "SETTLED") {
      response.receipt = {
        tx_id_display: transaction.tx_id_display,
        amount: fromMinorUnits(transaction.amount),
        currency: transaction.currency,
        crypto_amount: transaction.crypto_amount ? Number(transaction.crypto_amount) : null,
        crypto_currency: transaction.crypto_currency,
        processing_fee: Number(transaction.processing_fee),
        network_gas: Number(transaction.network_gas),
        crypto_network_hash: transaction.crypto_network_hash,
        completed_at: transaction.updated_at,
      };
    }

    // If failed, include failure info
    if (transaction.status === "FAILED" || transaction.status === "EXPIRED") {
      response.error_details = {
        message: transaction.status === "EXPIRED"
          ? "Payment expired. Please try again."
          : "Transaction could not be completed. Please try again or contact support.",
        support_email: "support@trite.tech",
      };
    }

    return Response.json(response);
  } catch (error) {
    console.error("Payment status error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
