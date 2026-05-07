// GET /api/payments/[sessionId]/status — poll transaction status
import { type NextRequest } from "next/server";
import db from "@/lib/db";

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
