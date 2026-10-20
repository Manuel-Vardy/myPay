import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Post-commit side effects reach the network. The state machine under test is
// everything that happens *inside* the transaction, so the outbound calls are
// stubbed and asserted on instead.
vi.mock("@/lib/notifications", () => ({
  notifyTransactionSettled: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/webhooks/deliver", () => ({
  attemptDelivery: vi.fn().mockResolvedValue(true),
  signWebhookPayload: vi.fn(() => "stub"),
}));

import { expireCryptoPayment, finaliseCryptoPayment } from "@/lib/payments/crypto-helpers";
import { attemptDelivery } from "@/lib/webhooks/deliver";
import { notifyTransactionSettled } from "@/lib/notifications";
import { closeDatabase, db, resetDatabase } from "../../helpers/db";
import {
  createFeeSchedule,
  createMerchant,
  createPaymentSession,
  createTransaction,
  createWebhookEndpoint,
} from "../../helpers/factories";

beforeEach(resetDatabase);
afterEach(() => vi.clearAllMocks());
afterAll(closeDatabase);

async function balanceOf(accountType: string, ownerId: string | null) {
  const row = await db("ledger_account_balances")
    .where({ account_type: accountType, owner_id: ownerId })
    .first();
  return row ? BigInt(row.balance) : null;
}

describe("finaliseCryptoPayment — the happy path", () => {
  it("moves an AUTHORIZED transaction to SETTLED and records the hash", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    const settled = await finaliseCryptoPayment({
      transactionId: tx.id,
      networkHash: "0xabc",
      triggeredBy: "webhook:triton",
    });

    expect(settled).toBe(true);
    const after = await db("transactions").where({ id: tx.id }).first();
    expect(after.status).toBe("SETTLED");
    expect(after.crypto_network_hash).toBe("0xabc");
  });

  it("keeps the existing hash when the caller supplies none", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      crypto_network_hash: "0xoriginal",
    });

    await finaliseCryptoPayment({
      transactionId: tx.id,
      networkHash: null,
      triggeredBy: "status_poll",
    });

    const after = await db("transactions").where({ id: tx.id }).first();
    expect(after.crypto_network_hash).toBe("0xoriginal");
  });

  it("records the status transition in the immutable event trail", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    await finaliseCryptoPayment({
      transactionId: tx.id,
      networkHash: "0xabc",
      triggeredBy: "webhook:triton",
    });

    const event = await db("transaction_events").where({ transaction_id: tx.id }).first();
    expect(event).toMatchObject({
      from_status: "AUTHORIZED",
      to_status: "SETTLED",
      triggered_by: "webhook:triton",
    });
  });

  it("completes the linked payment session", async () => {
    const merchant = await createMerchant();
    const session = await createPaymentSession(merchant.id);
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      payment_session_id: session.id,
    });

    await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" });

    expect((await db("payment_sessions").where({ id: session.id }).first()).status).toBe(
      "COMPLETED"
    );
  });

  it("posts a balanced CREDIT merchant float / DEBIT escrow pair", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      amount: "25000",
    });

    await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" });

    expect(await balanceOf("MERCHANT_FLOAT", merchant.id)).toBe(25_000n);
    expect(await balanceOf("ESCROW", null)).toBe(-25_000n);
  });

  it("charges the processing fee on top of the settlement entries", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ calculation_method: "PERCENTAGE", percentage_rate: 2 });
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      amount: "25000",
    });

    await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" });

    const after = await db("transactions").where({ id: tx.id }).first();
    expect(String(after.processing_fee)).toBe("500");
    // Credited 25000, then debited the 500 fee.
    expect(await balanceOf("MERCHANT_FLOAT", merchant.id)).toBe(24_500n);
    expect(await balanceOf("PSP_FEE", null)).toBe(500n);
  });

  it("writes an INFO system log naming the transaction and trigger", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    await finaliseCryptoPayment({
      transactionId: tx.id,
      networkHash: "0xabc",
      triggeredBy: "webhook:triton",
    });

    const log = await db("system_logs").where({ source: "CRYPTO_SETTLEMENT" }).first();
    expect(log.level).toBe("INFO");
    expect(log.event_description).toContain(tx.tx_id_display);
    expect(log.event_description).toContain("triggered_by=webhook:triton");
  });

  it("notifies the payer and merchant after commit", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" });

    expect(notifyTransactionSettled).toHaveBeenCalledWith(tx.id);
  });
});

describe("finaliseCryptoPayment — merchant webhook", () => {
  it("enqueues payment.success and delivers it after commit", async () => {
    const merchant = await createMerchant();
    await createWebhookEndpoint(merchant.id);
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      amount: "25000",
    });

    await finaliseCryptoPayment({
      transactionId: tx.id,
      networkHash: "0xabc",
      triggeredBy: "webhook:triton",
    });

    const event = await db("webhook_events").where({ transaction_id: tx.id }).first();
    expect(event.event_type).toBe("payment.success");
    const payload =
      typeof event.payload === "string" ? JSON.parse(event.payload) : event.payload;
    // The stored payload is the delivery envelope; the merchant-facing fields
    // sit under `data`.
    expect(payload.type).toBe("payment.success");
    expect(payload.data).toMatchObject({
      status: "SETTLED",
      crypto_network_hash: "0xabc",
      tx_id_display: tx.tx_id_display,
      amount: 250,
      currency: "GHS",
      method: "CRYPTO",
    });
    expect(attemptDelivery).toHaveBeenCalledWith(event.id);
  });

  it("settles normally for a merchant with no webhook endpoint", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    expect(
      await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" })
    ).toBe(true);
    expect(attemptDelivery).not.toHaveBeenCalled();
  });
});

describe("finaliseCryptoPayment — idempotency", () => {
  it("is a no-op on a transaction that already settled", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ calculation_method: "PERCENTAGE", percentage_rate: 2 });
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      amount: "25000",
    });

    expect(
      await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "webhook:triton" })
    ).toBe(true);

    // The webhook and the status poll both fire for the same payment; the
    // second one must not credit the merchant twice.
    expect(
      await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" })
    ).toBe(false);

    expect(await balanceOf("MERCHANT_FLOAT", merchant.id)).toBe(24_500n);
    expect(await balanceOf("ESCROW", null)).toBe(-25_000n);
    expect(await db("transaction_events").count("* as n").first()).toMatchObject({ n: "1" });
    const after = await db("transactions").where({ id: tx.id }).first();
    expect(String(after.processing_fee)).toBe("500");
  });

  it("blocks on the row lock and re-reads the status a competitor committed", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      amount: "25000",
    });

    // Deterministic version of the webhook-vs-poll race. A competitor holds
    // the row lock and settles the transaction while finaliseCryptoPayment is
    // waiting to acquire it. Because the function takes SELECT ... FOR UPDATE,
    // it only reads the row *after* the competitor commits, so it observes
    // SETTLED and backs out.
    //
    // Drop `.forUpdate()` from the source and this fails: the read is no longer
    // blocked, the function sees a stale AUTHORIZED, and credits the merchant a
    // second time.
    let releaseCompetitor: () => void;
    const competitorDone = new Promise<void>((resolve) => {
      releaseCompetitor = resolve;
    });

    const competitor = db.transaction(async (trx) => {
      await trx("transactions").where({ id: tx.id }).forUpdate().first();
      await competitorDone;
      await trx("transactions").where({ id: tx.id }).update({ status: "SETTLED" });
    });

    // Let the competitor take the lock first, then start the finaliser and give
    // it time to reach its SELECT and block there.
    await new Promise((r) => setTimeout(r, 100));
    const finalising = finaliseCryptoPayment({
      transactionId: tx.id,
      triggeredBy: "webhook:triton",
    });
    await new Promise((r) => setTimeout(r, 250));

    releaseCompetitor!();
    await competitor;

    expect(await finalising).toBe(false);
    expect(await db("ledger_entries").count("* as n").first()).toMatchObject({ n: "0" });
    expect(await balanceOf("MERCHANT_FLOAT", merchant.id)).toBeNull();
  });

  it("settles exactly once when three callers fire together", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, {
      status: "AUTHORIZED",
      amount: "25000",
    });

    const results = await Promise.all([
      finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "webhook:triton" }),
      finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" }),
      finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" }),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await balanceOf("MERCHANT_FLOAT", merchant.id)).toBe(25_000n);
    expect(await db("ledger_entries").count("* as n").first()).toMatchObject({ n: "2" });
  });

  it.each(["INITIATED", "FAILED", "EXPIRED", "CANCELLED", "REVERSED"])(
    "refuses to settle a transaction in %s",
    async (status) => {
      const merchant = await createMerchant();
      const tx = await createTransaction(merchant.id, { status });

      expect(
        await finaliseCryptoPayment({ transactionId: tx.id, triggeredBy: "status_poll" })
      ).toBe(false);
      expect((await db("transactions").where({ id: tx.id }).first()).status).toBe(status);
      expect(await db("ledger_entries").count("* as n").first()).toMatchObject({ n: "0" });
    }
  );

  it("returns false for a transaction that does not exist", async () => {
    expect(
      await finaliseCryptoPayment({
        transactionId: "00000000-0000-0000-0000-000000000000",
        triggeredBy: "status_poll",
      })
    ).toBe(false);
  });
});

describe("expireCryptoPayment", () => {
  it("moves an AUTHORIZED transaction to EXPIRED with a reason", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    expect(await expireCryptoPayment(tx.id, "cron:expiry")).toBe(true);

    const after = await db("transactions").where({ id: tx.id }).first();
    expect(after.status).toBe("EXPIRED");
    expect(after.failure_reason).toBe("Crypto payment window expired");
  });

  it("records the transition and a WARN log", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    await expireCryptoPayment(tx.id, "cron:expiry");

    const event = await db("transaction_events").where({ transaction_id: tx.id }).first();
    expect(event).toMatchObject({ from_status: "AUTHORIZED", to_status: "EXPIRED" });
    const log = await db("system_logs").where({ source: "CRYPTO_SETTLEMENT" }).first();
    expect(log.level).toBe("WARN");
  });

  it("posts no ledger entries", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    await expireCryptoPayment(tx.id, "cron:expiry");

    expect(await db("ledger_entries").count("* as n").first()).toMatchObject({ n: "0" });
  });

  it("enqueues payment.failed for a merchant with an endpoint", async () => {
    const merchant = await createMerchant();
    await createWebhookEndpoint(merchant.id);
    const tx = await createTransaction(merchant.id, { status: "AUTHORIZED" });

    await expireCryptoPayment(tx.id, "cron:expiry");

    const event = await db("webhook_events").where({ transaction_id: tx.id }).first();
    expect(event.event_type).toBe("payment.failed");
    expect(attemptDelivery).toHaveBeenCalledWith(event.id);
  });

  it("refuses to expire a transaction that already settled", async () => {
    const merchant = await createMerchant();
    const tx = await createTransaction(merchant.id, { status: "SETTLED" });

    expect(await expireCryptoPayment(tx.id, "cron:expiry")).toBe(false);
    expect((await db("transactions").where({ id: tx.id }).first()).status).toBe("SETTLED");
  });
});
