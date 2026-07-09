"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import {
  generateChitReceiptNumber,
  parseDocumentSequence,
} from "@/lib/utils/documentNumber";
import { getFinancialYearDateRange } from "@/lib/utils/billNumber";
import {
  getMemberInstalmentStatus,
  closeChitMember,
} from "@/lib/actions/chitMembers";
import { assertDayNotLocked } from "@/lib/accounting/dayLock";
import { PaymentMode } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function nextReceiptNumber(paymentDate: Date): Promise<string> {
  const { start, end } = getFinancialYearDateRange(paymentDate);
  const receipts = await prisma.chitPayment.findMany({
    where: {
      paymentDate: { gte: start, lte: end },
    },
    select: { receiptNumber: true },
  });
  let maxSeq = 0;
  for (const r of receipts) {
    const seq = parseDocumentSequence(r.receiptNumber);
    if (seq > maxSeq) maxSeq = seq;
  }
  return generateChitReceiptNumber(maxSeq, paymentDate);
}

export async function getChitPayments(filters?: {
  schemeId?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.schemeId) where.schemeId = filters.schemeId;
  if (filters?.fromDate || filters?.toDate) {
    where.paymentDate = {};
    if (filters.fromDate)
      (where.paymentDate as Record<string, Date>).gte = filters.fromDate;
    if (filters.toDate)
      (where.paymentDate as Record<string, Date>).lte = filters.toDate;
  }

  return prisma.chitPayment.findMany({
    where,
    include: {
      member: { include: { customer: true } },
      scheme: true,
    },
    orderBy: { paymentDate: "desc" },
  });
}

export async function collectChitInstalment(data: {
  memberId: string;
  paymentDate: Date;
  instalmentNumber?: number;
  amount?: number;
  paymentMode: PaymentMode;
  notes?: string;
}) {
  await assertDayNotLocked(data.paymentDate);
  const userEmail = await getCurrentUserEmail();

  const status = await getMemberInstalmentStatus(data.memberId);
  if (status.member.status !== "ACTIVE") {
    throw new Error("Member is not active");
  }
  if (status.isMature) {
    throw new Error("All instalments already collected");
  }

  const instalmentNumber =
    data.instalmentNumber ?? status.nextInstalment!;
  const amount = data.amount ?? Number(status.member.scheme.instalmentAmount);

  const existing = await prisma.chitPayment.findFirst({
    where: { memberId: data.memberId, instalmentNumber },
  });
  if (existing) {
    throw new Error(`Instalment ${instalmentNumber} already paid`);
  }

  const receiptNumber = await nextReceiptNumber(data.paymentDate);

  const payment = await prisma.chitPayment.create({
    data: {
      memberId: data.memberId,
      schemeId: status.member.schemeId,
      paymentDate: data.paymentDate,
      instalmentNumber,
      amount,
      paymentMode: data.paymentMode,
      collectedBy: userEmail,
      receiptNumber,
      notes: data.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });

  const updatedStatus = await getMemberInstalmentStatus(data.memberId);
  if (updatedStatus.isMature) {
    await closeChitMember(data.memberId);
  }

  revalidatePath("/schemes");
  revalidatePath(`/schemes/members/${data.memberId}`);
  revalidatePath("/");
  return payment;
}

export async function getChitCollectionByDate(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  return prisma.chitPayment.findMany({
    where: { paymentDate: { gte: d, lt: next } },
    include: {
      member: { include: { customer: true } },
      scheme: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getChitCollectionSummary(fromDate?: Date, toDate?: Date) {
  const where: Record<string, unknown> = {};
  if (fromDate || toDate) {
    where.paymentDate = {};
    if (fromDate) (where.paymentDate as Record<string, Date>).gte = fromDate;
    if (toDate) (where.paymentDate as Record<string, Date>).lte = toDate;
  }

  const payments = await prisma.chitPayment.findMany({ where });

  const byMode = new Map<string, { count: number; amount: number }>();
  const byScheme = new Map<
    string,
    { schemeName: string; count: number; amount: number }
  >();

  for (const p of payments) {
    const mode = p.paymentMode;
    const modeStat = byMode.get(mode) ?? { count: 0, amount: 0 };
    modeStat.count += 1;
    modeStat.amount += Number(p.amount);
    byMode.set(mode, modeStat);
  }

  const paymentsWithScheme = await prisma.chitPayment.findMany({
    where,
    include: { scheme: true },
  });

  for (const p of paymentsWithScheme) {
    const key = p.schemeId;
    const stat = byScheme.get(key) ?? {
      schemeName: p.scheme.schemeName,
      count: 0,
      amount: 0,
    };
    stat.count += 1;
    stat.amount += Number(p.amount);
    byScheme.set(key, stat);
  }

  return {
    totalCount: payments.length,
    totalAmount: payments.reduce((s, p) => s + Number(p.amount), 0),
    byMode: Array.from(byMode.entries()).map(([mode, stats]) => ({
      mode,
      ...stats,
    })),
    byScheme: Array.from(byScheme.values()),
  };
}

export async function getClosedMembers() {
  return prisma.chitMember.findMany({
    where: { status: "CLOSED" },
    include: { customer: true, scheme: true, payments: true },
    orderBy: { updatedAt: "desc" },
  });
}
