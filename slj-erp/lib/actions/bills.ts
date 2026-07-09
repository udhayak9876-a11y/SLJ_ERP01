"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import {
  generateBillNumber,
  getFinancialYearDateRange,
  parseBillSequence,
} from "@/lib/utils/billNumber";
import { calculateGST } from "@/lib/utils/gst";
import { calculateRoundOff } from "@/lib/utils/billCalc";
import { startOfToday } from "@/lib/utils/date";
import {
  BillStatus,
  BillType,
  MakingType,
  PaymentMode,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { assertDayNotLocked } from "@/lib/accounting/dayLock";
import { postSalesBillJournal } from "@/lib/accounting/journalService";

export interface BillLineInput {
  itemId: string;
  tagNumber?: string;
  description: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  wastagePercent: number;
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
  sortOrder: number;
}

export interface CreateBillInput {
  billDate: Date;
  billType: BillType;
  customerId?: string;
  walkInName?: string;
  customerState: string;
  paymentMode: PaymentMode;
  discountAmount: number;
  amountPaid: number;
  notes?: string;
  items: BillLineInput[];
  status: BillStatus;
}

async function getNextBillNumber(billDate: Date): Promise<string> {
  const { start, end } = getFinancialYearDateRange(billDate);
  const bills = await prisma.salesBill.findMany({
    where: {
      billNumber: { not: null },
      billDate: { gte: start, lte: end },
      status: "CONFIRMED",
    },
    select: { billNumber: true },
  });

  let maxSeq = 0;
  for (const bill of bills) {
    if (bill.billNumber) {
      const seq = parseBillSequence(bill.billNumber);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  return generateBillNumber(maxSeq, billDate);
}

function calculateBillTotals(
  items: BillLineInput[],
  customerState: string,
  discountAmount: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.taxableAmount, 0);
  const gst = calculateGST(subtotal, customerState);
  const preRoundTotal =
    subtotal + gst.cgst + gst.sgst + gst.igst - discountAmount;
  const roundOff = calculateRoundOff(preRoundTotal);
  const totalAmount = Math.round((preRoundTotal + roundOff) * 100) / 100;

  return {
    subtotal,
    cgstAmount: gst.cgst,
    sgstAmount: gst.sgst,
    igstAmount: gst.igst,
    discountAmount,
    roundOff,
    totalAmount,
  };
}

export async function createBill(input: CreateBillInput) {
  const email = await getCurrentUserEmail();
  await assertDayNotLocked(input.billDate);
  const totals = calculateBillTotals(
    input.items,
    input.customerState,
    input.discountAmount
  );
  const balanceDue = totals.totalAmount - input.amountPaid;

  let billNumber: string | null = null;
  if (input.status === "CONFIRMED") {
    billNumber = await getNextBillNumber(input.billDate);
  }

  const bill = await prisma.salesBill.create({
    data: {
      billNumber,
      billDate: input.billDate,
      billType: input.billType,
      customerId: input.customerId || null,
      walkInName: input.walkInName || null,
      subtotal: totals.subtotal,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      discountAmount: totals.discountAmount,
      roundOff: totals.roundOff,
      totalAmount: totals.totalAmount,
      amountPaid: input.amountPaid,
      balanceDue,
      paymentMode: input.paymentMode,
      status: input.status,
      createdBy: email,
      notes: input.notes || null,
      items: {
        create: input.items.map((item) => ({
          itemId: item.itemId,
          tagNumber: item.tagNumber || null,
          description: item.description,
          grossWeight: item.grossWeight,
          stoneWeight: item.stoneWeight,
          netWeight: item.netWeight,
          wastagePercent: item.wastagePercent,
          wastageWeight: item.wastageWeight,
          totalWeight: item.totalWeight,
          ratePerGram: item.ratePerGram,
          goldValue: item.goldValue,
          makingChargeType: item.makingChargeType,
          makingChargeValue: item.makingChargeValue,
          makingChargeAmount: item.makingChargeAmount,
          stoneCharge: item.stoneCharge,
          taxableAmount: item.taxableAmount,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
          lineTotal: item.lineTotal,
          sortOrder: item.sortOrder,
        })),
      },
    },
    include: {
      customer: true,
      items: { include: { item: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  revalidatePath("/bills");
  revalidatePath("/");
  revalidatePath("/accounting");

  if (input.status === "CONFIRMED") {
    try {
      await postSalesBillJournal(bill);
    } catch (e) {
      console.error("[slj-erp] Sales journal posting failed:", e);
    }
  }

  return bill;
}

export async function getBills(filters?: {
  status?: BillStatus;
  paymentMode?: PaymentMode;
  fromDate?: Date;
  toDate?: Date;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.paymentMode) where.paymentMode = filters.paymentMode;
  if (filters?.fromDate || filters?.toDate) {
    where.billDate = {};
    if (filters.fromDate)
      (where.billDate as Record<string, Date>).gte = filters.fromDate;
    if (filters.toDate)
      (where.billDate as Record<string, Date>).lte = filters.toDate;
  }

  return prisma.salesBill.findMany({
    where,
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBill(id: string) {
  return prisma.salesBill.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { item: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function cancelBill(id: string) {
  await prisma.salesBill.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/bills");
  revalidatePath("/");
}

export async function getTodayBillsSummary() {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bills = await prisma.salesBill.findMany({
    where: {
      billDate: { gte: today, lt: tomorrow },
      status: "CONFIRMED",
    },
  });

  const totalSales = bills.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  );
  const cashCollected = bills
    .filter((b) => b.paymentMode === "CASH")
    .reduce((sum, b) => sum + Number(b.amountPaid), 0);

  return {
    count: bills.length,
    totalSales,
    cashCollected,
  };
}

export async function getRecentBills(limit = 10) {
  return prisma.salesBill.findMany({
    where: { status: "CONFIRMED" },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getDashboardStats() {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayBills, draftCount, outstanding, chitPayments] = await Promise.all([
    prisma.salesBill.findMany({
      where: {
        billDate: { gte: today, lt: tomorrow },
        status: "CONFIRMED",
      },
    }),
    prisma.salesBill.count({ where: { status: "DRAFT" } }),
    prisma.salesBill.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { balanceDue: true },
    }),
    prisma.chitPayment.findMany({
      where: { paymentDate: { gte: today, lt: tomorrow } },
    }),
  ]);

  const todaySales = todayBills.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  );
  const cashCollected = todayBills
    .filter((b) => b.paymentMode === "CASH")
    .reduce((sum, b) => sum + Number(b.amountPaid), 0);
  const salesCollected = todayBills.reduce(
    (sum, b) => sum + Number(b.amountPaid),
    0
  );
  const chitCollected = chitPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  return {
    todaySalesCount: todayBills.length,
    todaySalesTotal: todaySales,
    cashCollected,
    totalCollected: salesCollected + chitCollected,
    chitCollected,
    pendingDrafts: draftCount,
    outstanding: Number(outstanding._sum.balanceDue || 0),
  };
}
