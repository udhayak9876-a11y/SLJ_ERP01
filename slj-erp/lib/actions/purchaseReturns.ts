"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import {
  generatePurchaseReturnNumber,
  parseDocumentSequence,
} from "@/lib/utils/documentNumber";
import { getFinancialYearDateRange } from "@/lib/utils/billNumber";
import { updateLotTotals } from "@/lib/actions/lots";
import { revalidatePath } from "next/cache";

async function nextReturnNumber(returnDate: Date): Promise<string> {
  const { start, end } = getFinancialYearDateRange(returnDate);
  const returns = await prisma.purchaseReturn.findMany({
    where: {
      returnNumber: { not: null },
      returnDate: { gte: start, lte: end },
      status: "CONFIRMED",
    },
    select: { returnNumber: true },
  });
  let maxSeq = 0;
  for (const r of returns) {
    if (r.returnNumber) {
      const seq = parseDocumentSequence(r.returnNumber);
      if (seq > maxSeq) maxSeq = seq;
    }
  }
  return generatePurchaseReturnNumber(maxSeq, returnDate);
}

export async function getPurchaseReturns() {
  return prisma.purchaseReturn.findMany({
    include: {
      supplier: true,
      originalBill: true,
      _count: { select: { items: true } },
    },
    orderBy: { returnDate: "desc" },
  });
}

export async function getPurchaseReturn(id: string) {
  return prisma.purchaseReturn.findUnique({
    where: { id },
    include: {
      supplier: true,
      originalBill: { include: { supplier: true } },
      items: {
        include: {
          tag: { include: { product: true } },
        },
      },
    },
  });
}

export async function createPurchaseReturn(input: {
  originalBillId: string;
  returnDate: Date;
  reason: string;
  tagIds: string[];
  notes?: string;
  confirm?: boolean;
}) {
  const userEmail = await getCurrentUserEmail();
  const bill = await prisma.purchaseBill.findUniqueOrThrow({
    where: { id: input.originalBillId },
    include: { supplier: true },
  });

  if (bill.status !== "CONFIRMED") {
    throw new Error("Can only return from confirmed purchase bills");
  }

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: input.tagIds },
      status: { in: ["RECEIVED", "COUNTER_ASSIGNED"] },
    },
  });

  if (tags.length !== input.tagIds.length) {
    throw new Error("Some tags are not available for return");
  }

  const purchaseReturn = await prisma.purchaseReturn.create({
    data: {
      originalBillId: input.originalBillId,
      returnDate: input.returnDate,
      supplierId: bill.supplierId,
      reason: input.reason,
      status: "DRAFT",
      notes: input.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
      items: {
        create: input.tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  if (input.confirm) {
    await confirmPurchaseReturn(purchaseReturn.id);
  }

  revalidatePath("/purchase/returns");
  return purchaseReturn;
}

export async function confirmPurchaseReturn(id: string) {
  const userEmail = await getCurrentUserEmail();
  const purchaseReturn = await prisma.purchaseReturn.findUniqueOrThrow({
    where: { id },
    include: {
      items: { include: { tag: true } },
      originalBill: true,
    },
  });

  if (purchaseReturn.status !== "DRAFT") {
    throw new Error("Return already processed");
  }

  const returnNumber = await nextReturnNumber(purchaseReturn.returnDate);

  await prisma.$transaction(async (tx) => {
    for (const item of purchaseReturn.items) {
      await tx.tag.update({
        where: { id: item.tagId },
        data: {
          status: "RETURNED",
          returnedDate: purchaseReturn.returnDate,
          counterId: null,
          updatedBy: userEmail,
        },
      });

      await tx.stockMovement.create({
        data: {
          tagId: item.tagId,
          movementType: "RETURN_IN",
          fromLocation: "Stock",
          toLocation: "Supplier Return",
          weight: item.tag.netWeight,
          date: purchaseReturn.returnDate,
          referenceId: id,
          createdBy: userEmail,
          updatedBy: userEmail,
        },
      });
    }

    await tx.purchaseReturn.update({
      where: { id },
      data: {
        returnNumber,
        status: "CONFIRMED",
        updatedBy: userEmail,
      },
    });
  });

  if (purchaseReturn.originalBill.lotId) {
    await updateLotTotals(purchaseReturn.originalBill.lotId);
  }

  revalidatePath("/purchase/returns");
  revalidatePath("/stock/tags");
}
