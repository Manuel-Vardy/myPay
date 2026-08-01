import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { settleMomoPayment, failMomoPayment } from "@/lib/payments/settle-momo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // The user decided to proceed without auth for now (IP whitelisting or similar can be handled at infra level).
    // Orchard does not sign their callback payload out-of-the-box in the same way Moolre does.
    
    const { trans_id, trans_ref, trans_status, message } = body;

    if (!trans_ref) {
      console.warn("ANM webhook: missing trans_ref (our externalref) in payload");
      return Response.json({ error: "Missing trans_ref" }, { status: 400 });
    }

    // Map ANM trans_status to internal transaction_status
    // trans_status starting with "000" = SUCCESS, "001" = FAILED
    let internalStatus: "SETTLED" | "FAILED" | "INITIATED";
    
    if (typeof trans_status === "string" && trans_status.startsWith("000")) {
      internalStatus = "SETTLED";
    } else if (typeof trans_status === "string" && trans_status.startsWith("001")) {
      internalStatus = "FAILED";
    } else {
      internalStatus = "INITIATED"; // unexpected or pending, ignore
    }

    if (internalStatus === "INITIATED") {
      return Response.json({ received: true, status: "still_processing" });
    }

    const transaction = await db("transactions")
      .where({ tx_id_display: trans_ref })
      .first();

    if (!transaction) {
      console.warn(`ANM webhook: no transaction found for trans_ref=${trans_ref}`);
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Don't re-process already terminal transactions
    if (transaction.status === "SETTLED" || transaction.status === "FAILED") {
      return Response.json({ received: true, status: "already_terminal" });
    }

    if (internalStatus === "SETTLED") {
      await settleMomoPayment({
        transactionId: transaction.id,
        providerRef: trans_id,
        providerName: "anm",
        source: "WEBHOOK_ANM",
      });
    } else if (internalStatus === "FAILED") {
      await failMomoPayment({
        transactionId: transaction.id,
        providerRef: trans_id,
        providerMessage: message,
        providerName: "anm",
        source: "WEBHOOK_ANM",
      });
    }

    return Response.json({ received: true, status: internalStatus.toLowerCase() });
  } catch (error) {
    console.error("ANM webhook error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
