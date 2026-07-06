/**
 * Bill number generation: SLJ/YY-YY/NNNN
 * Financial-year aware (April–March).
 * e.g. July 2025 → SLJ/25-26/0001, Feb 2025 → SLJ/24-25/0001
 */

export const BILL_PREFIX = "SLJ";

/** Returns the financial year string ("24-25") for a given date. */
export function financialYearOf(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;
  return `${String(startYear % 100).padStart(2, "0")}-${String(endYear % 100).padStart(2, "0")}`;
}

/** Formats a bill number from a sequence number: SLJ/24-25/0001 */
export function formatBillNumber(sequence: number, date: Date = new Date()): string {
  return `${BILL_PREFIX}/${financialYearOf(date)}/${String(sequence).padStart(4, "0")}`;
}

/** Generates the next bill number given the last sequence used this financial year. */
export function generateBillNumber(lastNumber: number, date: Date = new Date()): string {
  return formatBillNumber(lastNumber + 1, date);
}

/** Extracts the sequence number from a bill number like SLJ/24-25/0012 → 12. Returns 0 if invalid. */
export function parseBillSequence(billNumber: string): number {
  const match = billNumber.match(/\/(\d{4,})$/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Prefix for looking up existing bills of the current financial year, e.g. "SLJ/24-25/" */
export function billNumberPrefix(date: Date = new Date()): string {
  return `${BILL_PREFIX}/${financialYearOf(date)}/`;
}
