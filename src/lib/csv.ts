// Helpers shared by the merchant CSV export routes.
import { fromMinorUnits } from "@/lib/utils";

/** Quote a field when it carries a delimiter, quote, or newline (RFC 4180). */
export function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** pg returns bigint columns as strings; null/undefined read as zero. */
export function toBigInt(value: unknown): bigint {
  if (value === null || value === undefined) return 0n;
  return BigInt(String(value));
}

/**
 * Money is summed in minor units and only converted at the end, so the
 * arithmetic stays exact. Fixed to 2dp for a clean accounting export.
 */
export function money(minorUnits: bigint): string {
  return fromMinorUnits(minorUnits.toString()).toFixed(2);
}

/** Serialize a header + rows into a CSV body. */
export function buildCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

/** A CSV download response with the attachment filename set. */
export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** `<prefix>-YYYY-MM-DD.csv` */
export function csvFilename(prefix: string): string {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
}
