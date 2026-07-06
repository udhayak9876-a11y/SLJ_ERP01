export function formatINR(amount: number, showSymbol = true): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const [intPart, decPart] = abs.toFixed(2).split(".");
  const intStr = intPart;

  let formatted: string;
  if (intStr.length <= 3) {
    formatted = intStr;
  } else {
    const lastThree = intStr.slice(-3);
    const remaining = intStr.slice(0, -3);
    formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  const prefix = showSymbol ? "₹" : "";
  const sign = isNegative ? "-" : "";
  const decimals = decPart === "00" ? "" : `.${decPart}`;
  return `${sign}${prefix}${formatted}${decimals}`;
}

export function parseINR(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
