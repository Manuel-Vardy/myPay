import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createPaymentSession, sessionUsageByApiKey } from "@/lib/payments/sessions";
import { closeDatabase, db, resetDatabase } from "../../helpers/db";
import { createApiKey, createMerchant, createPaymentLink } from "../../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

const sessionRow = async (id: string) =>
  await db("payment_sessions").where({ id }).first();

describe("createPaymentSession attribution", () => {
  it("records the API key that created the session", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    const created = await createPaymentSession(
      merchant,
      { amount: 50, currency: "GHS", customer_email: "payer@example.com" },
      { origin: "API", apiKeyId: key.id }
    );

    const row = await sessionRow(created.session_id);
    expect(row.origin).toBe("API");
    expect(row.api_key_id).toBe(key.id);
  });

  it("names the key in the audit log, not just the row", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    const created = await createPaymentSession(
      merchant,
      { amount: 50, currency: "GHS", customer_email: "payer@example.com" },
      { origin: "API", apiKeyId: key.id }
    );

    const log = await db("system_logs")
      .where("event_description", "like", `%${created.session_id}%`)
      .first();
    expect(log.event_description).toContain(`via API key ${key.id}`);
  });

  it("refuses an API-origin session with no key rather than creating an unattributable payment", async () => {
    const merchant = await createMerchant();

    await expect(
      createPaymentSession(merchant, { amount: 50, currency: "GHS" }, { origin: "API" })
    ).rejects.toThrow(/requires apiKeyId/);

    expect(await db("payment_sessions").count("id as cnt").first()).toMatchObject({
      cnt: "0",
    });
  });

  it("refuses to attribute a non-API session to a key", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    await expect(
      createPaymentSession(
        merchant,
        { amount: 50, currency: "GHS" },
        { origin: "DASHBOARD", apiKeyId: key.id }
      )
    ).rejects.toThrow(/only valid on an API-origin session/);
  });

  it("surviving a revoked key: attribution outlives revocation", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);
    const created = await createPaymentSession(
      merchant,
      { amount: 50, currency: "GHS", customer_email: "payer@example.com" },
      { origin: "API", apiKeyId: key.id }
    );

    // Keys are revoked, never deleted — the blast-radius query has to keep
    // working after the merchant pulls a leaked key.
    await db("api_keys").where({ id: key.id }).update({ revoked_at: db.fn.now() });

    const affected = await db("payment_sessions").where({ api_key_id: key.id });
    expect(affected.map((s: { id: string }) => s.id)).toEqual([created.session_id]);
  });
});

describe("payment link sessions", () => {
  it("carries no key, and the database refuses to give one", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    // A shared link is unauthenticated by design; the CHECK is what stops a
    // future insert site from inventing an attribution for one.
    await expect(
      db("payment_sessions").insert({
        merchant_id: merchant.id,
        amount: "5000",
        currency: "GHS",
        status: "ACTIVE",
        expires_at: new Date(Date.now() + 60_000),
        origin: "PAYMENT_LINK",
        api_key_id: key.id,
      })
    ).rejects.toThrow(/payment_sessions_api_key_origin_check/);
  });
});

describe("sessionUsageByApiKey", () => {
  const apiSession = (
    merchant: Awaited<ReturnType<typeof createMerchant>>,
    apiKeyId: string,
    overrides: Record<string, unknown> = {}
  ) =>
    db("payment_sessions")
      .insert({
        merchant_id: merchant.id,
        amount: "5000",
        currency: "GHS",
        status: "ACTIVE",
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        origin: "API",
        api_key_id: apiKeyId,
        ...overrides,
      })
      .returning("*");

  it("counts each key's own sessions, and no one else's", async () => {
    const merchant = await createMerchant();
    const mine = await createApiKey(merchant.id);
    const other = await createApiKey(merchant.id);

    await apiSession(merchant, mine.id);
    await apiSession(merchant, mine.id);
    await apiSession(merchant, other.id);

    const usage = await sessionUsageByApiKey([mine.id, other.id]);
    expect(usage.get(mine.id)?.session_count).toBe(2);
    expect(usage.get(other.id)?.session_count).toBe(1);
  });

  it("counts only sessions that can still take money as live", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    await apiSession(merchant, key.id); // live
    await apiSession(merchant, key.id, { status: "COMPLETED" });
    await apiSession(merchant, key.id, { status: "EXPIRED" });
    // ACTIVE but past its TTL: checkout refuses it, so it is not live.
    await apiSession(merchant, key.id, {
      expires_at: new Date(Date.now() - 60 * 1000),
    });

    const usage = await sessionUsageByApiKey([key.id]);
    expect(usage.get(key.id)).toEqual({ session_count: 4, live_session_count: 1 });
  });

  it("omits keys with nothing to their name, so callers default to zero", async () => {
    const merchant = await createMerchant();
    const unused = await createApiKey(merchant.id);

    const usage = await sessionUsageByApiKey([unused.id]);
    expect(usage.has(unused.id)).toBe(false);
    expect(usage.get(unused.id)?.session_count ?? 0).toBe(0);
  });

  it("ignores link sessions, which belong to no key", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);
    const link = await createPaymentLink(merchant.id);

    await apiSession(merchant, key.id);
    await db("payment_sessions").insert({
      merchant_id: merchant.id,
      payment_link_id: link.id,
      amount: "5000",
      currency: "GHS",
      status: "ACTIVE",
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      origin: "PAYMENT_LINK",
    });

    const usage = await sessionUsageByApiKey([key.id]);
    expect(usage.get(key.id)?.session_count).toBe(1);
  });

  it("returns an empty map for no keys without touching the database", async () => {
    expect(await sessionUsageByApiKey([])).toEqual(new Map());
  });
});
