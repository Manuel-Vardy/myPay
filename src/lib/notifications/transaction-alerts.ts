import "server-only";
import { sendEmail, DASHBOARD_BASE_URL } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { fromMinorUnits } from "@/lib/utils";
import type { Merchant, MerchantNotificationSettings, Transaction, User } from "@/lib/types";
import { merchantTransactionEmail, payerConfirmationEmail } from "./templates";

/**
 * `notification_settings` is jsonb, which the driver hands back as an object
 * on most paths and as a string on some. Unparseable settings are treated as
 * empty, which means opted out — a merchant is never emailed on a guess.
 */
function parseNotificationSettings(
  raw: Merchant["notification_settings"] | string
): Partial<MerchantNotificationSettings> {
  if (typeof raw !== "string") return raw ?? {};
  try {
    return JSON.parse(raw) as Partial<MerchantNotificationSettings>;
  } catch {
    return {};
  }
}

export async function notifyMerchantTransactionSettled(
  transaction: Transaction,
  merchant: Merchant,
  merchantUser: Pick<User, "email">,
  description: string | null
) {
  try {
    const settings = parseNotificationSettings(merchant.notification_settings);

    if (settings?.transactions !== true) {
      return;
    }

    const emailTo = merchant.notification_email ?? merchantUser.email;
    if (!emailTo) return;
    
    const amountStr = fromMinorUnits(transaction.amount).toFixed(2);
    
    const template = merchantTransactionEmail({
      txIdDisplay: transaction.tx_id_display,
      amount: amountStr,
      currency: transaction.currency,
      description,
      paymentMethod: transaction.method,
      payerEmail: transaction.payer_email,
      payerPhone: transaction.payer_phone,
      settledAt: transaction.updated_at,
      // The transactions list, not a per-transaction page — there is no
      // /merchant/transactions/[id] route, so a deep link would 404.
      dashboardUrl: `${DASHBOARD_BASE_URL}/merchant/transactions`
    });
    
    await sendEmail({
      to: emailTo,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  } catch (error) {
    console.error("Failed to notify merchant of settled transaction:", error);
  }
}

export async function notifyPayerTransactionSettled(
  transaction: Transaction,
  merchantName: string,
  description: string | null
) {
  const amountStr = fromMinorUnits(transaction.amount).toFixed(2);
  const tasks: Promise<void>[] = [];
  
  if (transaction.payer_email) {
    const template = payerConfirmationEmail({
      merchantName,
      amount: amountStr,
      currency: transaction.currency,
      description,
      txIdDisplay: transaction.tx_id_display
    });
    
    tasks.push(
      sendEmail({
        to: transaction.payer_email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    );
  }
  
  if (transaction.payer_phone) {
    const desc = description ? ` for "${description}"` : "";
    const message = `Your ${transaction.currency} ${amountStr} payment to ${merchantName}${desc} was successful. Ref: ${transaction.tx_id_display} — TRITE`;
    tasks.push(sendSms(transaction.payer_phone, message));
  }
  
  try {
    await Promise.allSettled(tasks);
  } catch (error) {
    console.error("Failed to notify payer of settled transaction:", error);
  }
}
