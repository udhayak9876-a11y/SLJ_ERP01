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

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? " " + ones[o] : "");
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return ones[h] + " Hundred" + (rest ? " " + convertBelowThousand(rest) : "");
}

function convertIndian(n: number): string {
  if (n === 0) return "";
  if (n < 1000) return convertBelowThousand(n);

  if (n < 100000) {
    const lakh = Math.floor(n / 100000);
    const rest = n % 100000;
    const crorePart =
      lakh > 0 ? convertBelowThousand(lakh) + " Lakh" : "";
    const thousandPart =
      rest >= 1000
        ? " " + convertBelowThousand(Math.floor(rest / 1000)) + " Thousand"
        : "";
    const remainder = rest % 1000;
    const remPart = remainder > 0 ? " " + convertBelowThousand(remainder) : "";
    return (crorePart + thousandPart + remPart).trim();
  }

  const crore = Math.floor(n / 10000000);
  const rest = n % 10000000;
  const crorePart = convertBelowThousand(crore) + " Crore";
  const restPart = rest > 0 ? " " + convertIndian(rest) : "";
  return (crorePart + restPart).trim();
}

export function amountInWords(amount: number): string {
  if (amount === 0) return "Rupees Zero Only";

  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const rupees = Math.floor(abs);
  const paise = Math.round((abs - rupees) * 100);

  let words = convertIndian(rupees);
  if (paise > 0) {
    words += " and " + convertBelowThousand(paise) + " Paise";
  }

  const prefix = isNegative ? "Minus " : "";
  return `${prefix}Rupees ${words} Only`;
}
