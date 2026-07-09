"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import {
  generatePurchaseBillNumber,
  generateTagId,
  getTagPrefix,
  generateLotNumber,
  parseDocumentSequence,
} from "@/lib/utils/documentNumber";
import { getFinancialYearDateRange } from "@/lib/utils/billNumber";
import { normalizeHuid, validateHuid } from "@/lib/utils/huid";
import { roundMoney, roundWeight } from "@/lib/utils/weight";
import {
  BillStatus,
  MetalType,
  PaymentMode,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { assertDayNotLocked } from "@/lib/accounting/dayLock";
import { postPurchaseBillJournal } from "@/lib/accounting/journalService";

export interface PurchaseLineInput {
  productId: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  huidNumber?: string;
  purchaseRate: number;
  amount: number;
  sortOrder: number;
}

export interface CreatePurchaseBillInput {
  billDate: Date;
  supplierId: string;
  invoiceNumber?: string;
  metalType: MetalType;
  paymentMode: PaymentMode;
  notes?: string;
  items: PurchaseLineInput[];
  status: BillStatus;
}

async function nextPurchaseBillNumber(billDate: Date): Promise<string> {
  const { start, end } = getFinancialYearDateRange(billDate);
  const bills = await prisma.purchaseBill.findMany({
    where: {
      billNumber: { not: null },
      billDate: { gte: start, lte: end },
      status: "CONFIRMED",
    },
    select: { billNumber: true },
  });
  let maxSeq = 0;
  for (const b of bills) {
    if (b.billNumber) {
      const seq = parseDocumentSequence(b.billNumber);
      if (seq > maxSeq) maxSeq = seq;
    }
  }
  return generatePurchaseBillNumber(maxSeq, billDate);
}

async function nextLotNumber(lotDate: Date): Promise<string> {
  const year = lotDate.getFullYear();
  const prefix = `LOT-${year}-`;
  const last = await prisma.lot.findFirst({
    where: { lotNumber: { startsWith: prefix } },
    orderBy: { lotNumber: "desc" },
  });
  let seq = 0;
  if (last) {
    const parts = last.lotNumber.split("-");
    seq = parseInt(parts[2], 10) || 0;
  }
  return generateLotNumber(year, seq + 1);
}

function calcTotals(items: PurchaseLineInput[]) {
  const totalPieces = items.length;
  const totalWeight = roundWeight(
    items.reduce((s, i) => s + i.netWeight, 0)
  );
  const totalAmount = roundMoney(items.reduce((s, i) => s + i.amount, 0));
  return { totalPieces, totalWeight, totalAmount };
}

export async function getPurchaseBills() {
  return prisma.purchaseBill.findMany({
    include: {
      supplier: true,
      lot: true,
      _count: { select: { items: true } },
    },
    orderBy: { billDate: "desc" },
  });
}

export async function getPurchaseBill(id: string) {
  return prisma.purchaseBill.findUnique({
    where: { id },
    include: {
      supplier: true,
      lot: true,
      items: {
        include: { product: true, tag: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createPurchaseBill(input: CreatePurchaseBillInput) {
  const userEmail = await getCurrentUserEmail();
  const { totalPieces, totalWeight, totalAmount } = calcTotals(input.items);

  for (const item of input.items) {
    if (item.huidNumber && input.metalType === "GOLD") {
      const huid = normalizeHuid(item.huidNumber);
      if (!validateHuid(huid)) throw new Error("Invalid HUID in line item");
    }
  }

  const bill = await prisma.purchaseBill.create({
    data: {
      billDate: input.billDate,
      supplierId: input.supplierId,
      invoiceNumber: input.invoiceNumber || null,
      metalType: input.metalType,
      totalPieces,
      totalWeight,
      totalAmount,
      paymentMode: input.paymentMode,
      status: input.status === "CONFIRMED" ? "DRAFT" : input.status,
      notes: input.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          grossWeight: item.grossWeight,
          stoneWeight: item.stoneWeight,
          netWeight: item.netWeight,
          huidNumber: item.huidNumber
            ? normalizeHuid(item.huidNumber)
            : null,
          purchaseRate: item.purchaseRate,
          amount: item.amount,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  if (input.status === "CONFIRMED") {
    await confirmPurchaseBill(bill.id);
  }

  revalidatePath("/purchase/bills");
  return prisma.purchaseBill.findUniqueOrThrow({
    where: { id: bill.id },
    include: { supplier: true, items: { include: { product: true } } },
  });
}

export async function confirmPurchaseBill(id: string) {
  const userEmail = await getCurrentUserEmail();
  const bill = await prisma.purchaseBill.findUniqueOrThrow({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (bill.status !== "DRAFT") {
    throw new Error("Only draft bills can be confirmed");
  }
  await assertDayNotLocked(bill.billDate);
  if (bill.items.length === 0) {
    throw new Error("Bill has no items");
  }

  const billNumber = await nextPurchaseBillNumber(bill.billDate);

  await prisma.$transaction(async (tx) => {
    let lotId = bill.lotId;
    if (!lotId) {
      const lotNumber = await nextLotNumber(bill.billDate);
      const lot = await tx.lot.create({
        data: {
          lotNumber,
          supplierId: bill.supplierId,
          lotDate: bill.billDate,
          metalType: bill.metalType,
          invoiceNumber: bill.invoiceNumber,
          purchaseRate:
            bill.items[0]?.purchaseRate ?? null,
          createdBy: userEmail,
          updatedBy: userEmail,
        },
      });
      lotId = lot.id;
    }

    let tagSeq = 0;
    const year = bill.billDate.getFullYear();
    const prefix = getTagPrefix(bill.metalType);
    const pattern = `${prefix}-${year}-`;
    const lastTag = await tx.tag.findFirst({
      where: { tagId: { startsWith: pattern } },
      orderBy: { tagId: "desc" },
    });
    if (lastTag) {
      const parts = lastTag.tagId.split("-");
      tagSeq = parseInt(parts[2], 10) || 0;
    }

    for (const item of bill.items) {
      tagSeq += 1;
      const tagIdStr = generateTagId(bill.metalType, year, tagSeq);

      const tag = await tx.tag.create({
        data: {
          tagId: tagIdStr,
          productId: item.productId,
          lotId,
          grossWeight: item.grossWeight,
          stoneWeight: item.stoneWeight,
          netWeight: item.netWeight,
          huidNumber: item.huidNumber,
          purchaseRate: item.purchaseRate,
          status: "RECEIVED",
          receivedDate: bill.billDate,
          notes: `From ${billNumber}`,
          createdBy: userEmail,
          updatedBy: userEmail,
        },
      });

      await tx.purchaseBillItem.update({
        where: { id: item.id },
        data: { tagId: tag.id },
      });

      await tx.stockMovement.create({
        data: {
          tagId: tag.id,
          movementType: "PURCHASE_IN",
          toLocation: "Stock",
          weight: item.netWeight,
          date: bill.billDate,
          referenceId: id,
          createdBy: userEmail,
          updatedBy: userEmail,
        },
      });
    }

    const tags = await tx.tag.findMany({ where: { lotId } });
    await tx.lot.update({
      where: { id: lotId },
      data: {
        totalPieces: tags.length,
        totalWeight: roundWeight(
          tags.reduce((s, t) => s + Number(t.netWeight), 0)
        ),
      },
    });

    await tx.purchaseBill.update({
      where: { id },
      data: {
        billNumber,
        lotId,
        status: "CONFIRMED",
        updatedBy: userEmail,
      },
    });
  });

  revalidatePath("/purchase/bills");
  revalidatePath(`/purchase/bills/${id}`);
  revalidatePath("/stock/tags");
  revalidatePath("/stock/lots");
  revalidatePath("/accounting");

  const confirmed = await prisma.purchaseBill.findUniqueOrThrow({
    where: { id },
  });
  try {
    await postPurchaseBillJournal(confirmed);
  } catch (e) {
    console.error("[slj-erp] Purchase journal posting failed:", e);
  }
}

export async function cancelPurchaseBill(id: string, reason: string) {
  const userEmail = await getCurrentUserEmail();
  const bill = await prisma.purchaseBill.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  if (bill.status === "CONFIRMED") {
    throw new Error("Confirmed purchase bills cannot be cancelled — use purchase return");
  }

  await prisma.purchaseBill.update({
    where: { id },
    data: {
      status: "CANCELLED",
      notes: `${bill.notes ? bill.notes + "\n" : ""}Cancelled: ${reason}`,
      updatedBy: userEmail,
    },
  });

  revalidatePath("/purchase/bills");
}

export async function getConfirmedPurchaseBillsForReturn() {
  return prisma.purchaseBill.findMany({
    where: { status: "CONFIRMED" },
    include: {
      supplier: true,
      items: {
        where: { tag: { status: { in: ["RECEIVED", "COUNTER_ASSIGNED"] } } },
        include: { product: true, tag: true },
      },
    },
    orderBy: { billDate: "desc" },
  });
}
