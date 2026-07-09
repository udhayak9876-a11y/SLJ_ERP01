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

export function parseSequenceFromCode(
  code: string,
  expectedParts: number
): number {
  const parts = code.split("-");
  if (parts.length !== expectedParts) return 0;
  return parseInt(parts[parts.length - 1], 10) || 0;
}
