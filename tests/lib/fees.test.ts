import { describe, expect, it } from "vitest";
import { calculateFee } from "@/lib/fees";
import type { FeeSchedule, TieredBand } from "@/lib/types";

/**
 * calculateFee is the money path: it decides what the platform takes off every
 * payment and settlement. It is pure given a schedule row, so it is tested
 * directly against fixture rows shaped like `fee_schedules`.
 */
function schedule(overrides: Partial<FeeSchedule>): FeeSchedule {
  return {
    id: "fs_test",
    fee_type: "PAYMENT_PROCESSING",
    description: null,
    calculation_method: "FLAT",
    flat_amount: 0,
    percentage_rate: 0,
    currency: "GHS",
    minimum_amount: null,
    maximum_amount: null,
    applicability: "ALL_MERCHANTS",
    merchant_tier: null,
    merchant_id: null,
    applicable_rails: null,
    applicable_methods: null,
    tiered_bands: null,
    is_active: true,
    valid_from: new Date("2026-01-01"),
    valid_until: null,
    created_by: null,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-01"),
    ...overrides,
  } as FeeSchedule;
}

describe("calculateFee — FLAT", () => {
  it("charges the flat amount regardless of basis", () => {
    const s = schedule({ calculation_method: "FLAT", flat_amount: 150 });
    expect(calculateFee(s, 10_000n)).toBe(150n);
    expect(calculateFee(s, 1n)).toBe(150n);
    expect(calculateFee(s, 100_000_000n)).toBe(150n);
  });

  it("reads flat_amount when pg hands it back as a string", () => {
    const s = schedule({
      calculation_method: "FLAT",
      flat_amount: "150" as unknown as number,
    });
    expect(calculateFee(s, 10_000n)).toBe(150n);
  });

  it("returns zero when no flat amount is configured", () => {
    expect(calculateFee(schedule({ calculation_method: "FLAT" }), 10_000n)).toBe(0n);
  });
});

describe("calculateFee — PERCENTAGE", () => {
  it("applies the rate as a percentage of the basis", () => {
    // 1.5% of 100.00 GHS (10_000 pesewas) = 1.50 GHS = 150 pesewas
    const s = schedule({ calculation_method: "PERCENTAGE", percentage_rate: 1.5 });
    expect(calculateFee(s, 10_000n)).toBe(150n);
  });

  it("supports the full 4-decimal rate precision of numeric(6,4)", () => {
    // 0.0001% of 1_000_000_000 minor units = 1000 minor units
    const s = schedule({ calculation_method: "PERCENTAGE", percentage_rate: 0.0001 });
    expect(calculateFee(s, 1_000_000_000n)).toBe(1000n);
  });

  it("rounds half up at the sub-unit boundary", () => {
    // 1% of 50 = 0.5 minor units → rounds up to 1
    const s = schedule({ calculation_method: "PERCENTAGE", percentage_rate: 1 });
    expect(calculateFee(s, 50n)).toBe(1n);
    // 1% of 49 = 0.49 → rounds down to 0
    expect(calculateFee(s, 49n)).toBe(0n);
    // 1% of 149 = 1.49 → 1
    expect(calculateFee(s, 149n)).toBe(1n);
    // 1% of 150 = 1.5 → 2
    expect(calculateFee(s, 150n)).toBe(2n);
  });

  it("stays exact on amounts far beyond Number.MAX_SAFE_INTEGER", () => {
    // bigint arithmetic must not silently degrade to float on large ledgers.
    const s = schedule({ calculation_method: "PERCENTAGE", percentage_rate: 2.5 });
    const basis = 900_719_925_474_099_100n; // > 2^53
    expect(calculateFee(s, basis)).toBe(22_517_998_136_852_478n);
  });

  it("returns zero for a zero basis", () => {
    const s = schedule({ calculation_method: "PERCENTAGE", percentage_rate: 2.9 });
    expect(calculateFee(s, 0n)).toBe(0n);
  });
});

describe("calculateFee — FLAT_PLUS_PERCENTAGE", () => {
  it("sums the flat and percentage components", () => {
    // The classic PSP price: 30 pesewas + 2.9% of 100.00 GHS
    const s = schedule({
      calculation_method: "FLAT_PLUS_PERCENTAGE",
      flat_amount: 30,
      percentage_rate: 2.9,
    });
    expect(calculateFee(s, 10_000n)).toBe(30n + 290n);
  });
});

describe("calculateFee — TIERED", () => {
  const bands: TieredBand[] = [
    { from: 0, to: 9_999, rate: 3 },
    { from: 10_000, to: 99_999, rate: 2 },
    { from: 100_000, to: null, rate: 1 },
  ];
  const tiered = schedule({ calculation_method: "TIERED", tiered_bands: bands });

  it("picks the band containing the basis", () => {
    expect(calculateFee(tiered, 5_000n)).toBe(150n); // 3%
    expect(calculateFee(tiered, 50_000n)).toBe(1_000n); // 2%
    expect(calculateFee(tiered, 200_000n)).toBe(2_000n); // 1%
  });

  it("treats band bounds as inclusive on both ends", () => {
    expect(calculateFee(tiered, 9_999n)).toBe(300n); // 3% of 9999 = 299.97 → 300
    expect(calculateFee(tiered, 10_000n)).toBe(200n); // first cent of the 2% band
    expect(calculateFee(tiered, 99_999n)).toBe(2_000n); // 2% of 99999 = 1999.98 → 2000
    expect(calculateFee(tiered, 100_000n)).toBe(1_000n);
  });

  it("applies the unbounded top band to arbitrarily large amounts", () => {
    expect(calculateFee(tiered, 100_000_000n)).toBe(1_000_000n);
  });

  it("charges nothing when no band matches the basis", () => {
    const gapped = schedule({
      calculation_method: "TIERED",
      tiered_bands: [{ from: 10_000, to: 20_000, rate: 5 }],
    });
    expect(calculateFee(gapped, 5_000n)).toBe(0n);
    expect(calculateFee(gapped, 30_000n)).toBe(0n);
  });

  it("charges nothing when tiered_bands is null or not an array", () => {
    expect(calculateFee(schedule({ calculation_method: "TIERED" }), 10_000n)).toBe(0n);
    expect(
      calculateFee(
        schedule({
          calculation_method: "TIERED",
          tiered_bands: {} as unknown as TieredBand[],
        }),
        10_000n
      )
    ).toBe(0n);
  });
});

describe("calculateFee — minimum and maximum caps", () => {
  it("raises a fee below the floor up to the minimum", () => {
    const s = schedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 1,
      minimum_amount: 100,
    });
    expect(calculateFee(s, 1_000n)).toBe(100n); // 1% = 10 → floored up to 100
  });

  it("does not disturb a fee already above the floor", () => {
    const s = schedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 1,
      minimum_amount: 100,
    });
    expect(calculateFee(s, 100_000n)).toBe(1_000n);
  });

  it("caps a fee above the ceiling at the maximum", () => {
    const s = schedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 5,
      maximum_amount: 500,
    });
    expect(calculateFee(s, 1_000_000n)).toBe(500n); // 5% = 50_000 → capped
  });

  it("applies the maximum after the minimum when both are set", () => {
    const s = schedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 1,
      minimum_amount: 100,
      maximum_amount: 500,
    });
    expect(calculateFee(s, 100n)).toBe(100n); // below floor
    expect(calculateFee(s, 30_000n)).toBe(300n); // inside band
    expect(calculateFee(s, 1_000_000n)).toBe(500n); // above ceiling
  });

  it("reads caps that pg returned as strings", () => {
    const s = schedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 5,
      maximum_amount: "500" as unknown as number,
    });
    expect(calculateFee(s, 1_000_000n)).toBe(500n);
  });

  it("honours a zero maximum as a real cap, not an absent one", () => {
    const s = schedule({
      calculation_method: "PERCENTAGE",
      percentage_rate: 5,
      maximum_amount: 0,
    });
    expect(calculateFee(s, 1_000_000n)).toBe(0n);
  });
});

describe("calculateFee — guards", () => {
  it("never returns a negative fee", () => {
    const s = schedule({ calculation_method: "FLAT", flat_amount: -500 });
    expect(calculateFee(s, 10_000n)).toBe(0n);
  });

  it("returns zero for an unrecognised calculation method", () => {
    const s = schedule({
      calculation_method: "SOMETHING_NEW" as FeeSchedule["calculation_method"],
      flat_amount: 999,
    });
    expect(calculateFee(s, 10_000n)).toBe(0n);
  });

  it("always returns a bigint, never a number", () => {
    const s = schedule({ calculation_method: "PERCENTAGE", percentage_rate: 1.5 });
    expect(typeof calculateFee(s, 10_000n)).toBe("bigint");
  });
});
