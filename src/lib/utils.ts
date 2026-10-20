import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a major unit amount (e.g. 10.50 GHS) to minor units (e.g. 1050 pesewas)
 * to be stored safely as a bigint/integer in the database.
 */
export function toMinorUnits(amount: number | string): number {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts a minor unit amount (e.g. 1050 pesewas) from the database back
 * to a major unit amount (e.g. 10.50 GHS) for display or calculation.
 */
export function fromMinorUnits(minorAmount: number | string | bigint): number {
  const num = Number(minorAmount);
  if (isNaN(num)) return 0;
  return num / 100;
}

/** Ghana's country calling code — mobile money is Ghana-only today. */
const GH_COUNTRY_CODE = "233";

/**
 * Normalise a phone number to bare international digits (no `+`), e.g.
 * `233241234567`.
 *
 * The same payer types their number a different way on every checkout —
 * `024 123 4567`, `+233241234567`, `233-24-123-4567` — and each spelling would
 * otherwise become a separate customer. Matching happens on the output of this
 * function, so it has to be the only spelling we ever store.
 *
 * Ghanaian numbers are recognised explicitly (a leading `0` is a national
 * trunk prefix, dropped in favour of the country code). Anything else that
 * still looks like an international number is passed through as digits rather
 * than rejected, so a foreign payer is merged consistently even though we
 * can't validate their national format.
 *
 * Returns null when the input can't be a phone number, letting callers treat
 * "no usable identity" as a single case.
 */
export function normalizeMsisdn(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;

  // International prefix dialled the long way: 00233... → 233...
  if (digits.startsWith("00")) digits = digits.slice(2);

  // 233241234567 — already normalised.
  if (digits.length === 12 && digits.startsWith(GH_COUNTRY_CODE)) return digits;

  // 0241234567 — national format, swap the trunk prefix for the country code.
  if (digits.length === 10 && digits.startsWith("0")) {
    return GH_COUNTRY_CODE + digits.slice(1);
  }

  // 241234567 — national significant number on its own.
  if (digits.length === 9) return GH_COUNTRY_CODE + digits;

  // Not Ghanaian, but plausibly a foreign number: keep the digits so the same
  // payer still merges. E.164 allows at most 15 digits.
  if (digits.length >= 10 && digits.length <= 15 && !digits.startsWith("0")) {
    return digits;
  }

  return null;
}
