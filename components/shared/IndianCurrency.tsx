import { formatINR } from "@/lib/utils/currency";

interface IndianCurrencyProps {
  amount: number;
  className?: string;
}

export function IndianCurrency({ amount, className }: IndianCurrencyProps) {
  return <span className={className}>{formatINR(amount)}</span>;
}
