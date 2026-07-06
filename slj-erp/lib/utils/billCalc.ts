import { MakingType } from "@prisma/client";
import { calculateLineGST } from "./gst";
import { roundMoney, roundWeight } from "./weight";

export interface LineItemInput {
  grossWeight: number;
  stoneWeight: number;
  wastagePercent: number;
  ratePerGram: number;
  makingChargeType: MakingType;
  makingChargeValue: number;
  stoneCharge: number;
  gstRate?: number;
}

export interface LineItemCalculated {
  netWeight: number;
  wastageWeight: number;
  totalWeight: number;
  goldValue: number;
  makingChargeAmount: number;
  taxableAmount: number;
  gstAmount: number;
  lineTotal: number;
}

export function calculateLineItem(input: LineItemInput): LineItemCalculated {
  const netWeight = roundWeight(input.grossWeight - input.stoneWeight);
  const wastageWeight = roundWeight(
    netWeight * (input.wastagePercent / 100)
  );
  const totalWeight = roundWeight(netWeight + wastageWeight);
  const goldValue = roundMoney(totalWeight * input.ratePerGram);

  let makingChargeAmount = 0;
  switch (input.makingChargeType) {
    case "PER_GRAM":
      makingChargeAmount = roundMoney(netWeight * input.makingChargeValue);
      break;
    case "PERCENTAGE":
      makingChargeAmount = roundMoney(
        goldValue * (input.makingChargeValue / 100)
      );
      break;
    case "FIXED":
      makingChargeAmount = roundMoney(input.makingChargeValue);
      break;
  }

  const taxableAmount = roundMoney(
    goldValue + makingChargeAmount + input.stoneCharge
  );
  const gstRate = input.gstRate ?? 3;
  const gstAmount = calculateLineGST(taxableAmount, gstRate);
  const lineTotal = roundMoney(taxableAmount + gstAmount);

  return {
    netWeight,
    wastageWeight,
    totalWeight,
    goldValue,
    makingChargeAmount,
    taxableAmount,
    gstAmount,
    lineTotal,
  };
}

export function getRateForKarat(
  karat: string | null | undefined,
  rates: {
    gold24kRate: number;
    gold22kRate: number;
    gold18kRate: number;
    silverRate: number;
  }
): number {
  if (!karat) return rates.gold22kRate;
  const k = karat.toUpperCase();
  if (k.includes("24")) return rates.gold24kRate;
  if (k.includes("22")) return rates.gold22kRate;
  if (k.includes("18")) return rates.gold18kRate;
  if (k.includes("SILVER") || k.includes("925")) return rates.silverRate;
  return rates.gold22kRate;
}

export function calculateRoundOff(total: number): number {
  const rounded = Math.round(total);
  return roundMoney(rounded - total);
}
