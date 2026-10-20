import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  expireActiveSessionsForMerchant,
  expireSessionsForLink,
  pauseMerchantPayments,
  resumeMerchantPayments,
} from "@/lib/payments/controls";
import { closeDatabase, db, resetDatabase } from "../../helpers/db";
import { createMerchant, createPaymentLink, createPaymentSession } from "../../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

const statusOf = async (id: string) =>
  (await db("payment_sessions").where({ id }).first()).status;

describe("expireSessionsForLink", () => {
  it("expires the link's ACTIVE sessions and reports how many", async () => {
    const merchant = await createMerchant();
    const link = await createPaymentLink(merchant.id);
    const a = await createPaymentSession(merchant.id, { payment_link_id: link.id });
    const b = await createPaymentSession(merchant.id, { payment_link_id: link.id });

    const count = await expireSessionsForLink(link.id);

    expect(count).toBe(2);
    expect(await statusOf(a.id)).toBe("EXPIRED");
    expect(await statusOf(b.id)).toBe("EXPIRED");
  });

  it("leaves sessions belonging to other links alone", async () => {
    const merchant = await createMerchant();
    const link = await createPaymentLink(merchant.id);
    const other = await createPaymentLink(merchant.id);
    const mine = await createPaymentSession(merchant.id, { payment_link_id: link.id });
    const theirs = await createPaymentSession(merchant.id, { payment_link_id: other.id });

    await expireSessionsForLink(link.id);

    expect(await statusOf(mine.id)).toBe("EXPIRED");
    expect(await statusOf(theirs.id)).toBe("ACTIVE");
  });

  it("does not reopen or disturb already-completed sessions", async () => {
    const merchant = await createMerchant();
    const link = await createPaymentLink(merchant.id);
    const done = await createPaymentSession(merchant.id, {
      payment_link_id: link.id,
      status: "COMPLETED",
    });

    expect(await expireSessionsForLink(link.id)).toBe(0);
    expect(await statusOf(done.id)).toBe("COMPLETED");
  });
});

describe("expireActiveSessionsForMerchant", () => {
  it("expires every ACTIVE session across all channels", async () => {
    const merchant = await createMerchant();
    const link = await createPaymentLink(merchant.id);
    const viaLink = await createPaymentSession(merchant.id, { payment_link_id: link.id });
    const viaApi = await createPaymentSession(merchant.id);

    expect(await expireActiveSessionsForMerchant(merchant.id)).toBe(2);
    expect(await statusOf(viaLink.id)).toBe("EXPIRED");
    expect(await statusOf(viaApi.id)).toBe("EXPIRED");
  });

  it("does not touch another merchant's sessions", async () => {
    const merchant = await createMerchant();
    const other = await createMerchant();
    await createPaymentSession(merchant.id);
    const theirs = await createPaymentSession(other.id);

    await expireActiveSessionsForMerchant(merchant.id);
    expect(await statusOf(theirs.id)).toBe("ACTIVE");
  });
});

describe("pauseMerchantPayments", () => {
  it("marks the merchant paused and expires outstanding sessions atomically", async () => {
    const merchant = await createMerchant();
    const session = await createPaymentSession(merchant.id);

    const { sessionsExpired } = await pauseMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "MERCHANT_PORTAL",
      reason: "fraud review",
    });

    // Blocking new sessions is not enough: an outstanding session would keep
    // accepting money for its full 24h TTL.
    expect(sessionsExpired).toBe(1);
    expect(await statusOf(session.id)).toBe("EXPIRED");

    const row = await db("merchants").where({ id: merchant.id }).first();
    expect(row.payments_paused_at).not.toBeNull();
    expect(row.payments_paused_by).toBe(merchant.user_id);
    expect(row.payments_paused_reason).toBe("fraud review");
  });

  it("writes a WARN audit log naming the merchant and the actor", async () => {
    const merchant = await createMerchant();
    await createPaymentSession(merchant.id);

    await pauseMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "ADMIN_ACTION",
      reason: "compliance hold",
    });

    const log = await db("system_logs").where({ source: "ADMIN_ACTION" }).first();
    expect(log.level).toBe("WARN");
    expect(log.actor_id).toBe(merchant.user_id);
    expect(log.event_description).toContain(merchant.merchant_display_id);
    expect(log.event_description).toContain("compliance hold");
    expect(log.event_description).toContain("1 active session(s) expired");
  });

  it("truncates an overlong reason rather than failing the pause", async () => {
    const merchant = await createMerchant();
    await pauseMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "ADMIN_ACTION",
      reason: "x".repeat(900),
    });

    const row = await db("merchants").where({ id: merchant.id }).first();
    expect(row.payments_paused_reason).toHaveLength(500);
  });

  it("stores a blank reason as null", async () => {
    const merchant = await createMerchant();
    await pauseMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "MERCHANT_PORTAL",
      reason: "   ",
    });

    const row = await db("merchants").where({ id: merchant.id }).first();
    expect(row.payments_paused_reason).toBeNull();
  });

  it("throws for a merchant that does not exist", async () => {
    await expect(
      pauseMerchantPayments({
        merchantId: "00000000-0000-0000-0000-000000000000",
        actorId: "00000000-0000-0000-0000-000000000000",
        source: "ADMIN_ACTION",
      })
    ).rejects.toThrow(/not found/);
  });

  it("leaves no partial state when the pause transaction fails", async () => {
    const merchant = await createMerchant();
    const session = await createPaymentSession(merchant.id);

    await expect(
      pauseMerchantPayments({
        merchantId: merchant.id,
        // A non-existent actor violates the audit log's FK, aborting the whole
        // transaction — the merchant must not be left half-paused.
        actorId: "00000000-0000-0000-0000-000000000000",
        source: "ADMIN_ACTION",
      })
    ).rejects.toThrow();

    const row = await db("merchants").where({ id: merchant.id }).first();
    expect(row.payments_paused_at).toBeNull();
    expect(await statusOf(session.id)).toBe("ACTIVE");
  });
});

describe("resumeMerchantPayments", () => {
  it("clears the pause fields", async () => {
    const merchant = await createMerchant();
    await pauseMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "ADMIN_ACTION",
      reason: "hold",
    });

    await resumeMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "ADMIN_ACTION",
    });

    const row = await db("merchants").where({ id: merchant.id }).first();
    expect(row.payments_paused_at).toBeNull();
    expect(row.payments_paused_by).toBeNull();
    expect(row.payments_paused_reason).toBeNull();
  });

  it("does not revive the sessions the pause expired", async () => {
    const merchant = await createMerchant();
    const session = await createPaymentSession(merchant.id);
    await pauseMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "ADMIN_ACTION",
    });

    await resumeMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "ADMIN_ACTION",
    });

    // Reviving them would resurrect payment instruments the merchant believed
    // were dead.
    expect(await statusOf(session.id)).toBe("EXPIRED");
  });

  it("writes an INFO audit log", async () => {
    const merchant = await createMerchant();
    await resumeMerchantPayments({
      merchantId: merchant.id,
      actorId: merchant.user_id,
      source: "MERCHANT_PORTAL",
    });

    const log = await db("system_logs").where({ source: "MERCHANT_PORTAL" }).first();
    expect(log.level).toBe("INFO");
    expect(log.event_description).toContain("RESUMED");
  });
});
