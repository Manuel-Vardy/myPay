import "server-only";
import { fromMinorUnits } from "@/lib/utils";

/**
 * Base fields for payment.* merchant webhook payloads.
 *
 * `amount` is the merchant's order amount (fee_basis_amount): when the
 * merchant passes the processing fee to the customer, transactions.amount
 * is inflated by the fee, and reporting it as the order amount breaks
 * merchant-side reconciliation. `charged_amount` is what the payer actually
 * paid. For merchant-borne fees (and pre-fee-bearer rows, where
 * fee_basis_amount is null) the two are equal.
 */
export function buildPaymentWebhookData(tx: {
  tx_id_display: string;
  payment_session_id: string | null;
  amount: number | string;
  fee_basis_amount?: number | string | null;
  currency: string;
  method: string;
}): Record<string, unknown> {
  return {
    tx_id_display: tx.tx_id_display,
    session_id: tx.payment_session_id,
    amount: fromMinorUnits(tx.fee_basis_amount ?? tx.amount),
    charged_amount: fromMinorUnits(tx.amount),
    currency: tx.currency,
    method: tx.method,
  };
}
