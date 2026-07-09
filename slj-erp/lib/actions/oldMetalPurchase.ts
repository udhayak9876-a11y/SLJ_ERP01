"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import {
  generateOldMetalVoucherNumber,
  parseDocumentSequence,
} from "@/lib/utils/documentNumber";
import { getFinancialYearDateRange } from "@/lib/utils/billNumber";
import { roundMoney, roundWeight } from "@/lib/utils/weight";
import { MetalType, PaymentMode } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateOldMetalInput {
  voucherDate: Date;
  customerId?: string;
  customerName?: string;
  metalType: MetalType;
  karat?: string;
  itemDescription: string;
  grossWeight: number;
  stoneWeight: number;
  purity: number;
  ratePerGram: number;
  paymentMode: PaymentMode;
  notes?: string;
}

async function nextVoucherNumber(date: Date): Promise<string> {
  const { start, end } = getFinancialYearDateRange(date);
  const vouchers = await prisma.oldMetalPurchase.findMany({
    where: {
      voucherNumber: { not: null },
      voucherDate: { gte: start, lte: end },
    },
    select: { voucherNumber: true },
  });
  let maxSeq = 0;
  for (const v of vouchers) {
    if (v.voucherNumber) {
      const seq = parseDocumentSequence(v.voucherNumber);
      if (seq > maxSeq) maxSeq = seq;
    }
  }
  return generateOldMetalVoucherNumber(maxSeq, date);
}

export async function getOldMetalPurchases() {
  return prisma.oldMetalPurchase.findMany({
    include: { customer: true },
    orderBy: { voucherDate: "desc" },
  });
}

export async function getOldMetalPurchase(id: string) {
  return prisma.oldMetalPurchase.findUnique({
    where: { id },
    include: { customer: true },
  });
}

export async function createOldMetalPurchase(input: CreateOldMetalInput) {
  const userEmail = await getCurrentUserEmail();
  const netWeight = roundWeight(input.grossWeight - input.stoneWeight);
  const effectiveWeight = roundWeight(netWeight * (input.purity / 100));
  const totalAmount = roundMoney(effectiveWeight * input.ratePerGram);
  const voucherNumber = await nextVoucherNumber(input.voucherDate);

  const record = await prisma.oldMetalPurchase.create({
    data: {
      voucherNumber,
      voucherDate: input.voucherDate,
      customerId: input.customerId || null,
      customerName: input.customerName || null,
      metalType: input.metalType,
      karat: input.karat || null,
      itemDescription: input.itemDescription,
      grossWeight: input.grossWeight,
      stoneWeight: input.stoneWeight,
      netWeight,
      purity: input.purity,
      ratePerGram: input.ratePerGram,
      totalAmount,
      paymentMode: input.paymentMode,
      notes: input.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });

  revalidatePath("/purchase/old-metal");
  return record;
}

export async function getOldMetalSummary(fromDate?: Date, toDate?: Date) {
  const where: Record<string, unknown> = {};
  if (fromDate || toDate) {
    where.voucherDate = {};
    if (fromDate) (where.voucherDate as Record<string, Date>).gte = fromDate;
    if (toDate) (where.voucherDate as Record<string, Date>).lte = toDate;
  }

  const records = await prisma.oldMetalPurchase.findMany({ where });

  const byMetal = new Map<
    MetalType,
    { count: number; weight: number; amount: number }
  >();

  for (const r of records) {
    const existing = byMetal.get(r.metalType) ?? {
      count: 0,
      weight: 0,
      amount: 0,
    };
    existing.count += 1;
    existing.weight += Number(r.netWeight);
    existing.amount += Number(r.totalAmount);
    byMetal.set(r.metalType, existing);
  }

  return {
    records,
    byMetal: Array.from(byMetal.entries()).map(([metalType, stats]) => ({
      metalType,
      ...stats,
    })),
    totals: {
      count: records.length,
      weight: records.reduce((s, r) => s + Number(r.netWeight), 0),
      amount: records.reduce((s, r) => s + Number(r.totalAmount), 0),
    },
  };
}
