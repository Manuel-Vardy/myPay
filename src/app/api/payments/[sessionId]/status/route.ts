// GET /api/payments/[sessionId]/status — poll transaction status
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getMobileMoneyProvider } from "@/lib/payments";

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
      transaction.status === "PROCESSING"
    ) {
      try {
        const provider = getMobileMoneyProvider();
        const statusResult = await provider.checkStatus({
          externalRef: transaction.tx_id_display,
        });

        // If the provider reports a terminal state, update DB
        if (statusResult.status !== "PENDING") {
          const newStatus = statusResult.status; // "SUCCESS" | "FAILED"

          await db.transaction(async (trx) => {
            await trx("transactions")
              .where({ id: transaction.id })
              .update({
                status: newStatus,
                metadata: JSON.stringify({
                  ...JSON.parse(transaction.metadata || "{}"),
                  provider_status_ref: statusResult.providerRef || null,
                  provider_third_party_ref: statusResult.thirdPartyRef || null,
                  status_checked_at: new Date().toISOString(),
                }),
                updated_at: new Date(),
              });

            if (newStatus === "SUCCESS") {
              // Mark payment session as completed
              await trx("payment_sessions")
                .where({ transaction_id: transaction.id })
                .update({ status: "COMPLETED", updated_at: new Date() });

              // Credit the merchant's available balance
              await trx("merchants")
                .where({ id: transaction.merchant_id })
                .increment("available_balance", Number(transaction.amount));
            }

            await trx("system_logs").insert({
              level: "INFO",
              source: "STATUS_POLL",
              event_description:
                `Status poll: tx ${transaction.tx_id_display} → ${newStatus}` +
                ` | provider_ref=${statusResult.providerRef}`,
            });
          });

          // Update the in-memory transaction for the response below
          transaction.status = newStatus;
        }
      } catch (pollError) {
        // Log but don't fail the request — return current DB status
        console.warn("Provider status poll error:", pollError);
      }
    }

    // --- Build response ---
    const response: Record<string, unknown> = {
      transaction_id: transaction.id,
      tx_id_display: transaction.tx_id_display,
      status: transaction.status,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      method: transaction.method,
    };

    // If successful, include receipt data
    if (transaction.status === "SUCCESS") {
      response.receipt = {
        tx_id_display: transaction.tx_id_display,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        stablecoin_amount: Number(transaction.stablecoin_amount),
        stablecoin_currency: transaction.stablecoin_currency,
        processing_fee: Number(transaction.processing_fee),
        network_gas: Number(transaction.network_gas),
        network_hash: transaction.network_hash,
        completed_at: transaction.updated_at,
      };
    }

    // If failed, include failure info
    if (transaction.status === "FAILED") {
      response.error_details = {
        message: "Transaction could not be completed. Please try again or contact support.",
        support_email: "support@trite.io",
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
