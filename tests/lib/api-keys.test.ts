import { describe, expect, it } from "vitest";
import { API_KEY_PREFIX, generateApiKey, generateWebhookSecret, hashApiKey } from "@/lib/api-keys";

/**
 * Only the sha256 hash of a key is persisted, so a leaked database cannot mint
 * requests. These tests pin that property plus the entropy of the raw key.
 */
describe("hashApiKey", () => {
  it("produces a stable 64-char hex sha256", () => {
    const hash = hashApiKey("trite_sk_abc");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashApiKey("trite_sk_abc")).toBe(hash);
  });

  it("matches the known sha256 of its input", () => {
    // Guards against a silent algorithm change invalidating every stored key.
    expect(hashApiKey("trite_sk_test")).toBe(
      "3602a8c25a02cb3d8186533e7824cdb301c5e4418543e88b62ea3ec1384edc6e"
    );
  });

  it("gives different hashes for different keys", () => {
    expect(hashApiKey("a")).not.toBe(hashApiKey("b"));
  });
});

describe("generateApiKey", () => {
  it("returns a raw key carrying the public prefix", () => {
    const { rawKey } = generateApiKey();
    expect(rawKey.startsWith(API_KEY_PREFIX)).toBe(true);
  });

  it("carries 32 bytes of entropy after the prefix", () => {
    const { rawKey } = generateApiKey();
    expect(rawKey.slice(API_KEY_PREFIX.length)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns the hash of the raw key it generated", () => {
    const { rawKey, keyHash } = generateApiKey();
    expect(keyHash).toBe(hashApiKey(rawKey));
  });

  it("never returns the raw key inside the stored hash", () => {
    const { rawKey, keyHash } = generateApiKey();
    expect(keyHash).not.toContain(rawKey);
  });

  it("stores a display prefix that is a strict prefix of the raw key", () => {
    const { rawKey, prefix } = generateApiKey();
    expect(prefix).toHaveLength(16);
    expect(rawKey.startsWith(prefix)).toBe(true);
    // The display prefix must not leak enough of the secret to be guessable.
    expect(prefix.length).toBeLessThan(rawKey.length / 2);
  });

  it("does not repeat across generations", () => {
    const keys = new Set(Array.from({ length: 200 }, () => generateApiKey().rawKey));
    expect(keys.size).toBe(200);
  });
});

describe("generateWebhookSecret", () => {
  it("carries the whsec_ prefix and 24 bytes of entropy", () => {
    expect(generateWebhookSecret()).toMatch(/^whsec_[0-9a-f]{48}$/);
  });

  it("does not repeat across generations", () => {
    const secrets = new Set(Array.from({ length: 200 }, generateWebhookSecret));
    expect(secrets.size).toBe(200);
  });
});
