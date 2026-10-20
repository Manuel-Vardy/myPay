import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { getMerchantFloatBalances } from "@/lib/settlements/balance";
import { SETTLEMENT_SCHEDULE_KEY } from "@/lib/settlements/schedule";
import { closeDatabase, db, resetDatabase } from "../../helpers/db";
import {
  createLedgerAccount,
  createLedgerEntry,
  createMerchant,
  createSettlementAccount,
  createWithdrawalRequest,
} from "../../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

async function setAgeHours(hours: number) {
  await db("platform_settings")
    .insert({
      key: SETTLEMENT_SCHEDULE_KEY,
      value: JSON.stringify({
        payout_time: "18:00",
        payout_threshold_minor: null,
        withdrawal_age_hours: hours,
        auto_settlements_enabled: true,
      }),
    })
    .onConflict("key")
    .merge();
}

/** Merchant with a float account and a credit of `amount` aged `hours` old. */
async function merchantWithFloat(amount: bigint, hours: number) {
  const merchant = await createMerchant();
  const account = await createLedgerAccount(merchant.id, "MERCHANT_FLOAT", "GHS");
  await createLedgerEntry({
    accountId: account.id,
    entryType: "CREDIT",
    amount,
    createdAt: hoursAgo(hours),
  });
  return { merchant, account };
}

describe("getMerchantFloatBalances", () => {
  it("reports zeros for a merchant with no float account", async () => {
    const merchant = await createMerchant();
    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances).toMatchObject({
      total: 0n,
      aged: 0n,
      withdrawalHold: 0n,
      withdrawable: 0n,
    });
  });

  it("uses the default 24h aging window when nothing is configured", async () => {
    const merchant = await createMerchant();
    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.ageHours).toBe(24);
  });

  it("counts a credit older than the window as withdrawable", async () => {
    await setAgeHours(24);
    const { merchant } = await merchantWithFloat(50_000n, 48);

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.total).toBe(50_000n);
    expect(balances.aged).toBe(50_000n);
    expect(balances.withdrawable).toBe(50_000n);
  });

  it("holds back a credit younger than the window", async () => {
    await setAgeHours(24);
    const { merchant } = await merchantWithFloat(50_000n, 1);

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    // The money is in the float but has not aged, so it cannot be swept yet.
    expect(balances.total).toBe(50_000n);
    expect(balances.aged).toBe(0n);
    expect(balances.withdrawable).toBe(0n);
  });

  it("splits a float that holds both aged and fresh credits", async () => {
    await setAgeHours(24);
    const { merchant, account } = await merchantWithFloat(50_000n, 48);
    await createLedgerEntry({
      accountId: account.id,
      entryType: "CREDIT",
      amount: 30_000n,
      createdAt: hoursAgo(1),
    });

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.total).toBe(80_000n);
    expect(balances.aged).toBe(50_000n);
    expect(balances.withdrawable).toBe(50_000n);
  });

  it("treats every credit as withdrawable when aging is disabled", async () => {
    await setAgeHours(0);
    const { merchant } = await merchantWithFloat(50_000n, 0);

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.ageHours).toBe(0);
    expect(balances.withdrawable).toBe(50_000n);
  });

  it("keeps settlement-linked credits withdrawable immediately", async () => {
    await setAgeHours(24);
    const merchant = await createMerchant();
    const account = await createLedgerAccount(merchant.id, "MERCHANT_FLOAT", "GHS");
    const [settlement] = await db("settlements")
      .insert({
        settlement_id_display: "STL-RETURN-1",
        merchant_id: merchant.id,
        gross_amount: "0",
        fees: "0",
        net_amount: "0",
        currency: "GHS",
        status: "COMPLETED",
        date_range_start: hoursAgo(48),
        date_range_end: new Date(),
      })
      .returning("*");

    // A settlement-linked credit is a reserve return or fee reversal — money
    // that already aged once, so it must not be aged again.
    await createLedgerEntry({
      accountId: account.id,
      entryType: "CREDIT",
      amount: 20_000n,
      settlementId: settlement.id,
      createdAt: hoursAgo(1),
    });

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.aged).toBe(20_000n);
    expect(balances.withdrawable).toBe(20_000n);
  });

  it("nets debits out of the total", async () => {
    await setAgeHours(24);
    const { merchant, account } = await merchantWithFloat(50_000n, 48);
    await createLedgerEntry({
      accountId: account.id,
      entryType: "DEBIT",
      amount: 20_000n,
      createdAt: hoursAgo(48),
    });

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.total).toBe(30_000n);
    expect(balances.withdrawable).toBe(30_000n);
  });

  it("holds back amounts reserved by PENDING and PROCESSING withdrawals", async () => {
    await setAgeHours(24);
    const { merchant } = await merchantWithFloat(50_000n, 48);
    const account = await createSettlementAccount(merchant.id);
    await createWithdrawalRequest(merchant.id, account.id, {
      amount: "10000",
      status: "PENDING",
    });
    await createWithdrawalRequest(merchant.id, account.id, {
      amount: "5000",
      status: "PROCESSING",
    });

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    // The cron must not sweep funds an in-flight withdrawal already claimed.
    expect(balances.withdrawalHold).toBe(15_000n);
    expect(balances.withdrawable).toBe(35_000n);
  });

  it("does not hold back settled or rejected withdrawals", async () => {
    await setAgeHours(24);
    const { merchant } = await merchantWithFloat(50_000n, 48);
    const account = await createSettlementAccount(merchant.id);
    for (const status of ["APPROVED", "REJECTED", "FAILED"]) {
      await createWithdrawalRequest(merchant.id, account.id, {
        amount: "10000",
        status,
      });
    }

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.withdrawalHold).toBe(0n);
    expect(balances.withdrawable).toBe(50_000n);
  });

  it("never reports a negative withdrawable amount", async () => {
    await setAgeHours(24);
    const { merchant } = await merchantWithFloat(10_000n, 48);
    const account = await createSettlementAccount(merchant.id);
    await createWithdrawalRequest(merchant.id, account.id, {
      amount: "50000",
      status: "PENDING",
    });

    const balances = await getMerchantFloatBalances(merchant.id, "GHS");
    expect(balances.withdrawalHold).toBe(50_000n);
    expect(balances.withdrawable).toBe(0n);
  });

  it("keeps currencies separate", async () => {
    await setAgeHours(0);
    const merchant = await createMerchant();
    const ghs = await createLedgerAccount(merchant.id, "MERCHANT_FLOAT", "GHS");
    const usd = await createLedgerAccount(merchant.id, "MERCHANT_FLOAT", "USD");
    await createLedgerEntry({ accountId: ghs.id, entryType: "CREDIT", amount: 50_000n });
    await createLedgerEntry({
      accountId: usd.id,
      entryType: "CREDIT",
      amount: 700n,
      currency: "USD",
    });

    expect((await getMerchantFloatBalances(merchant.id, "GHS")).total).toBe(50_000n);
    expect((await getMerchantFloatBalances(merchant.id, "USD")).total).toBe(700n);
  });

  it("does not leak another merchant's float", async () => {
    await setAgeHours(0);
    const { merchant } = await merchantWithFloat(50_000n, 48);
    const other = await createMerchant();
    const otherAccount = await createLedgerAccount(other.id, "MERCHANT_FLOAT", "GHS");
    await createLedgerEntry({
      accountId: otherAccount.id,
      entryType: "CREDIT",
      amount: 999_999n,
    });

    expect((await getMerchantFloatBalances(merchant.id, "GHS")).total).toBe(50_000n);
  });
});
