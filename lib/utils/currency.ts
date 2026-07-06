/**
 * Indian currency formatting utilities.
 * Uses the Indian numbering system: ₹1,00,000 (lakh) not ₹100,000.
 */

/** Formats a number in the Indian grouping system without the ₹ symbol. */
export function formatIndianNumber(amount: number, decimals = 0): string {
  const negative = amount < 0;
  const fixed = Math.abs(amount).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");

  let formatted: string;
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }

  const result = decPart ? `${formatted}.${decPart}` : formatted;
  return negative ? `-${result}` : result;
}

/** Formats an amount as Indian Rupees: 125000 → "₹1,25,000" */
export function formatINR(amount: number, decimals = 0): string {
  const negative = amount < 0;
  const formatted = formatIndianNumber(Math.abs(amount), decimals);
  return negative ? `-₹${formatted}` : `₹${formatted}`;
}

/** Formats a weight in grams to 3 decimal places: 10.45 → "10.450" */
export function formatWeight(grams: number): string {
  return grams.toFixed(3);
}
