export function formatWeight(weight: number): string {
  return `${weight.toFixed(3)} g`;
}

export function roundWeight(weight: number): number {
  return Math.round(weight * 1000) / 1000;
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
