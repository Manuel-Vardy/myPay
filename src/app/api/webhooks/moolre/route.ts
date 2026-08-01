// POST /api/webhooks/moolre — receive payment lifecycle callbacks from Moolre
//
// Moolre POSTs to this URL when a payment is received or its status changes.
// Each provider gets its own webhook route under /api/webhooks/<provider>.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { chargeTransactionFee } from "@/lib/fees";
import { settleMomoPayment, failMomoPayment } from "@/lib/payments/settle-momo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- Verify webhook authenticity ---
    const webhookSecret = process.env.MOOLRE_WEBHOOK_SECRET;
    if (webhookSecret && body.data?.secret !== webhookSecret) {
      console.warn("Moolre webhook: secret mismatch — rejecting");
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { txstatus, externalref, transactionid, amount, payer } = body.data ?? {};

    if (!externalref) {
      console.warn("Moolre webhook: missing externalref in payload");
      return Response.json({ error: "Missing externalref" }, { status: 400 });
    }

    // --- Map Moolre txstatus to internal transaction_status enum values ---
    // Provider "success" maps to SETTLED, matching the crypto settlement
    // path (funds are credited to the merchant float immediately below).
    let internalStatus: "SETTLED" | "FAILED" | "INITIATED";
    switch (txstatus) {
      case 1:
        internalStatus = "SETTLED";
        break;
      case 2:
        internalStatus = "FAILED";
        break;
      default:
        // 0 or unknown — still processing, nothing to update
        internalStatus = "INITIATED";
    }

    // Only update if we have a terminal status
    if (internalStatus === "INITIATED") {
      return Response.json({ received: true, status: "still_processing" });
    }

    // --- Look up the transaction by the externalref stored in metadata ---
    // The externalref is the transaction's tx_id_display, which we set
    // as the externalref when calling Moolre.
    const transaction = await db("transactions")
      .where({ tx_id_display: externalref })
      .first();

    if (!transaction) {
      console.warn(`Moolre webhook: no transaction found for externalref=${externalref}`);
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Don't re-process already terminal transactions
    if (transaction.status === "SETTLED" || transaction.status === "FAILED") {
      return Response.json({ received: true, status: "already_terminal" });
    }

    if (internalStatus === "SETTLED") {
      await settleMomoPayment({
        transactionId: transaction.id,
        providerRef: transactionid,
        providerName: "Moolre",
        source: "WEBHOOK_MOOLRE",
      });
    } else if (internalStatus === "FAILED") {
      await failMomoPayment({
        transactionId: transaction.id,
        providerRef: transactionid,
        providerName: "Moolre",
        source: "WEBHOOK_MOOLRE",
      });
    }

    // Moolre expects a 200 OK to stop retrying
    return Response.json({ received: true, status: internalStatus.toLowerCase() });
  } catch (error) {
    console.error("Moolre webhook error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
