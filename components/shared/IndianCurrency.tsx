import { formatINR } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

interface IndianCurrencyProps {
  amount: number;
  decimals?: number;
  className?: string;
}

/** Displays an amount in Indian lakh format: ₹1,25,000 */
export function IndianCurrency({
  amount,
  decimals = 0,
  className,
}: IndianCurrencyProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatINR(amount, decimals)}
    </span>
  );
}
