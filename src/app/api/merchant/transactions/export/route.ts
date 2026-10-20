// GET /api/merchant/transactions/export — CSV export of successful (SETTLED) merchant transactions
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { buildCsv, csvFilename, csvResponse, money, toBigInt } from "@/lib/csv";

// Only the columns this export selects. Amounts arrive as bigint-as-string.
type TransactionRow = {
  tx_id_display: string;
  description: string | null;
  created_at: Date;
  payer_email: string | null;
  payer_name: string | null;
  payer_phone: string | null;
  method: string;
  status: string;
  currency: string;
  amount: string;
  processing_fee: string;
  fee_basis_amount: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const merchant_id = guard.merchant.id;

    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get("currency");
    const search = searchParams.get("search");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    let query = db("transactions")
      .leftJoin("payment_sessions", "transactions.payment_session_id", "payment_sessions.id")
      .where({ "transactions.merchant_id": merchant_id, "transactions.status": "SETTLED" });

    if (currency) {
      if (currency === "FIAT") {
        query = query.whereIn("transactions.currency", ["GHS", "USD", "EUR", "NGN"]);
      } else if (currency === "STABLECOIN") {
        query = query.whereIn("transactions.currency", ["USDC", "USDT", "DAI", "BUSD"]);
      } else if (currency === "CRYPTO") {
        query = query.whereNotIn("transactions.currency", ["GHS", "USD", "EUR", "NGN", "USDC", "USDT", "DAI", "BUSD"]);
      } else {
        query = query.where("transactions.currency", currency);
      }
    }
    if (date_from) query = query.where("transactions.created_at", ">=", date_from);
    if (date_to) query = query.where("transactions.created_at", "<=", date_to);
    if (search) {
      // Must match the list view's search, or an export of "what I'm looking
      // at" quietly returns a different set of rows.
      query = query.where(function () {
        this.where("transactions.tx_id_display", "ilike", `%${search}%`)
          .orWhere("transactions.payer_email", "ilike", `%${search}%`)
          .orWhere("transactions.payer_name", "ilike", `%${search}%`)
          .orWhere("transactions.payer_phone", "ilike", `%${search}%`)
          .orWhere("payment_sessions.description", "ilike", `%${search}%`);
      });
    }

    const transactions: TransactionRow[] = await query
      .select(
        "transactions.tx_id_display",
        "payment_sessions.description as description",
        "transactions.created_at",
        "transactions.payer_email",
        "transactions.payer_name",
        "transactions.payer_phone",
        "transactions.method",
        "transactions.status",
        "transactions.currency",
        "transactions.amount",
        "transactions.processing_fee",
        "transactions.fee_basis_amount"
      )
      .orderBy("transactions.created_at", "desc");

    const header = [
      "Transaction ID",
      "Description",
      "Date",
      "Customer",
      "Customer Email",
      "Customer Phone",
      "Method",
      "Status",
      "Currency",
      "Amount",
      "Processing Fee",
      "Fee Paid By",
      "Net Earnings",
    ];
    const rows = transactions.map((tx) => {
      const amount = toBigInt(tx.amount);
      const fee = toBigInt(tx.processing_fee);

      // Who bore the fee is decided per transaction, not from the merchant's
      // current `fee_bearer` setting — that can change after the fact. When the
      // payer bears it, checkout inflates the charged amount by the fee (see
      // /api/payments/process) so `amount` sits above the frozen pre-fee
      // `fee_basis_amount`; a merchant-borne fee leaves the two equal.
      const paidByCustomer =
        tx.fee_basis_amount != null && amount > toBigInt(tx.fee_basis_amount);

      // The fee is always debited from merchant float, so this holds either
      // way: a merchant-borne fee eats into the charge, while a customer-borne
      // one is cancelled out by the inflated charge, leaving the order amount.
      const net = amount - fee;

      return [
        tx.tx_id_display,
        tx.description || "",
        new Date(tx.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric",hour: "2-digit", minute: "2-digit" }),
        // Name first, then whichever identifier we hold — a mobile money
        // payer usually has a phone and no email.
        tx.payer_name || tx.payer_email || tx.payer_phone || "Anonymous",
        tx.payer_email || "",
        tx.payer_phone || "",
        tx.method,
        tx.status,
        tx.currency,
        money(amount),
        money(fee),
        paidByCustomer ? "CUSTOMER" : "MERCHANT",
        money(net),
      ];
    });

    return csvResponse(buildCsv(header, rows), csvFilename("transactions"));
  } catch (error) {
    console.error("Merchant transactions export error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
