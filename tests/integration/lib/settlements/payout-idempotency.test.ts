// Payout idempotency (risk R-20).
//
// The failure this file exists to catch is paying a merchant twice. Every
// assertion here is ultimately about one question: after a retry, a race, or a
// provider whose answer we never got, how much money left the float?
//
// These are integration tests against a real database on purpose. The controls
// under test are `SELECT ... FOR UPDATE` row locks, a uniqueness guard on
// in-flight settlements, and status transitions read inside a transaction.
// None of that survives being mocked — a unit test with a fake `db` would
// assert that the code calls the functions it calls, which is exactly the test
// that passes while production double-pays.

import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { processSettlement } from "@/lib/settlements/process";
import { completeSettlement, failSettlement } from "@/lib/settlements/finalize";
import type { PayoutProvider, TransferResult } from "@/lib/payments";
import { closeDatabase, db, resetDatabase } from "../../helpers/db";
import {
  createLedgerAccount,
  createLedgerEntry,
  createMerchant,
  createSettlementAccount,
  createWebhookEndpoint,
} from "../../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

/**
 * A payout adapter that never touches a network and records how many times it
 * was asked to move money. The call count is the real assertion in most of
 * these tests: "the provider was invoked once" is the operational meaning of
 * "the merchant was paid once".
 */
function fakeProvider(result: Partial<TransferResult> & { status: TransferResult["status"] }) {
  const calls: unknown[] = [];
  const provider = {
    name: "TestProvider",
    initiatePayment: async () => {
      throw new Error("collection not used in these tests");
    },
    checkStatus: async () => {
      throw new Error("collection not used in these tests");
    },
    initiateTransfer: async (params: unknown) => {
      calls.push(params);
      return { message: "test", ...result } as TransferResult;
    },
    checkTransferStatus: async () => ({ message: "test", ...result }) as TransferResult,
  } as unknown as PayoutProvider;

  return { provider, calls };
}

/** A provider whose adapter throws — the "we have no idea what happened" case. */
function throwingProvider() {
  const calls: unknown[] = [];
  const provider = {
    name: "TestProvider",
    initiatePayment: async () => {
      throw new Error("unused");
    },
    checkStatus: async () => {
      throw new Error("unused");
    },
    initiateTransfer: async (params: unknown) => {
      calls.push(params);
      throw new Error("connection reset");
    },
    checkTransferStatus: async () => {
      throw new Error("unused");
    },
  } as unknown as PayoutProvider;

  return { provider, calls };
}

/**
 * A merchant holding `amount` in aged, withdrawable float, with a verified MTN
 * settlement account. Credits are aged 48h so the withdrawal aging window
 * never gates these tests — aging is covered by balance.test.ts.
 */
async function payableMerchant(amount: bigint) {
  const merchant = await createMerchant();
  const floatAccount = await createLedgerAccount(merchant.id, "MERCHANT_FLOAT", "GHS");
  await createLedgerEntry({
    accountId: floatAccount.id,
    entryType: "CREDIT",
    amount,
    createdAt: hoursAgo(48),
  });
  const account = await createSettlementAccount(merchant.id);
  return { merchant, floatAccount, account };
}

/** Net movement on a ledger account, credits positive. */
async function balanceOf(accountId: string): Promise<bigint> {
  const row = await db("ledger_entries")
    .where({ account_id: accountId })
    .select(
      db.raw(
        `COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END), 0) as sum`
      )
    )
    .first();
  return BigInt((row as { sum: string })?.sum ?? 0);
}

async function settlementsFor(merchantId: string) {
  return db("settlements").where({ merchant_id: merchantId }).orderBy("created_at");
}

describe("processSettlement — reservation guard", () => {
  it("pays once when the same settlement run is retried", async () => {
    const { merchant, floatAccount, account } = await payableMerchant(100_000n);
    const { provider, calls } = fakeProvider({ status: "SUCCESS", providerRef: "ref-1" });

    const first = await processSettlement(merchant.id, account, 100_000n, "GHS", provider);
    expect(first.status).toBe("COMPLETED");

    // The retry: same inputs, as a re-run of the cron would issue.
    const second = await processSettlement(merchant.id, account, 100_000n, "GHS", provider);

    // The float is empty after the first payout, so the retry has nothing to
    // send. What matters is that it did not reach the provider.
    expect(second.status).toBe("SKIPPED");
    expect(calls).toHaveLength(1);
    expect(await settlementsFor(merchant.id)).toHaveLength(1);
    expect(await balanceOf(floatAccount.id)).toBe(0n);
  });

  it("refuses a second settlement while one is still in flight", async () => {
    const { merchant, floatAccount, account } = await payableMerchant(100_000n);

    // PENDING at the provider: accepted, outcome not yet known. The reserve
    // stays out of the float.
    const pending = fakeProvider({ status: "PENDING", providerRef: "ref-pending" });
    const first = await processSettlement(merchant.id, account, 100_000n, "GHS", pending.provider);
    expect(first.status).toBe("PENDING");

    const floatAfterReserve = await balanceOf(floatAccount.id);

    // Top the float back up — a fresh payment arriving mid-flight must not be
    // what lets a second transfer through.
    await createLedgerEntry({
      accountId: floatAccount.id,
      entryType: "CREDIT",
      amount: 100_000n,
      createdAt: hoursAgo(48),
    });

    const second = fakeProvider({ status: "SUCCESS" });
    const result = await processSettlement(
      merchant.id,
      account,
      100_000n,
      "GHS",
      second.provider
    );

    expect(result.status).toBe("SKIPPED");
    expect(result.reason).toMatch(/in-flight/i);
    expect(second.calls).toHaveLength(0);
    // Only the new credit moved the balance; nothing further was reserved.
    expect(await balanceOf(floatAccount.id)).toBe(floatAfterReserve + 100_000n);
  });

  it("reserves once when two runs race for the same float", async () => {
    const { merchant, floatAccount, account } = await payableMerchant(100_000n);
    const a = fakeProvider({ status: "SUCCESS", providerRef: "ref-a" });
    const b = fakeProvider({ status: "SUCCESS", providerRef: "ref-b" });

    // Two overlapping cron ticks. The row lock in phase 1 has to serialise
    // these; if it does not, both reserve and the merchant is paid twice.
    const [first, second] = await Promise.all([
      processSettlement(merchant.id, account, 100_000n, "GHS", a.provider),
      processSettlement(merchant.id, account, 100_000n, "GHS", b.provider),
    ]);

    const outcomes = [first.status, second.status].sort();
    expect(outcomes).toEqual(["COMPLETED", "SKIPPED"]);
    expect(a.calls.length + b.calls.length).toBe(1);
    expect(await settlementsFor(merchant.id)).toHaveLength(1);
    expect(await balanceOf(floatAccount.id)).toBe(0n);
  });
});

describe("completeSettlement — finalisation is single-shot", () => {
  it("ignores a repeat completion from a racing webhook or cron", async () => {
    const { merchant, account } = await payableMerchant(100_000n);
    // Without a subscribed endpoint nothing is enqueued at all, and the
    // duplicate-notification assertion below would pass vacuously.
    await createWebhookEndpoint(merchant.id, {
      events: ["payout.success", "payout.failed"],
    });

    const { provider } = fakeProvider({ status: "PENDING", providerRef: "ref-pending" });
    const run = await processSettlement(merchant.id, account, 100_000n, "GHS", provider);
    const settlementId = run.settlementId!;

    // The transfer response, the provider webhook and the reconciliation cron
    // all race to finalise the same row.
    const firstFinalise = await completeSettlement({
      settlementId,
      providerRef: "ref-pending",
      source: "TEST",
    });
    const secondFinalise = await completeSettlement({
      settlementId,
      providerRef: "ref-pending",
      source: "TEST",
    });

    expect(firstFinalise).toBe(true);
    expect(secondFinalise).toBe(false);

    const row = await db("settlements").where({ id: settlementId }).first();
    expect(row.status).toBe("COMPLETED");

    // One payout, one notification. A duplicate here tells the merchant they
    // were paid twice even when they were not.
    const events = await db("webhook_events").where({ merchant_id: merchant.id });
    expect(events.filter((e) => e.event_type === "payout.success")).toHaveLength(1);
  });

  it("cannot complete a settlement that already failed", async () => {
    const { merchant, account } = await payableMerchant(100_000n);
    const { provider } = fakeProvider({ status: "PENDING" });
    const run = await processSettlement(merchant.id, account, 100_000n, "GHS", provider);
    const settlementId = run.settlementId!;

    expect(await failSettlement({ settlementId, reason: "declined", source: "TEST" })).toBe(true);

    // A late success callback arriving after the decline must not resurrect it.
    expect(await completeSettlement({ settlementId, providerRef: null, source: "TEST" })).toBe(
      false
    );

    const row = await db("settlements").where({ id: settlementId }).first();
    expect(row.status).toBe("FAILED");
  });
});

describe("failSettlement — the reserve returns exactly once", () => {
  it("does not credit the float twice when the decline is delivered twice", async () => {
    const { merchant, floatAccount, account } = await payableMerchant(100_000n);
    const { provider } = fakeProvider({ status: "PENDING" });

    const before = await balanceOf(floatAccount.id);
    const run = await processSettlement(merchant.id, account, 100_000n, "GHS", provider);
    const settlementId = run.settlementId!;
    const reserved = await balanceOf(floatAccount.id);
    expect(reserved).toBeLessThan(before);

    const firstFail = await failSettlement({ settlementId, reason: "declined", source: "TEST" });
    const afterOneReturn = await balanceOf(floatAccount.id);

    const secondFail = await failSettlement({ settlementId, reason: "declined", source: "TEST" });
    const afterTwoReturns = await balanceOf(floatAccount.id);

    expect(firstFail).toBe(true);
    expect(secondFail).toBe(false);
    // The decisive assertion: the second delivery moved no money.
    expect(afterTwoReturns).toBe(afterOneReturn);
    expect(afterOneReturn).toBe(before);
  });
});

describe("unknown transfer outcome", () => {
  it("keeps the reserve out of the float when the provider never answered", async () => {
    const { merchant, floatAccount, account } = await payableMerchant(100_000n);
    const { provider, calls } = throwingProvider();

    const before = await balanceOf(floatAccount.id);
    const result = await processSettlement(merchant.id, account, 100_000n, "GHS", provider);

    expect(result.status).toBe("UNKNOWN");
    expect(calls).toHaveLength(1);

    // The money may already be with the payee. Returning it to the float here
    // is the double-payment bug in its purest form: the next run would see a
    // full balance and send it again.
    const after = await balanceOf(floatAccount.id);
    expect(after).toBeLessThan(before);

    const row = await db("settlements").where({ id: result.settlementId! }).first();
    expect(row.status).toBe("PROCESSING");
  });

  it("blocks the next run until the unknown transfer is reconciled", async () => {
    const { merchant, account } = await payableMerchant(100_000n);
    const stuck = throwingProvider();
    await processSettlement(merchant.id, account, 100_000n, "GHS", stuck.provider);

    const next = fakeProvider({ status: "SUCCESS" });
    const second = await processSettlement(merchant.id, account, 100_000n, "GHS", next.provider);

    expect(second.status).toBe("SKIPPED");
    expect(second.reason).toMatch(/in-flight/i);
    expect(next.calls).toHaveLength(0);
  });
});
