import { formatINR } from "@/lib/utils/currency";

export function IndianCurrency({ amount }: { amount: number }) {
  return <span>{formatINR(amount)}</span>;
}
