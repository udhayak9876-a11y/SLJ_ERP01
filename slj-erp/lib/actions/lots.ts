"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { generateLotNumber } from "@/lib/utils/documentNumber";
import { roundWeight } from "@/lib/utils/weight";
import { LotStatus, MetalType } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

export async function getLots() {
  return prisma.lot.findMany({
    include: {
      supplier: true,
      _count: { select: { tags: true } },
    },
    orderBy: { lotDate: "desc" },
  });
}

export async function getLot(id: string) {
  return prisma.lot.findUnique({
    where: { id },
    include: {
      supplier: true,
      tags: {
        include: { product: true, counter: true },
        orderBy: { tagId: "asc" },
      },
    },
  });
}

export async function getOpenLots() {
  return prisma.lot.findMany({
    where: { status: "OPEN" },
    orderBy: { lotDate: "desc" },
  });
}

export async function createLot(data: {
  lotDate: Date;
  supplierId?: string;
  metalType: MetalType;
  invoiceNumber?: string;
  purchaseRate?: number;
  notes?: string;
}) {
  const userEmail = await getCurrentUserEmail();
  const lotNumber = await nextLotNumber(data.lotDate);
  const lot = await prisma.lot.create({
    data: {
      lotNumber,
      lotDate: data.lotDate,
      supplierId: data.supplierId || null,
      metalType: data.metalType,
      invoiceNumber: data.invoiceNumber || null,
      purchaseRate: data.purchaseRate ?? null,
      notes: data.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/stock/lots");
  return lot;
}

export async function closeLot(id: string) {
  const userEmail = await getCurrentUserEmail();
  await prisma.lot.update({
    where: { id },
    data: { status: "CLOSED" as LotStatus, updatedBy: userEmail },
  });
  revalidatePath("/stock/lots");
  revalidatePath(`/stock/lots/${id}`);
}

export async function updateLotTotals(lotId: string) {
  const tags = await prisma.tag.findMany({ where: { lotId } });
  const totalPieces = tags.length;
  const totalWeight = roundWeight(
    tags.reduce((sum, t) => sum + Number(t.netWeight), 0)
  );
  await prisma.lot.update({
    where: { id: lotId },
    data: { totalPieces, totalWeight },
  });
}

export async function getLotWiseStockReport() {
  const lots = await prisma.lot.findMany({
    include: {
      supplier: true,
      tags: {
        where: { status: { in: ["RECEIVED", "COUNTER_ASSIGNED"] } },
      },
    },
    orderBy: { lotDate: "desc" },
  });

  return lots.map((lot) => ({
    lot,
    activePieces: lot.tags.length,
    activeWeight: lot.tags.reduce((s, t) => s + Number(t.netWeight), 0),
  }));
}
