import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resolveFeeSchedule } from "@/lib/fees";
import { closeDatabase, db, resetDatabase } from "../helpers/db";
import { createFeeSchedule, createMerchant, type MerchantRow } from "../helpers/factories";

beforeEach(resetDatabase);
afterAll(closeDatabase);

const hourAgo = () => new Date(Date.now() - 60 * 60 * 1000);
const hourAhead = () => new Date(Date.now() + 60 * 60 * 1000);

describe("resolveFeeSchedule — matching", () => {
  it("returns null when no schedule exists", async () => {
    const merchant = await createMerchant();
    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
    });
    expect(found).toBeNull();
  });

  it("matches an ALL_MERCHANTS schedule", async () => {
    const merchant = await createMerchant();
    const schedule = await createFeeSchedule({ applicability: "ALL_MERCHANTS" });
    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
    });
    expect(found?.id).toBe(schedule.id);
  });

  it("does not match a different fee type", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ fee_type: "SETTLEMENT_TRANSFER" });
    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
    });
    expect(found).toBeNull();
  });

  it("ignores inactive schedules", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ is_active: false });
    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "GHS",
      })
    ).toBeNull();
  });

  it("ignores a schedule that has not come into force yet", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ valid_from: hourAhead() });
    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "GHS",
      })
    ).toBeNull();
  });

  it("ignores a schedule that has already expired", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({ valid_from: hourAgo(), valid_until: hourAgo() });
    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "GHS",
      })
    ).toBeNull();
  });

  it("matches a schedule whose validity window is still open", async () => {
    const merchant = await createMerchant();
    const schedule = await createFeeSchedule({
      valid_from: hourAgo(),
      valid_until: hourAhead(),
    });
    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
    });
    expect(found?.id).toBe(schedule.id);
  });
});

describe("resolveFeeSchedule — precedence", () => {
  let merchant: MerchantRow;

  beforeEach(async () => {
    merchant = await createMerchant({ tier: "PREMIUM" });
  });

  it("prefers MERCHANT_SPECIFIC over MERCHANT_TIER and ALL_MERCHANTS", async () => {
    await createFeeSchedule({ applicability: "ALL_MERCHANTS", percentage_rate: 3 });
    await createFeeSchedule({
      applicability: "MERCHANT_TIER",
      merchant_tier: "PREMIUM",
      percentage_rate: 2,
    });
    const specific = await createFeeSchedule({
      applicability: "MERCHANT_SPECIFIC",
      merchant_id: merchant.id,
      percentage_rate: 1,
    });

    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      merchantTier: "PREMIUM",
      currency: "GHS",
    });
    expect(found?.id).toBe(specific.id);
  });

  it("prefers MERCHANT_TIER over ALL_MERCHANTS", async () => {
    await createFeeSchedule({ applicability: "ALL_MERCHANTS", percentage_rate: 3 });
    const tier = await createFeeSchedule({
      applicability: "MERCHANT_TIER",
      merchant_tier: "PREMIUM",
      percentage_rate: 2,
    });

    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      merchantTier: "PREMIUM",
      currency: "GHS",
    });
    expect(found?.id).toBe(tier.id);
  });

  it("does not apply another merchant's MERCHANT_SPECIFIC schedule", async () => {
    const other = await createMerchant();
    await createFeeSchedule({
      applicability: "MERCHANT_SPECIFIC",
      merchant_id: other.id,
      percentage_rate: 0.1,
    });
    const fallback = await createFeeSchedule({
      applicability: "ALL_MERCHANTS",
      percentage_rate: 3,
    });

    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
    });
    expect(found?.id).toBe(fallback.id);
  });

  it("does not apply a tier schedule to a merchant on another tier", async () => {
    await createFeeSchedule({
      applicability: "MERCHANT_TIER",
      merchant_tier: "ENTERPRISE",
      percentage_rate: 0.5,
    });
    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      merchantTier: "PREMIUM",
      currency: "GHS",
    });
    expect(found).toBeNull();
  });

  it("ignores tier schedules entirely when the context has no tier", async () => {
    await createFeeSchedule({
      applicability: "MERCHANT_TIER",
      merchant_tier: "PREMIUM",
      percentage_rate: 2,
    });
    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
    });
    expect(found).toBeNull();
  });

  it("takes the newest schedule when two share an applicability", async () => {
    await createFeeSchedule({
      applicability: "ALL_MERCHANTS",
      percentage_rate: 3,
      valid_from: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });
    const newer = await createFeeSchedule({
      applicability: "ALL_MERCHANTS",
      percentage_rate: 1,
      valid_from: hourAgo(),
    });

    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
    });
    expect(found?.id).toBe(newer.id);
  });
});

describe("resolveFeeSchedule — currency binding", () => {
  it("binds a schedule with a flat component to its currency", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({
      calculation_method: "FLAT_PLUS_PERCENTAGE",
      flat_amount: 30,
      percentage_rate: 2,
      currency: "USD",
    });

    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "GHS",
      })
    ).toBeNull();

    const usd = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "USD",
    });
    expect(usd).not.toBeNull();
  });

  it("applies a pure percentage schedule across currencies", async () => {
    const merchant = await createMerchant();
    // No flat component and no caps, so the rate is currency-agnostic.
    const schedule = await createFeeSchedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 1.5,
      flat_amount: 0,
      currency: "GHS",
      minimum_amount: null,
      maximum_amount: null,
    });

    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "USD",
    });
    expect(found?.id).toBe(schedule.id);
  });

  it("binds a capped percentage schedule to its currency", async () => {
    const merchant = await createMerchant();
    // A cap is an amount, so it only means something in its own currency.
    await createFeeSchedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 1.5,
      currency: "GHS",
      maximum_amount: 500,
    });
    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "USD",
      })
    ).toBeNull();
  });
});

describe("resolveFeeSchedule — rail and method scoping", () => {
  it("matches a rail-scoped schedule only for that rail", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({
      applicable_rails: db.raw("ARRAY['MTN_MOMO']::payment_rail[]"),
    });

    const match = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
      rail: "MTN_MOMO",
    });
    expect(match).not.toBeNull();

    const miss = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
      rail: "TELECEL_CASH",
    });
    expect(miss).toBeNull();
  });

  it("excludes a rail-scoped schedule when the context has no rail", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({
      applicable_rails: db.raw("ARRAY['MTN_MOMO']::payment_rail[]"),
    });
    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "GHS",
      })
    ).toBeNull();
  });

  it("applies an unscoped schedule to any rail", async () => {
    const merchant = await createMerchant();
    const schedule = await createFeeSchedule({ applicable_rails: null });
    const found = await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
      merchantId: merchant.id,
      currency: "GHS",
      rail: "USDC_BASE",
    });
    expect(found?.id).toBe(schedule.id);
  });

  it("matches a method-scoped schedule only for that method", async () => {
    const merchant = await createMerchant();
    await createFeeSchedule({
      applicable_methods: db.raw("ARRAY['CARD']::payment_method[]"),
    });

    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "GHS",
        method: "CARD",
      })
    ).not.toBeNull();
    expect(
      await resolveFeeSchedule(db, "PAYMENT_PROCESSING", {
        merchantId: merchant.id,
        currency: "GHS",
        method: "CRYPTO",
      })
    ).toBeNull();
  });
});
