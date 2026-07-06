export function getFinancialYear(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= 4) {
    const start = year % 100;
    const end = (year + 1) % 100;
    return `${start.toString().padStart(2, "0")}-${end.toString().padStart(2, "0")}`;
  }
  const start = (year - 1) % 100;
  const end = year % 100;
  return `${start.toString().padStart(2, "0")}-${end.toString().padStart(2, "0")}`;
}

export function generateBillNumber(
  lastNumber: number,
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date);
  const seq = (lastNumber + 1).toString().padStart(4, "0");
  return `SLJ/${fy}/${seq}`;
}

export function parseBillSequence(billNumber: string): number {
  const parts = billNumber.split("/");
  if (parts.length !== 3) return 0;
  return parseInt(parts[2], 10) || 0;
}

export function getFinancialYearDateRange(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= 4) {
    return {
      start: new Date(year, 3, 1),
      end: new Date(year + 1, 2, 31),
    };
  }
  return {
    start: new Date(year - 1, 3, 1),
    end: new Date(year, 2, 31),
  };
}
