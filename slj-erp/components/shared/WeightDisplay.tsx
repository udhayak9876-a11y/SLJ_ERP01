export function WeightDisplay({ value }: { value: number }) {
  return <span>{value.toFixed(3)} g</span>;
}
