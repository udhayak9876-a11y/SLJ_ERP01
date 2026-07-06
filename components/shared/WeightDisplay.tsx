import { formatWeight } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

interface WeightDisplayProps {
  grams: number;
  className?: string;
  showUnit?: boolean;
}

/** Displays a weight in grams to 3 decimal places: 10.450 g */
export function WeightDisplay({
  grams,
  className,
  showUnit = true,
}: WeightDisplayProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatWeight(grams)}
      {showUnit && " g"}
    </span>
  );
}
