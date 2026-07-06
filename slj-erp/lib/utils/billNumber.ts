export function generateBillNumber(lastNumber: number): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;

  const startYY = String(fyStart).slice(-2);
  const endYY = String(fyEnd).slice(-2);
  const sequence = String(lastNumber + 1).padStart(4, "0");

  return `SLJ/${startYY}-${endYY}/${sequence}`;
}
