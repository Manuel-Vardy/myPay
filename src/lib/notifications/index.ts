import "server-only";
import db from "@/lib/db";
import { notifyMerchantTransactionSettled, notifyPayerTransactionSettled } from "./transaction-alerts";

// Re-exports from auth-alerts
export { sendPasswordResetEmail, sendVerificationEmail, sendAdminAlertEmail } from "./auth-alerts";

// Main orchestrator
export async function notifyTransactionSettled(transactionId: string): Promise<void> {
  try {
    const transaction = await db("transactions").where("id", transactionId).first();
    if (!transaction) return;

    // Description lives on the payment session, not the transaction row.
    const session = transaction.payment_session_id
      ? await db("payment_sessions")
          .where("id", transaction.payment_session_id)
          .first("description")
      : null;
    const description: string | null = session?.description ?? null;
    
    const merchant = await db("merchants").where("id", transaction.merchant_id).first();
    if (!merchant) return;
    
    const merchantUser = await db("users").where("id", merchant.user_id).first();
    if (!merchantUser) return;
    
    await Promise.allSettled([
      notifyMerchantTransactionSettled(transaction, merchant, merchantUser, description),
      notifyPayerTransactionSettled(transaction, merchant.business_name || "Merchant", description)
    ]);
  } catch (error) {
    console.error("Error in notifyTransactionSettled orchestrator:", error);
  }
}
