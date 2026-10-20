// GET /api/admin/reconciliation?merchant_id=<uuid>[&currency=GHS]
//
// Answers one question an operator has to be able to answer before paying a
// merchant: does the money we say they have actually match what they earned
// minus what we already paid them?
//
// The ledger is the balance of record, but on its own it can only confirm it
// agrees with itself. So this rebuilds the expected balance from the SOURCE
// tables — settled transactions, charged fees, completed settlements — and
// compares that with the ledger. It then checks each component separately,
// so a mismatch points at which side drifted instead of just saying "off by
// N": payment credits vs settled transactions, fee debits vs the fee ledger,
// payout debits vs settlements.
//
// Read-only. Nothing here writes.
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";
import { getMerchantFloatBalances } from "@/lib/settlements/balance";

/** Postgres returns bigint aggregates as strings; normalise to BigInt. */
const big = (v: unknown): bigint => BigInt(String(v ?? 0));

export async function GET(request: NextRequest) {
  const guard = await requirePermission("settlement-monitoring");
  if (guard.error) return guard.error;

  try {
    const { searchParams } = request.nextUrl;
    const idParam = searchParams.get("merchant_id");
    const currency = (searchParams.get("currency") || "GHS").toUpperCase();

    if (!idParam) {
      return Response.json({ error: "merchant_id is required" }, { status: 400 });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idParam)) {
      return Response.json({ error: "merchant_id must be a UUID" }, { status: 400 });
    }

    // Callers hold either identifier depending on where they came from: the
    // withdrawals table carries merchants.id, the merchant profile page
    // carries users.id.
    const merchant =
      (await db("merchants").where({ id: idParam }).first()) ??
      (await db("merchants").where({ user_id: idParam }).first());
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    const account = await db("ledger_accounts")
      .where({ owner_id: merchant.id, account_type: "MERCHANT_FLOAT", currency })
      .first();

    // ---- Source-of-truth tables -------------------------------------------
    const txRow = (
      await db.raw(
        `SELECT COUNT(*)::int AS n, COALESCE(SUM(amount), 0)::text AS gross
         FROM transactions
         WHERE merchant_id = ? AND status = 'SETTLED' AND currency = ?`,
        [merchant.id, currency]
      )
    ).rows[0];

    const feeRow = (
      await db.raw(
        `SELECT
           COALESCE(SUM(amount) FILTER (WHERE fee_type = 'PAYMENT_PROCESSING' AND NOT is_waived), 0)::text  AS processing,
           COALESCE(SUM(amount) FILTER (WHERE fee_type <> 'PAYMENT_PROCESSING' AND NOT is_waived), 0)::text AS other,
           COALESCE(SUM(amount) FILTER (WHERE is_waived), 0)::text                                          AS waived
         FROM fee_ledger
         WHERE merchant_id = ? AND currency = ?`,
        [merchant.id, currency]
      )
    ).rows[0];

    const settlementRows = (
      await db.raw(
        `SELECT status::text AS status, COUNT(*)::int AS count,
                COALESCE(SUM(net_amount), 0)::text AS net
         FROM settlements
         WHERE merchant_id = ? AND currency = ?
         GROUP BY status
         ORDER BY status`,
        [merchant.id, currency]
      )
    ).rows;

    const withdrawalRows = (
      await db.raw(
        `SELECT status::text AS status, COUNT(*)::int AS count,
                COALESCE(SUM(amount), 0)::text AS amount
         FROM withdrawal_requests
         WHERE merchant_id = ? AND currency = ?
         GROUP BY status
         ORDER BY status`,
        [merchant.id, currency]
      )
    ).rows;

    // ---- Ledger side -------------------------------------------------------
    // Settlement-linked entries are payouts and their reversals; unlinked
    // credits are payments in, unlinked debits are fees.
    const ledgerRow = account
      ? (
          await db.raw(
            `SELECT
               COALESCE(SUM(amount) FILTER (WHERE entry_type = 'CREDIT' AND settlement_id IS NULL), 0)::text     AS payment_credits,
               COALESCE(SUM(amount) FILTER (WHERE entry_type = 'DEBIT'  AND settlement_id IS NULL), 0)::text     AS fee_debits,
               COALESCE(SUM(amount) FILTER (WHERE entry_type = 'DEBIT'  AND settlement_id IS NOT NULL), 0)::text AS payout_debits,
               COALESCE(SUM(amount) FILTER (WHERE entry_type = 'CREDIT' AND settlement_id IS NOT NULL), 0)::text AS payout_credits,
               COUNT(*)::int AS entry_count
             FROM ledger_entries WHERE account_id = ?`,
            [account.id]
          )
        ).rows[0]
      : { payment_credits: "0", fee_debits: "0", payout_debits: "0", payout_credits: "0", entry_count: 0 };

    const balanceRow = account
      ? await db("ledger_account_balances").where({ account_id: account.id }).first()
      : null;

    const availability = await getMerchantFloatBalances(merchant.id, currency);

    // ---- The arithmetic ----------------------------------------------------
    const gross = big(txRow.gross);
    const processingFees = big(feeRow.processing);
    const otherFees = big(feeRow.other);
    const settledOut = settlementRows
      .filter((r: { status: string }) => r.status === "COMPLETED")
      .reduce((a: bigint, r: { net: string }) => a + big(r.net), 0n);

    const expected = gross - processingFees - otherFees - settledOut;
    const actual = big(balanceRow?.balance);
    const difference = actual - expected;

    // Component agreement — localises a mismatch instead of just flagging one.
    const paymentCredits = big(ledgerRow.payment_credits);
    const feeDebits = big(ledgerRow.fee_debits);
    const netPayoutDebits = big(ledgerRow.payout_debits) - big(ledgerRow.payout_credits);

    const checks = [
      {
        name: "Payment credits match settled transactions",
        ledger: paymentCredits.toString(),
        source: gross.toString(),
        delta: (paymentCredits - gross).toString(),
        ok: paymentCredits === gross,
      },
      {
        name: "Fee debits match the fee ledger",
        ledger: feeDebits.toString(),
        source: (processingFees + otherFees).toString(),
        delta: (feeDebits - (processingFees + otherFees)).toString(),
        // Waived fees are credited back as settlement-linked entries, so the
        // debit side can legitimately exceed the not-waived fee total.
        ok: feeDebits - (processingFees + otherFees) === big(feeRow.waived),
      },
      {
        name: "Net payouts match completed settlements",
        ledger: netPayoutDebits.toString(),
        source: settledOut.toString(),
        delta: (netPayoutDebits - settledOut).toString(),
        ok: netPayoutDebits === settledOut,
      },
    ];

    return Response.json({
      merchant: {
        id: merchant.id,
        user_id: merchant.user_id,
        business_name: merchant.business_name,
        merchant_display_id: merchant.merchant_display_id,
        currency,
        payments_paused: Boolean(merchant.payments_paused_at),
      },
      // Every amount below is in MINOR units (pesewas), as strings so large
      // bigints survive JSON intact.
      summary: {
        settled_count: txRow.n,
        gross: gross.toString(),
        processing_fees: processingFees.toString(),
        other_fees: otherFees.toString(),
        waived_fees: feeRow.waived,
        net_payable: (gross - processingFees - otherFees).toString(),
        paid_out: settledOut.toString(),
        expected_float: expected.toString(),
        actual_float: actual.toString(),
        difference: difference.toString(),
        balanced: difference === 0n,
      },
      ledger: {
        account_id: account?.id ?? null,
        entry_count: ledgerRow.entry_count,
        payment_credits: paymentCredits.toString(),
        fee_debits: feeDebits.toString(),
        payout_debits: big(ledgerRow.payout_debits).toString(),
        payout_credits: big(ledgerRow.payout_credits).toString(),
      },
      checks,
      availability: {
        total: availability.total.toString(),
        aged: availability.aged.toString(),
        withdrawal_hold: availability.withdrawalHold.toString(),
        withdrawable: availability.withdrawable.toString(),
        age_hours: availability.ageHours,
      },
      settlements: settlementRows,
      withdrawal_requests: withdrawalRows,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reconciliation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
