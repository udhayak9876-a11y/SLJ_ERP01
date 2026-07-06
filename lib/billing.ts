import { MakingType } from "@prisma/client";
import { round2, round3 } from "@/lib/utils/gst";

export interface ItemOption {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  karat: string | null;
  hsnCode: string;
  makingChargeType: MakingType;
  makingChargeValue: number;
}

export interface CustomerOption {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  state: string;
  gstin: string | null;
  address: string;
  city: string;
}

export interface TodayRates {
  gold24kRate: number;
  gold22kRate: number;
  gold18kRate: number;
  silverRate: number;
}

/** Raw user input for a bill line (strings straight from inputs). */
export interface LineInput {
  key: string;
  itemId: string;
  tagNumber: string;
  description: string;
  grossWeight: string;
  stoneWeight: string;
  wastagePercent: string;
  stoneCharge: string;
  /** Manual override of the auto rate, empty = use today's rate */
  rateOverride: string;
}

export interface LineComputed {
  netWeight: number;
  wastageWeight: number;
  totalWeight: number;
  ratePerGram: number;
  goldValue: number;
  makingChargeType: MakingType;
  makingChargeValue: number;
  makingChargeAmount: number;
  stoneCharge: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  lineTotal: number;
}

export function emptyLine(): LineInput {
  return {
    key: Math.random().toString(36).slice(2),
    itemId: "",
    tagNumber: "",
    description: "",
    grossWeight: "",
    stoneWeight: "",
    wastagePercent: "",
    stoneCharge: "",
    rateOverride: "",
  };
}

function num(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Picks today's rate based on the item's karat/purity. */
export function rateForItem(item: ItemOption | undefined, rates: TodayRates | null): number {
  if (!item || !rates) return 0;
  const karat = (item.karat ?? "").toUpperCase();
  if (karat.includes("24")) return rates.gold24kRate;
  if (karat.includes("22")) return rates.gold22kRate;
  if (karat.includes("18")) return rates.gold18kRate;
  if (item.category === "SILVER" || karat.includes("SILVER")) return rates.silverRate;
  if (item.category === "GOLD") return rates.gold22kRate;
  return 0;
}

const GST_RATE = 3.0;

export function computeLine(
  line: LineInput,
  item: ItemOption | undefined,
  rates: TodayRates | null
): LineComputed {
  const grossWeight = num(line.grossWeight);
  const stoneWeight = num(line.stoneWeight);
  const wastagePercent = num(line.wastagePercent);
  const stoneCharge = num(line.stoneCharge);

  const netWeight = round3(Math.max(grossWeight - stoneWeight, 0));
  const wastageWeight = round3(netWeight * (wastagePercent / 100));
  const totalWeight = round3(netWeight + wastageWeight);

  const autoRate = rateForItem(item, rates);
  const ratePerGram = line.rateOverride !== "" ? num(line.rateOverride) : autoRate;

  const goldValue = round2(totalWeight * ratePerGram);

  const makingChargeType = item?.makingChargeType ?? "PER_GRAM";
  const makingChargeValue = item?.makingChargeValue ?? 0;
  let makingChargeAmount = 0;
  if (makingChargeType === "PER_GRAM") {
    makingChargeAmount = round2(netWeight * makingChargeValue);
  } else if (makingChargeType === "PERCENTAGE") {
    makingChargeAmount = round2(goldValue * (makingChargeValue / 100));
  } else {
    makingChargeAmount = round2(makingChargeValue);
  }

  const taxableAmount = round2(goldValue + makingChargeAmount + stoneCharge);
  const gstAmount = round2(taxableAmount * (GST_RATE / 100));
  const lineTotal = round2(taxableAmount + gstAmount);

  return {
    netWeight,
    wastageWeight,
    totalWeight,
    ratePerGram,
    goldValue,
    makingChargeType,
    makingChargeValue,
    makingChargeAmount,
    stoneCharge,
    taxableAmount,
    gstRate: GST_RATE,
    gstAmount,
    lineTotal,
  };
}
