"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import {
  categoryToMetalType,
  generateTagId,
  getTagPrefix,
} from "@/lib/utils/documentNumber";
import { normalizeHuid, validateHuid } from "@/lib/utils/huid";
import { roundWeight } from "@/lib/utils/weight";
import { updateLotTotals } from "@/lib/actions/lots";
import {
  MetalType,
  StockMovementType,
  TagStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

async function nextTagId(metalType: MetalType, receivedDate: Date): Promise<string> {
  const year = receivedDate.getFullYear();
  const prefix = getTagPrefix(metalType);
  const pattern = `${prefix}-${year}-`;
  const last = await prisma.tag.findFirst({
    where: { tagId: { startsWith: pattern } },
    orderBy: { tagId: "desc" },
  });
  let seq = 0;
  if (last) {
    const parts = last.tagId.split("-");
    seq = parseInt(parts[2], 10) || 0;
  }
  return generateTagId(metalType, year, seq + 1);
}

async function logMovement(data: {
  tagId: string;
  movementType: StockMovementType;
  fromLocation?: string;
  toLocation?: string;
  weight: number;
  date: Date;
  referenceId?: string;
  userEmail: string;
}) {
  await prisma.stockMovement.create({
    data: {
      tagId: data.tagId,
      movementType: data.movementType,
      fromLocation: data.fromLocation || null,
      toLocation: data.toLocation || null,
      weight: data.weight,
      date: data.date,
      referenceId: data.referenceId || null,
      createdBy: data.userEmail,
      updatedBy: data.userEmail,
    },
  });
}

export interface TagFilters {
  search?: string;
  status?: TagStatus | "ALL";
  counterId?: string;
  lotId?: string;
  missingHuid?: boolean;
}

export async function getTags(filters: TagFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters.counterId) {
    where.counterId = filters.counterId;
  }
  if (filters.lotId) {
    where.lotId = filters.lotId;
  }
  if (filters.missingHuid) {
    where.huidNumber = null;
    where.product = { category: "GOLD" };
  }
  if (filters.search) {
    where.OR = [
      { tagId: { contains: filters.search, mode: "insensitive" } },
      { huidNumber: { contains: filters.search, mode: "insensitive" } },
      { product: { itemName: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  return prisma.tag.findMany({
    where,
    include: {
      product: true,
      counter: true,
      lot: true,
    },
    orderBy: { tagId: "desc" },
  });
}

export async function getTag(id: string) {
  return prisma.tag.findUnique({
    where: { id },
    include: {
      product: true,
      counter: true,
      lot: { include: { supplier: true } },
      movements: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getTagByTagId(tagId: string) {
  return prisma.tag.findUnique({
    where: { tagId },
    include: { product: true, counter: true, lot: true },
  });
}

export async function createTag(data: {
  productId: string;
  lotId?: string;
  grossWeight: number;
  stoneWeight: number;
  stoneCount?: number;
  stoneDescription?: string;
  huidNumber?: string;
  purchaseRate?: number;
  mrp?: number;
  receivedDate: Date;
  notes?: string;
  counterId?: string;
}) {
  const userEmail = await getCurrentUserEmail();
  const product = await prisma.item.findUniqueOrThrow({
    where: { id: data.productId },
  });

  const metalType = categoryToMetalType(product.category);
  const netWeight = roundWeight(data.grossWeight - data.stoneWeight);

  if (metalType === "GOLD" && data.huidNumber) {
    const huid = normalizeHuid(data.huidNumber);
    if (!validateHuid(huid)) {
      throw new Error("Invalid HUID format");
    }
    data.huidNumber = huid;
  }

  const tagIdStr = await nextTagId(metalType, data.receivedDate);
  const hasCounter = !!data.counterId;
  const status: TagStatus = hasCounter ? "COUNTER_ASSIGNED" : "RECEIVED";

  const tag = await prisma.tag.create({
    data: {
      tagId: tagIdStr,
      productId: data.productId,
      lotId: data.lotId || null,
      counterId: data.counterId || null,
      grossWeight: data.grossWeight,
      stoneWeight: data.stoneWeight,
      netWeight,
      stoneCount: data.stoneCount ?? 0,
      stoneDescription: data.stoneDescription || null,
      huidNumber: data.huidNumber || null,
      purchaseRate: data.purchaseRate ?? null,
      mrp: data.mrp ?? null,
      status,
      receivedDate: data.receivedDate,
      notes: data.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });

  await logMovement({
    tagId: tag.id,
    movementType: "PURCHASE_IN",
    toLocation: hasCounter ? "Counter" : "Stock",
    weight: netWeight,
    date: data.receivedDate,
    referenceId: data.lotId,
    userEmail,
  });

  if (hasCounter && data.counterId) {
    const counter = await prisma.counter.findUniqueOrThrow({
      where: { id: data.counterId },
    });
    await logMovement({
      tagId: tag.id,
      movementType: "COUNTER_TRANSFER",
      fromLocation: "Stock",
      toLocation: counter.counterName,
      weight: netWeight,
      date: data.receivedDate,
      userEmail,
    });
  }

  if (data.lotId) {
    await updateLotTotals(data.lotId);
  }

  revalidatePath("/stock/tags");
  if (data.lotId) revalidatePath(`/stock/lots/${data.lotId}`);
  return tag;
}

export async function updateTag(
  id: string,
  data: {
    grossWeight: number;
    stoneWeight: number;
    stoneCount?: number;
    stoneDescription?: string;
    huidNumber?: string;
    purchaseRate?: number;
    mrp?: number;
    notes?: string;
  }
) {
  const userEmail = await getCurrentUserEmail();
  const existing = await prisma.tag.findUniqueOrThrow({
    where: { id },
    include: { product: true },
  });

  if (existing.status === "SOLD") {
    throw new Error("Cannot edit a sold tag");
  }

  const metalType = categoryToMetalType(existing.product.category);
  let huidNumber = data.huidNumber || null;
  if (huidNumber) {
    huidNumber = normalizeHuid(huidNumber);
    if (metalType === "GOLD" && !validateHuid(huidNumber)) {
      throw new Error("Invalid HUID format");
    }
  }

  const netWeight = roundWeight(data.grossWeight - data.stoneWeight);

  const tag = await prisma.tag.update({
    where: { id },
    data: {
      grossWeight: data.grossWeight,
      stoneWeight: data.stoneWeight,
      netWeight,
      stoneCount: data.stoneCount ?? 0,
      stoneDescription: data.stoneDescription || null,
      huidNumber,
      purchaseRate: data.purchaseRate ?? null,
      mrp: data.mrp ?? null,
      notes: data.notes || null,
      updatedBy: userEmail,
    },
  });

  if (existing.lotId) {
    await updateLotTotals(existing.lotId);
  }

  revalidatePath("/stock/tags");
  revalidatePath(`/stock/tags/${id}`);
  return tag;
}

export async function assignTagToCounter(
  tagId: string,
  counterId: string,
  reason?: string
) {
  const userEmail = await getCurrentUserEmail();
  const tag = await prisma.tag.findUniqueOrThrow({
    where: { id: tagId },
    include: { counter: true, product: true },
  });

  if (tag.status === "SOLD") {
    throw new Error("Cannot assign a sold tag");
  }

  const counter = await prisma.counter.findUniqueOrThrow({
    where: { id: counterId },
  });

  const fromLocation = tag.counter?.counterName || "Stock";

  await prisma.tag.update({
    where: { id: tagId },
    data: {
      counterId,
      status: "COUNTER_ASSIGNED",
      updatedBy: userEmail,
      notes: reason
        ? `${tag.notes ? tag.notes + "\n" : ""}Assigned: ${reason}`
        : tag.notes,
    },
  });

  await logMovement({
    tagId,
    movementType: "COUNTER_TRANSFER",
    fromLocation,
    toLocation: counter.counterName,
    weight: Number(tag.netWeight),
    date: new Date(),
    userEmail,
  });

  revalidatePath("/stock/tags");
  revalidatePath(`/stock/tags/${tagId}`);
  revalidatePath("/stock/counters");
}

export async function transferTagBetweenCounters(
  tagId: string,
  toCounterId: string,
  reason: string
) {
  const userEmail = await getCurrentUserEmail();
  const tag = await prisma.tag.findUniqueOrThrow({
    where: { id: tagId },
    include: { counter: true },
  });

  if (tag.status === "SOLD") {
    throw new Error("Cannot transfer a sold tag");
  }

  const toCounter = await prisma.counter.findUniqueOrThrow({
    where: { id: toCounterId },
  });

  const fromLocation = tag.counter?.counterName || "Unassigned";

  await prisma.tag.update({
    where: { id: tagId },
    data: {
      counterId: toCounterId,
      status: "COUNTER_ASSIGNED",
      updatedBy: userEmail,
      notes: `${tag.notes ? tag.notes + "\n" : ""}Transfer: ${reason}`,
    },
  });

  await logMovement({
    tagId,
    movementType: "COUNTER_TRANSFER",
    fromLocation,
    toLocation: toCounter.counterName,
    weight: Number(tag.netWeight),
    date: new Date(),
    referenceId: reason,
    userEmail,
  });

  revalidatePath("/stock/tags");
  revalidatePath(`/stock/tags/${tagId}`);
  revalidatePath("/stock/counters");
}

export async function getHuidReport() {
  const goldTags = await prisma.tag.findMany({
    where: {
      product: { category: "GOLD" },
      status: { in: ["RECEIVED", "COUNTER_ASSIGNED"] },
    },
    include: { product: true, lot: true, counter: true },
    orderBy: { tagId: "asc" },
  });

  const withHuid = goldTags.filter((t) => t.huidNumber);
  const withoutHuid = goldTags.filter((t) => !t.huidNumber);

  return { withHuid, withoutHuid, total: goldTags.length };
}

export async function getTagStatusReport() {
  const tags = await prisma.tag.groupBy({
    by: ["status"],
    _count: { id: true },
    _sum: { netWeight: true },
  });
  return tags.map((t) => ({
    status: t.status,
    count: t._count.id,
    weight: Number(t._sum.netWeight ?? 0),
  }));
}
