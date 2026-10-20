import { describe, expect, it, vi, afterEach } from "vitest";
import {
  buildCsv,
  csvEscape,
  csvFilename,
  csvResponse,
  money,
  toBigInt,
} from "@/lib/csv";

describe("csvEscape", () => {
  it("leaves plain values untouched", () => {
    expect(csvEscape("TRX-001")).toBe("TRX-001");
    expect(csvEscape(1234)).toBe("1234");
  });

  it("renders null and undefined as an empty field", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("quotes fields containing the delimiter", () => {
    expect(csvEscape("Acme, Inc.")).toBe('"Acme, Inc."');
  });

  it("quotes and doubles embedded quotes (RFC 4180)", () => {
    expect(csvEscape('He said "hi"')).toBe('"He said ""hi"""');
  });

  it("quotes fields containing newlines so rows cannot be forged", () => {
    // An unquoted newline in a merchant-supplied field would inject a row.
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
    expect(csvEscape("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it("keeps a merchant-supplied name from breaking the row structure", () => {
    const hostile = 'Evil","999999.00","STOLEN';
    const csv = buildCsv(["name", "amount", "status"], [[hostile, "1.00", "OK"]]);
    // The hostile value must occupy exactly one field.
    expect(csv.split("\n")[1]).toBe('"Evil"",""999999.00"",""STOLEN",1.00,OK');
  });
});

describe("toBigInt", () => {
  it("parses the strings pg returns for bigint columns", () => {
    expect(toBigInt("1050")).toBe(1050n);
  });

  it("reads null and undefined as zero", () => {
    expect(toBigInt(null)).toBe(0n);
    expect(toBigInt(undefined)).toBe(0n);
  });

  it("accepts numbers and bigints", () => {
    expect(toBigInt(42)).toBe(42n);
    expect(toBigInt(42n)).toBe(42n);
  });

  it("preserves precision past Number.MAX_SAFE_INTEGER", () => {
    expect(toBigInt("9007199254740993")).toBe(9007199254740993n);
  });

  it("throws on a value that is not an integer, rather than exporting garbage", () => {
    expect(() => toBigInt("12.34")).toThrow();
    expect(() => toBigInt("abc")).toThrow();
  });
});

describe("money", () => {
  it("formats minor units as a 2dp decimal", () => {
    expect(money(1050n)).toBe("10.50");
    expect(money(0n)).toBe("0.00");
    expect(money(5n)).toBe("0.05");
  });

  it("keeps whole-cedi amounts at two decimal places", () => {
    expect(money(100_000n)).toBe("1000.00");
  });

  it("formats negative amounts", () => {
    expect(money(-1050n)).toBe("-10.50");
  });
});

describe("buildCsv", () => {
  it("joins a header and rows into a CSV body", () => {
    const csv = buildCsv(
      ["id", "amount"],
      [
        ["TRX-1", "10.00"],
        ["TRX-2", "20.00"],
      ]
    );
    expect(csv).toBe("id,amount\nTRX-1,10.00\nTRX-2,20.00");
  });

  it("emits a header-only body when there are no rows", () => {
    expect(buildCsv(["id", "amount"], [])).toBe("id,amount");
  });

  it("escapes every cell, not just the first", () => {
    const csv = buildCsv(["a", "b"], [["x", "y,z"]]);
    expect(csv).toBe('a,b\nx,"y,z"');
  });
});

describe("csvResponse", () => {
  it("returns a 200 CSV download with the filename attached", async () => {
    const res = csvResponse("id,amount\nTRX-1,10.00", "transactions.csv");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="transactions.csv"'
    );
    await expect(res.text()).resolves.toBe("id,amount\nTRX-1,10.00");
  });
});

describe("csvFilename", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stamps the prefix with today's date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-22T13:45:00Z"));
    expect(csvFilename("settlements")).toBe("settlements-2026-08-22.csv");
  });
});
