import { Category, MetalType } from "@prisma/client";

const METAL_PREFIX: Record<MetalType, string> = {
  GOLD: "GLD",
  SILVER: "SLV",
  DIAMOND: "DMD",
};

const CATEGORY_TO_METAL: Record<Category, MetalType> = {
  GOLD: "GOLD",
  SILVER: "SILVER",
  DIAMOND: "DIAMOND",
  STONE: "DIAMOND",
  OTHER: "GOLD",
};

export function categoryToMetalType(category: Category): MetalType {
  return CATEGORY_TO_METAL[category];
}

export function getTagPrefix(metalType: MetalType): string {
  return METAL_PREFIX[metalType];
}

export function generateTagId(
  metalType: MetalType,
  year: number,
  sequence: number
): string {
  const prefix = getTagPrefix(metalType);
  return `${prefix}-${year}-${sequence.toString().padStart(5, "0")}`;
}

export function generateLotNumber(year: number, sequence: number): string {
  return `LOT-${year}-${sequence.toString().padStart(3, "0")}`;
}

export function generateCounterCode(sequence: number): string {
  return `CTR-${sequence.toString().padStart(2, "0")}`;
}

export function generateSupplierCode(sequence: number): string {
  return `SUP-${sequence.toString().padStart(3, "0")}`;
}

export function generatePurchaseBillNumber(
  lastNumber: number,
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date);
  const seq = (lastNumber + 1).toString().padStart(4, "0");
  return `PUR/${fy}/${seq}`;
}

export function generateOldMetalVoucherNumber(
  lastNumber: number,
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date);
  const seq = (lastNumber + 1).toString().padStart(4, "0");
  return `OMP/${fy}/${seq}`;
}

export function generatePurchaseReturnNumber(
  lastNumber: number,
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date);
  const seq = (lastNumber + 1).toString().padStart(4, "0");
  return `PRT/${fy}/${seq}`;
}

export function generateJournalNumber(
  lastNumber: number,
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date);
  const seq = (lastNumber + 1).toString().padStart(4, "0");
  return `JRN/${fy}/${seq}`;
}

export function generateVoucherNumber(
  prefix: string,
  lastNumber: number,
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date);
  const seq = (lastNumber + 1).toString().padStart(4, "0");
  return `${prefix}/${fy}/${seq}`;
}

export function generateSchemeCode(sequence: number): string {
  return `SCH-${sequence.toString().padStart(3, "0")}`;
}

export function generateChitMemberId(
  schemeCode: string,
  sequence: number
): string {
  const code = schemeCode.replace("SCH-", "SCH");
  return `${code}-${sequence.toString().padStart(3, "0")}`;
}

export function generateChitReceiptNumber(
  lastNumber: number,
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date);
  const seq = (lastNumber + 1).toString().padStart(4, "0");
  return `CHT/${fy}/${seq}`;
}

function getFinancialYear(date: Date): string {
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

export function parseDocumentSequence(number: string): number {
  const parts = number.split("/");
  if (parts.length !== 3) return 0;
  return parseInt(parts[2], 10) || 0;
}
