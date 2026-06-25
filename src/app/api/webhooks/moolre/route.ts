// POST /api/webhooks/moolre — receive payment lifecycle callbacks from Moolre
//
// Moolre POSTs to this URL when a payment is received or its status changes.
// Each provider gets its own webhook route under /api/webhooks/<provider>.
import { type NextRequest } from "next/server";
import db from "@/lib/db";

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

    // --- Map Moolre txstatus to internal status ---
    let internalStatus: "SUCCESS" | "FAILED" | "PROCESSING";
    switch (txstatus) {
      case 1:
        internalStatus = "SUCCESS";
        break;
      case 2:
        internalStatus = "FAILED";
        break;
      default:
        // 0 or unknown — still processing, nothing to update
        internalStatus = "PROCESSING";
    }

    // Only update if we have a terminal status
    if (internalStatus === "PROCESSING") {
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
    if (transaction.status === "SUCCESS" || transaction.status === "FAILED") {
      return Response.json({ received: true, status: "already_terminal" });
    }

    // --- Update in a DB transaction ---
    await db.transaction(async (trx) => {
      // Update the transaction
      await trx("transactions")
        .where({ id: transaction.id })
        .update({
          status: internalStatus,
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || "{}"),
            moolre_transaction_id: transactionid,
            moolre_webhook_received_at: new Date().toISOString(),
          }),
          updated_at: new Date(),
        });

      // Update the associated payment session
      if (internalStatus === "SUCCESS") {
        await trx("payment_sessions")
          .where({ transaction_id: transaction.id })
          .update({ status: "COMPLETED", updated_at: new Date() });

        // Credit the merchant's available balance
        await trx("merchants")
          .where({ id: transaction.merchant_id })
          .increment("available_balance", Number(transaction.amount));
      }

      // Log the event
      await trx("system_logs").insert({
        level: "INFO",
        source: "WEBHOOK_MOOLRE",
        event_description:
          `Moolre webhook: tx ${transaction.tx_id_display} → ${internalStatus}` +
          ` | amount=${amount} | payer=${payer} | moolre_id=${transactionid}`,
      });
    });

    // Moolre expects a 200 OK to stop retrying
    return Response.json({ received: true, status: internalStatus.toLowerCase() });
  } catch (error) {
    console.error("Moolre webhook error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
