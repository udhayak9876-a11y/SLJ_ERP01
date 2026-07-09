"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { assertDayNotLocked, startOfDay } from "@/lib/accounting/dayLock";
import { getCashBook } from "@/lib/actions/cashBook";
import { revalidatePath } from "next/cache";

export async function getDayEndRecords() {
  return prisma.dayEnd.findMany({ orderBy: { date: "desc" }, take: 30 });
}

export async function getDayEnd(date: Date) {
  const d = startOfDay(date);
  return prisma.dayEnd.findUnique({ where: { date: d } });
}

export async function closeDayEnd(date: Date) {
  const d = startOfDay(date);
  const existing = await prisma.dayEnd.findUnique({ where: { date: d } });
  if (existing?.isDayLocked) {
    throw new Error("Day already closed");
  }

  const userEmail = await getCurrentUserEmail();
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);

  const [salesBills, purchaseBills, oldMetal, priorDay, cashBook] =
    await Promise.all([
      prisma.salesBill.findMany({
        where: { billDate: d, status: "CONFIRMED" },
      }),
      prisma.purchaseBill.findMany({
        where: { billDate: d, status: "CONFIRMED" },
      }),
      prisma.oldMetalPurchase.findMany({ where: { voucherDate: d } }),
      prisma.dayEnd.findFirst({
        where: { date: { lt: d } },
        orderBy: { date: "desc" },
      }),
      getCashBook(d, d),
    ]);

  const totalSales = salesBills.reduce((s, b) => s + Number(b.amountPaid), 0);
  const totalPurchases = purchaseBills.reduce(
    (s, b) => s + Number(b.totalAmount),
    0
  );
  const oldMetalTotal = oldMetal.reduce(
    (s, r) => s + Number(r.totalAmount),
    0
  );
  const openingCash = priorDay ? Number(priorDay.closingCash) : cashBook.opening;
  const closingCash = cashBook.closing;

  const report = {
    salesCount: salesBills.length,
    salesTotal: salesBills.reduce((s, b) => s + Number(b.totalAmount), 0),
    purchaseCount: purchaseBills.length,
    oldMetalCount: oldMetal.length,
    oldMetalTotal,
    cashIn: cashBook.lines.reduce((s, l) => s + l.debit, 0),
    cashOut: cashBook.lines.reduce((s, l) => s + l.credit, 0),
  };

  const dayEnd = await prisma.dayEnd.upsert({
    where: { date: d },
    create: {
      date: d,
      openingCash,
      totalSales,
      totalPurchases: totalPurchases + oldMetalTotal,
      totalChitCollection: 0,
      totalExpenses: 0,
      closingCash,
      isDayLocked: true,
      lockedBy: userEmail,
      dayEndReport: report,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
    update: {
      openingCash,
      totalSales,
      totalPurchases: totalPurchases + oldMetalTotal,
      closingCash,
      isDayLocked: true,
      lockedBy: userEmail,
      lockedAt: new Date(),
      dayEndReport: report,
      updatedBy: userEmail,
    },
  });

  revalidatePath("/accounting/day-end");
  return dayEnd;
}

export async function assertTransactionDateNotLocked(date: Date) {
  await assertDayNotLocked(date);
}
