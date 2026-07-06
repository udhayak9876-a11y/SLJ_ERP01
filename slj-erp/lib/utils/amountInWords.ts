const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function toWords(num: number): string {
  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100) return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
  if (num < 1000) return `${ones[Math.floor(num / 100)]} Hundred ${toWords(num % 100)}`.trim();
  if (num < 100000) return `${toWords(Math.floor(num / 1000))} Thousand ${toWords(num % 1000)}`.trim();
  if (num < 10000000) return `${toWords(Math.floor(num / 100000))} Lakh ${toWords(num % 100000)}`.trim();
  return `${toWords(Math.floor(num / 10000000))} Crore ${toWords(num % 10000000)}`.trim();
}

export function amountInWords(amount: number): string {
  const rounded = Math.round(amount);
  return `Rupees ${toWords(rounded).replace(/\s+/g, " ").trim()} Only`;
}
