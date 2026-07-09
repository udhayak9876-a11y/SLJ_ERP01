"use server";

import { prisma } from "@/lib/prisma";

export async function getPurchaseRegister(fromDate?: Date, toDate?: Date) {
  const where: Record<string, unknown> = { status: "CONFIRMED" };
  if (fromDate || toDate) {
    where.billDate = {};
    if (fromDate) (where.billDate as Record<string, Date>).gte = fromDate;
    if (toDate) (where.billDate as Record<string, Date>).lte = toDate;
  }

  return prisma.purchaseBill.findMany({
    where,
    include: {
      supplier: true,
      items: { include: { product: true } },
    },
    orderBy: { billDate: "asc" },
  });
}

export async function getPurchaseRegisterBySupplier(
  fromDate?: Date,
  toDate?: Date
) {
  const bills = await getPurchaseRegister(fromDate, toDate);
  const bySupplier = new Map<
    string,
    {
      supplierName: string;
      bills: typeof bills;
      totalAmount: number;
      totalWeight: number;
    }
  >();

  for (const bill of bills) {
    const key = bill.supplierId;
    const existing = bySupplier.get(key) ?? {
      supplierName: bill.supplier.companyName,
      bills: [],
      totalAmount: 0,
      totalWeight: 0,
    };
    existing.bills.push(bill);
    existing.totalAmount += Number(bill.totalAmount);
    existing.totalWeight += Number(bill.totalWeight);
    bySupplier.set(key, existing);
  }

  return Array.from(bySupplier.values());
}

export async function getPurchaseReturnRegister(fromDate?: Date, toDate?: Date) {
  const where: Record<string, unknown> = { status: "CONFIRMED" };
  if (fromDate || toDate) {
    where.returnDate = {};
    if (fromDate) (where.returnDate as Record<string, Date>).gte = fromDate;
    if (toDate) (where.returnDate as Record<string, Date>).lte = toDate;
  }

  return prisma.purchaseReturn.findMany({
    where,
    include: {
      supplier: true,
      originalBill: true,
      items: { include: { tag: { include: { product: true } } } },
    },
    orderBy: { returnDate: "asc" },
  });
}
