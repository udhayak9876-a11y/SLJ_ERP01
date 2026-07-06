import { formatWeight } from "@/lib/utils/weight";

interface WeightDisplayProps {
  weight: number;
  className?: string;
}

export function WeightDisplay({ weight, className }: WeightDisplayProps) {
  return <span className={className}>{formatWeight(weight)}</span>;
}
