import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { checkAuthRateLimit, requireActiveApiKey, requireApiKey } from "@/lib/guards";
import { closeDatabase, db, resetDatabase } from "../helpers/db";
import { createApiKey, createKycRecord, createMerchant } from "../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

function apiRequest(rawKey?: string, url = "https://api.trite.test/v1/payments") {
  return new NextRequest(url, {
    headers: rawKey ? { authorization: `Bearer ${rawKey}` } : {},
  });
}

async function bodyOf(res: Response) {
  return JSON.parse(await res.text());
}

/** A merchant whose key is valid and whose account passes every check. */
async function verifiedMerchant() {
  const merchant = await createMerchant();
  await createKycRecord(merchant.user_id, "APPROVED");
  const key = await createApiKey(merchant.id);
  return { merchant, key };
}

describe("requireApiKey — rejection paths", () => {
  it("rejects a request with no Authorization header", async () => {
    const guard = await requireApiKey(apiRequest());
    expect(guard.error?.status).toBe(401);
    expect(guard.error?.headers.get("WWW-Authenticate")).toBe("Bearer");
    expect(guard.merchant).toBeUndefined();
  });

  it("rejects a non-Bearer scheme", async () => {
    const req = new NextRequest("https://api.trite.test/v1/payments", {
      headers: { authorization: "Basic trite_sk_whatever" },
    });
    expect((await requireApiKey(req)).error?.status).toBe(401);
  });

  it("rejects a token that does not carry the trite_sk_ prefix", async () => {
    expect((await requireApiKey(apiRequest("sk_live_something"))).error?.status).toBe(401);
  });

  it("rejects an unknown key", async () => {
    expect((await requireApiKey(apiRequest("trite_sk_deadbeef"))).error?.status).toBe(401);
  });

  it("rejects a revoked key with the same response as an unknown one", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id, { revoked_at: new Date() });

    const revoked = await requireApiKey(apiRequest(key.rawKey));
    const unknown = await requireApiKey(apiRequest("trite_sk_deadbeef"));

    expect(revoked.error?.status).toBe(401);
    // Revoked and unknown must be indistinguishable — otherwise the API
    // confirms which keys once existed.
    expect(await bodyOf(revoked.error!)).toEqual(await bodyOf(unknown.error!));
  });

  it("invalidates a merchant's keys when the merchant is deleted", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);
    expect((await requireApiKey(apiRequest(key.rawKey))).error).toBeUndefined();

    await db("merchants").where({ id: merchant.id }).del();

    // api_keys.merchant_id is ON DELETE CASCADE, so the key row goes with the
    // merchant and the lookup simply misses. The guard's own `!merchant` branch
    // is therefore defensive only — it is not reachable by deleting a merchant.
    expect(await db("api_keys").where({ id: key.id }).first()).toBeUndefined();
    expect((await requireApiKey(apiRequest(key.rawKey))).error?.status).toBe(401);
  });

  it("accepts the key by hash, never storing the raw value", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    const stored = await db("api_keys").where({ id: key.id }).first();
    expect(stored.key_hash).not.toBe(key.rawKey);
    expect(JSON.stringify(stored)).not.toContain(key.rawKey.slice(16));
  });
});

describe("requireApiKey — success", () => {
  it("returns the merchant and the key id for a valid key", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    const guard = await requireApiKey(apiRequest(key.rawKey));
    expect(guard.error).toBeUndefined();
    expect(guard.merchant?.id).toBe(merchant.id);
    expect(guard.apiKeyId).toBe(key.id);
  });

  it("touches last_used_at", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);
    expect((await db("api_keys").where({ id: key.id }).first()).last_used_at).toBeNull();

    await requireApiKey(apiRequest(key.rawKey));

    // The touch is deliberately fire-and-forget, so poll rather than assume.
    let lastUsed: Date | null = null;
    for (let i = 0; i < 40 && !lastUsed; i++) {
      lastUsed = (await db("api_keys").where({ id: key.id }).first()).last_used_at;
      if (!lastUsed) await new Promise((r) => setTimeout(r, 25));
    }
    expect(lastUsed).not.toBeNull();
  });
});

describe("requireApiKey — rate limiting", () => {
  it("allows requests up to the limit and rejects the next one", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);
    const opts = { endpoint: "test/limited", limit: 3, windowSeconds: 60 };

    for (let i = 0; i < 3; i++) {
      expect((await requireApiKey(apiRequest(key.rawKey), opts)).error).toBeUndefined();
    }

    const limited = await requireApiKey(apiRequest(key.rawKey), opts);
    expect(limited.error?.status).toBe(429);
    expect(Number(limited.error?.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("keeps a separate budget per endpoint", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);
    const limit = { limit: 1, windowSeconds: 60 };

    await requireApiKey(apiRequest(key.rawKey), { endpoint: "a", ...limit });
    expect(
      (await requireApiKey(apiRequest(key.rawKey), { endpoint: "a", ...limit })).error?.status
    ).toBe(429);
    // A different endpoint must not inherit the exhausted budget.
    expect(
      (await requireApiKey(apiRequest(key.rawKey), { endpoint: "b", ...limit })).error
    ).toBeUndefined();
  });

  it("keeps a separate budget per merchant", async () => {
    const first = await createMerchant();
    const second = await createMerchant();
    const keyA = await createApiKey(first.id);
    const keyB = await createApiKey(second.id);
    const opts = { endpoint: "shared", limit: 1, windowSeconds: 60 };

    await requireApiKey(apiRequest(keyA.rawKey), opts);
    expect((await requireApiKey(apiRequest(keyA.rawKey), opts)).error?.status).toBe(429);
    // One noisy merchant must not rate-limit another.
    expect((await requireApiKey(apiRequest(keyB.rawKey), opts)).error).toBeUndefined();
  });

  it("counts every key belonging to the merchant against one budget", async () => {
    const merchant = await createMerchant();
    const keyA = await createApiKey(merchant.id);
    const keyB = await createApiKey(merchant.id);
    const opts = { endpoint: "shared", limit: 1, windowSeconds: 60 };

    await requireApiKey(apiRequest(keyA.rawKey), opts);
    // The limit is per merchant, so minting a second key must not double it.
    expect((await requireApiKey(apiRequest(keyB.rawKey), opts)).error?.status).toBe(429);
  });

  it("derives the endpoint from the request path when none is given", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);
    const opts = { limit: 1, windowSeconds: 60 };

    await requireApiKey(apiRequest(key.rawKey, "https://api.trite.test/v1/one"), opts);
    expect(
      (await requireApiKey(apiRequest(key.rawKey, "https://api.trite.test/v1/one"), opts))
        .error?.status
    ).toBe(429);
    expect(
      (await requireApiKey(apiRequest(key.rawKey, "https://api.trite.test/v1/two"), opts))
        .error
    ).toBeUndefined();
  });
});

describe("requireActiveApiKey", () => {
  it("passes a verified merchant with approved KYC", async () => {
    const { merchant, key } = await verifiedMerchant();
    const guard = await requireActiveApiKey(apiRequest(key.rawKey));
    expect(guard.error).toBeUndefined();
    expect(guard.merchant?.id).toBe(merchant.id);
  });

  it("rejects an unverified email with an actionable code", async () => {
    const merchant = await createMerchant({}, );
    await db("users").where({ id: merchant.user_id }).update({ email_verified_at: null });
    await createKycRecord(merchant.user_id, "APPROVED");
    const key = await createApiKey(merchant.id);

    const guard = await requireActiveApiKey(apiRequest(key.rawKey));
    expect(guard.error?.status).toBe(403);
    expect(await bodyOf(guard.error!)).toMatchObject({ code: "EMAIL_NOT_VERIFIED" });
  });

  it("rejects a merchant with no KYC record and reports a null status", async () => {
    const merchant = await createMerchant();
    const key = await createApiKey(merchant.id);

    const guard = await requireActiveApiKey(apiRequest(key.rawKey));
    expect(guard.error?.status).toBe(403);
    expect(await bodyOf(guard.error!)).toMatchObject({
      code: "KYC_NOT_APPROVED",
      kyc_status: null,
    });
  });

  it("rejects KYC that is not APPROVED and echoes the current status", async () => {
    for (const status of ["PENDING", "IN_REVIEW", "REJECTED", "EXPIRED"]) {
      await resetDatabase();
      const merchant = await createMerchant();
      await createKycRecord(merchant.user_id, status);
      const key = await createApiKey(merchant.id);

      const guard = await requireActiveApiKey(apiRequest(key.rawKey));
      expect(guard.error?.status).toBe(403);
      expect(await bodyOf(guard.error!)).toMatchObject({
        code: "KYC_NOT_APPROVED",
        kyc_status: status,
      });
    }
  });

  it("still applies key validation before the verification checks", async () => {
    // An unknown key must 401, not leak a 403 about verification state.
    const guard = await requireActiveApiKey(apiRequest("trite_sk_unknown"));
    expect(guard.error?.status).toBe(401);
  });
});

describe("checkAuthRateLimit", () => {
  it("allows attempts up to the limit", async () => {
    for (let i = 0; i < 5; i++) {
      const result = await checkAuthRateLimit("user:alice", "mfa_verify", {
        limit: 5,
        windowSeconds: 300,
      });
      expect(result.error).toBeUndefined();
    }
  });

  it("rejects the attempt past the limit with Retry-After", async () => {
    const opts = { limit: 2, windowSeconds: 300 };
    await checkAuthRateLimit("user:bob", "login", opts);
    await checkAuthRateLimit("user:bob", "login", opts);

    const limited = await checkAuthRateLimit("user:bob", "login", opts);
    expect(limited.error?.status).toBe(429);
    expect(Number(limited.error?.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("keeps identifiers independent, so one user cannot lock out another", async () => {
    const opts = { limit: 1, windowSeconds: 300 };
    await checkAuthRateLimit("user:carol", "login", opts);
    expect((await checkAuthRateLimit("user:carol", "login", opts)).error?.status).toBe(429);
    expect((await checkAuthRateLimit("user:dave", "login", opts)).error).toBeUndefined();
  });

  it("keeps endpoints independent", async () => {
    const opts = { limit: 1, windowSeconds: 300 };
    await checkAuthRateLimit("user:erin", "login", opts);
    expect((await checkAuthRateLimit("user:erin", "login", opts)).error?.status).toBe(429);
    expect(
      (await checkAuthRateLimit("user:erin", "mfa_verify", opts)).error
    ).toBeUndefined();
  });

  it("defaults to 5 attempts per identifier", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await checkAuthRateLimit("user:frank", "login")).error).toBeUndefined();
    }
    expect((await checkAuthRateLimit("user:frank", "login")).error?.status).toBe(429);
  });
});
