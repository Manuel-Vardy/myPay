import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { chargeSettlementFee, chargeTransactionFee, ensureLedgerAccount } from "@/lib/fees";
import { closeDatabase, db, resetDatabase } from "../helpers/db";
import {
  createFeeSchedule,
  createMerchant,
  createSettlement,
  createTransaction,
} from "../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

async function balanceOf(accountType: string, ownerId: string | null) {
  const row = await db("ledger_account_balances")
    .where({ account_type: accountType, owner_id: ownerId })
    .first();
  return row ? BigInt(row.balance) : null;
}

describe("chargeTransactionFee", () => {
  it("records a fee_ledger row with the rate snapshot", async () => {
    const merchant = await createMerchant();
    const schedule = await createFeeSchedule({
      calculation_method: "FLAT_PLUS_PERCENTAGE",
      flat_amount: 30,
      percentage_rate: 2.9,
    });
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    const fee = await db.transaction((trx) => chargeTransactionFee(trx, tx));
    expect(fee).toBe(320n); // 30 flat + 2.9% of 10000

    const ledger = await db("fee_ledger").where({ transaction_id: tx.id }).first();
    // The snapshot is what makes a historical charge auditable after the
    // schedule is edited.
    expect(ledger).toMatchObject({
      fee_type: "PAYMENT_PROCESSING",
      merchant_id: merchant.id,
      fee_schedule_id: schedule.id,
    });
    expect(String(ledger.amount)).toBe("320");
    expect(String(ledger.basis_amount)).toBe("10000");
    expect(String(ledger.flat_amount_applied)).toBe("30");
    expect(Number(ledger.percentage_rate_applied)).toBe(2.9);
  });

  it("posts a balanced DEBIT merchant float / CREDIT PSP_FEE pair", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ calculation_method: "PERCENTAGE", percentage_rate: 1.5 });
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    await db.transaction((trx) => chargeTransactionFee(trx, tx));

    const entries = await db("ledger_entries").where({ transaction_id: tx.id });
    expect(entries).toHaveLength(2);

    // Selected by type rather than row order: entry_type is an enum, so ORDER BY
    // follows the enum's declaration order (DEBIT, CREDIT), not the alphabet.
    const credit = entries.find((e) => e.entry_type === "CREDIT");
    const debit = entries.find((e) => e.entry_type === "DEBIT");
    expect(String(credit.amount)).toBe("150");
    expect(String(debit.amount)).toBe("150");

    // Double entry: the pair must net to zero across the two accounts.
    expect(await balanceOf("MERCHANT_FLOAT", merchant.id)).toBe(-150n);
    expect(await balanceOf("PSP_FEE", null)).toBe(150n);
  });

  it("increments transactions.processing_fee by the fee charged", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ calculation_method: "PERCENTAGE", percentage_rate: 1.5 });
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    await db.transaction((trx) => chargeTransactionFee(trx, tx));

    const after = await db("transactions").where({ id: tx.id }).first();
    expect(String(after.processing_fee)).toBe("150");
  });

  it("charges on fee_basis_amount when the customer bears the fee", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ calculation_method: "PERCENTAGE", percentage_rate: 10 });
    // amount is inflated to include the fee; the fee is owed on the order value.
    const tx = await createTransaction(merchant.id, {
      amount: "11000",
      fee_basis_amount: "10000",
    });

    const fee = await db.transaction((trx) => chargeTransactionFee(trx, tx));
    expect(fee).toBe(1000n); // 10% of 10000, not of 11000
  });

  it("charges nothing and writes nothing when no schedule applies", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    const fee = await db.transaction((trx) => chargeTransactionFee(trx, tx));

    expect(fee).toBe(0n);
    expect(await db("fee_ledger").count("* as n").first()).toMatchObject({ n: "0" });
    expect(await db("ledger_entries").count("* as n").first()).toMatchObject({ n: "0" });
    const after = await db("transactions").where({ id: tx.id }).first();
    expect(String(after.processing_fee)).toBe("0");
  });

  it("records a zero fee in fee_ledger but posts no ledger entries", async () => {
    const merchant = await createMerchant();
    // ledger_entries.amount must be > 0, so a zero fee cannot be posted.
    await createFeeSchedule({ calculation_method: "FLAT", flat_amount: 0 });
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    const fee = await db.transaction((trx) => chargeTransactionFee(trx, tx));

    expect(fee).toBe(0n);
    expect(await db("fee_ledger").count("* as n").first()).toMatchObject({ n: "1" });
    expect(await db("ledger_entries").count("* as n").first()).toMatchObject({ n: "0" });
  });

  it("charges nothing for a merchant that does not exist", async () => {
    await createFeeSchedule({});
    const ghost = await createMerchant();
    const tx = await createTransaction(ghost.id, { amount: "10000" });
    await db("transactions").where({ id: tx.id }).del();
    await db("merchants").where({ id: ghost.id }).del();

    const fee = await db.transaction((trx) =>
      chargeTransactionFee(trx, { ...tx, merchant_id: ghost.id })
    );
    expect(fee).toBe(0n);
  });

  it("applies the merchant's tier schedule over the platform default", async () => {
    const merchant = await createMerchant({ tier: "ENTERPRISE" });
    await createFeeSchedule({ applicability: "ALL_MERCHANTS", percentage_rate: 3 });
    await createFeeSchedule({
      applicability: "MERCHANT_TIER",
      merchant_tier: "ENTERPRISE",
      percentage_rate: 1,
    });
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    // The tier is read from the merchant row, not passed in by the caller.
    const fee = await db.transaction((trx) => chargeTransactionFee(trx, tx));
    expect(fee).toBe(100n);
  });

  it("accumulates when two different fee types are charged on one transaction", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({
      fee_type: "PAYMENT_PROCESSING",
      calculation_method: "PERCENTAGE",
      percentage_rate: 1.5,
    });
    await createFeeSchedule({
      fee_type: "PAYMENT_GATEWAY",
      calculation_method: "FLAT",
      flat_amount: 50,
    });
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    await db.transaction(async (trx) => {
      await chargeTransactionFee(trx, tx, "PAYMENT_PROCESSING");
      await chargeTransactionFee(trx, tx, "PAYMENT_GATEWAY");
    });

    const after = await db("transactions").where({ id: tx.id }).first();
    expect(String(after.processing_fee)).toBe("200");
    expect(await balanceOf("MERCHANT_FLOAT", merchant.id)).toBe(-200n);
  });

  it("rolls the fee back with the caller's transaction", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ calculation_method: "PERCENTAGE", percentage_rate: 1.5 });
    const tx = await createTransaction(merchant.id, { amount: "10000" });

    await expect(
      db.transaction(async (trx) => {
        await chargeTransactionFee(trx, tx);
        throw new Error("caller failed after charging");
      })
    ).rejects.toThrow("caller failed after charging");

    // A fee must never survive a settlement that did not commit.
    expect(await db("fee_ledger").count("* as n").first()).toMatchObject({ n: "0" });
    expect(await db("ledger_entries").count("* as n").first()).toMatchObject({ n: "0" });
    const after = await db("transactions").where({ id: tx.id }).first();
    expect(String(after.processing_fee)).toBe("0");
  });
});

describe("chargeSettlementFee", () => {
  it("charges against the settlement's gross amount and links the settlement", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({
      fee_type: "SETTLEMENT_TRANSFER",
      calculation_method: "FLAT",
      flat_amount: 200,
    });

    const settlement = await createSettlement(merchant.id, { gross_amount: "50000" });

    const fee = await db.transaction((trx) => chargeSettlementFee(trx, settlement));

    expect(fee).toBe(200n);
    const ledger = await db("fee_ledger").where({ settlement_id: settlement.id }).first();
    expect(ledger.fee_type).toBe("SETTLEMENT_TRANSFER");
    expect(ledger.transaction_id).toBeNull();
    expect(String(ledger.basis_amount)).toBe("50000");
  });
});

describe("ensureLedgerAccount", () => {
  it("creates an account once and returns the same row afterwards", async () => {
    const merchant = await createMerchant();

    const first = await db.transaction((trx) =>
      ensureLedgerAccount(trx, merchant.id, "MERCHANT_FLOAT", "GHS", "Merchant float (GHS)")
    );
    const second = await db.transaction((trx) =>
      ensureLedgerAccount(trx, merchant.id, "MERCHANT_FLOAT", "GHS", "Merchant float (GHS)")
    );

    expect(second.id).toBe(first.id);
    expect(await db("ledger_accounts").count("* as n").first()).toMatchObject({ n: "1" });
  });

  it("keeps separate accounts per currency", async () => {
    const merchant = await createMerchant();
    const ghs = await db.transaction((trx) =>
      ensureLedgerAccount(trx, merchant.id, "MERCHANT_FLOAT", "GHS", "GHS")
    );
    const usd = await db.transaction((trx) =>
      ensureLedgerAccount(trx, merchant.id, "MERCHANT_FLOAT", "USD", "USD")
    );
    expect(usd.id).not.toBe(ghs.id);
  });

  it("does not deadlock or duplicate when two callers race", async () => {
    const merchant = await createMerchant();
    // Concurrent settlements both miss the SELECT; ON CONFLICT DO NOTHING makes
    // the loser a no-op rather than aborting its whole transaction.
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        db.transaction((trx) =>
          ensureLedgerAccount(trx, merchant.id, "PSP_FEE", "GHS", "PSP fees (GHS)")
        )
      )
    );

    const ids = new Set(results.map((r) => r.id));
    expect(ids.size).toBe(1);
    expect(await db("ledger_accounts").count("* as n").first()).toMatchObject({ n: "1" });
  });
});
