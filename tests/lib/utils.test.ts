import { describe, expect, it } from "vitest";
import { fromMinorUnits, normalizeMsisdn, toMinorUnits } from "@/lib/utils";

describe("toMinorUnits", () => {
  it("scales major units to minor units", () => {
    expect(toMinorUnits(10.5)).toBe(1050);
    expect(toMinorUnits(0)).toBe(0);
    expect(toMinorUnits(1)).toBe(100);
  });

  it("accepts the string amounts that arrive from JSON bodies", () => {
    expect(toMinorUnits("10.50")).toBe(1050);
    expect(toMinorUnits("0.01")).toBe(1);
  });

  it("rounds to the nearest minor unit rather than truncating", () => {
    expect(toMinorUnits(10.555)).toBe(1056);
    expect(toMinorUnits(10.554)).toBe(1055);
  });

  it("absorbs binary floating point error at the cent boundary", () => {
    // 19.99 * 100 is 1998.9999999999998 in IEEE-754 and 0.29 * 100 is
    // 28.999999999999996 — truncating either would lose a pesewa on every order.
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(toMinorUnits(0.29)).toBe(29);
    expect(toMinorUnits(1.1)).toBe(110);
  });

  it("treats unparseable input as zero instead of NaN", () => {
    expect(toMinorUnits("abc")).toBe(0);
    expect(toMinorUnits("")).toBe(0);
    expect(toMinorUnits(NaN)).toBe(0);
  });

  it("handles negative amounts (refunds/reversals)", () => {
    expect(toMinorUnits(-10.5)).toBe(-1050);
  });
});

describe("fromMinorUnits", () => {
  it("converts back to major units", () => {
    expect(fromMinorUnits(1050)).toBe(10.5);
    expect(fromMinorUnits(0)).toBe(0);
  });

  it("accepts the strings pg returns for bigint columns", () => {
    expect(fromMinorUnits("1050")).toBe(10.5);
  });

  it("accepts bigint, which the fee engine works in", () => {
    expect(fromMinorUnits(1050n)).toBe(10.5);
  });

  it("treats unparseable input as zero", () => {
    expect(fromMinorUnits("not-a-number")).toBe(0);
  });

  it("round-trips with toMinorUnits", () => {
    for (const amount of [0, 0.01, 1, 19.99, 1234.56, 999999.99]) {
      expect(fromMinorUnits(toMinorUnits(amount))).toBe(amount);
    }
  });
});

describe("normalizeMsisdn", () => {
  it("returns null for absent input", () => {
    expect(normalizeMsisdn(null)).toBeNull();
    expect(normalizeMsisdn(undefined)).toBeNull();
    expect(normalizeMsisdn("")).toBeNull();
  });

  it("returns null when there are no digits at all", () => {
    expect(normalizeMsisdn("not a phone")).toBeNull();
    expect(normalizeMsisdn("+++")).toBeNull();
  });

  it("passes through an already-normalised Ghanaian number", () => {
    expect(normalizeMsisdn("233241234567")).toBe("233241234567");
  });

  it("swaps the national trunk prefix for the country code", () => {
    expect(normalizeMsisdn("0241234567")).toBe("233241234567");
  });

  it("prefixes a bare national significant number", () => {
    expect(normalizeMsisdn("241234567")).toBe("233241234567");
  });

  it("collapses every spelling of the same number to one identity", () => {
    // The whole point of the function: one payer must not become five customers.
    const spellings = [
      "024 123 4567",
      "+233241234567",
      "233-24-123-4567",
      "00233241234567",
      "(024) 123-4567",
      "241234567",
    ];
    const normalised = spellings.map(normalizeMsisdn);
    expect(new Set(normalised).size).toBe(1);
    expect(normalised[0]).toBe("233241234567");
  });

  it("strips the 00 international dialling prefix", () => {
    expect(normalizeMsisdn("00233241234567")).toBe("233241234567");
  });

  it("keeps plausible foreign numbers as digits rather than rejecting them", () => {
    expect(normalizeMsisdn("+1 415 555 0123")).toBe("14155550123");
    expect(normalizeMsisdn("+44 20 7946 0958")).toBe("442079460958");
  });

  it("rejects numbers that are too short or too long to be E.164", () => {
    expect(normalizeMsisdn("12345")).toBeNull();
    expect(normalizeMsisdn("1234567890123456")).toBeNull();
  });

  it("rejects a leading-zero number that is not 10 digits", () => {
    // A national-format number of the wrong length is a typo, not a foreign number.
    expect(normalizeMsisdn("02412345678")).toBeNull();
  });
});
