"use server";

import { prisma } from "@/lib/prisma";
import { getTrialBalance } from "@/lib/accounting/journalService";

export async function getDebtorLedger() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    include: {
      bills: {
        where: { status: "CONFIRMED", balanceDue: { gt: 0 } },
        orderBy: { billDate: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const today = new Date();

  return customers
    .filter((c) => c.bills.length > 0)
    .map((customer) => {
      const totalOutstanding = customer.bills.reduce(
        (s, b) => s + Number(b.balanceDue),
        0
      );

      const ageing = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };

      for (const bill of customer.bills) {
        const due = Number(bill.balanceDue);
        const days = Math.floor(
          (today.getTime() - new Date(bill.billDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (days <= 30) ageing.days30 += due;
        else if (days <= 60) ageing.days60 += due;
        else if (days <= 90) ageing.days90 += due;
        else ageing.over90 += due;
      }

      return {
        customer,
        totalOutstanding,
        ageing,
        bills: customer.bills,
      };
    });
}

export async function getCreditorLedger() {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    include: {
      purchaseBills: {
        where: { status: "CONFIRMED", paymentMode: { not: "CASH" } },
        orderBy: { billDate: "desc" },
      },
    },
    orderBy: { companyName: "asc" },
  });

  return suppliers
    .map((supplier) => {
      const totalPayable =
        Number(supplier.openingBalance) +
        supplier.purchaseBills.reduce((s, b) => s + Number(b.totalAmount), 0);
      return {
        supplier,
        totalPayable,
        bills: supplier.purchaseBills,
      };
    })
    .filter((s) => s.totalPayable > 0 || s.bills.length > 0);
}

export { getTrialBalance };
