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
