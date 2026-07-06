"use server";

import { prisma } from "@/lib/prisma";
import { Category, MakingType } from "@prisma/client";
import { revalidatePath } from "next/cache";

const CATEGORY_PREFIX: Record<Category, string> = {
  GOLD: "GOL",
  SILVER: "SIL",
  DIAMOND: "DIA",
  STONE: "STO",
  OTHER: "OTH",
};

async function generateItemCode(category: Category): Promise<string> {
  const prefix = CATEGORY_PREFIX[category];
  const lastItem = await prisma.item.findFirst({
    where: { itemCode: { startsWith: `${prefix}-` } },
    orderBy: { itemCode: "desc" },
  });

  let nextNum = 1;
  if (lastItem) {
    const parts = lastItem.itemCode.split("-");
    nextNum = (parseInt(parts[1], 10) || 0) + 1;
  }

  return `${prefix}-${nextNum.toString().padStart(3, "0")}`;
}

export async function getItems() {
  return prisma.item.findMany({
    orderBy: { itemCode: "asc" },
  });
}

export async function getActiveItems() {
  return prisma.item.findMany({
    where: { isActive: true },
    orderBy: { itemCode: "asc" },
  });
}

export async function getItem(id: string) {
  return prisma.item.findUnique({ where: { id } });
}

export async function createItem(data: {
  itemName: string;
  category: Category;
  karat?: string;
  hsnCode: string;
  makingChargeType: MakingType;
  makingChargeValue: number;
  notes?: string;
}) {
  const itemCode = await generateItemCode(data.category);
  const item = await prisma.item.create({
    data: {
      itemCode,
      itemName: data.itemName,
      category: data.category,
      karat: data.karat || null,
      hsnCode: data.hsnCode,
      makingChargeType: data.makingChargeType,
      makingChargeValue: data.makingChargeValue,
      notes: data.notes || null,
    },
  });
  revalidatePath("/items");
  return item;
}

export async function updateItem(
  id: string,
  data: {
    itemName: string;
    category: Category;
    karat?: string;
    hsnCode: string;
    makingChargeType: MakingType;
    makingChargeValue: number;
    notes?: string;
  }
) {
  const item = await prisma.item.update({
    where: { id },
    data: {
      itemName: data.itemName,
      category: data.category,
      karat: data.karat || null,
      hsnCode: data.hsnCode,
      makingChargeType: data.makingChargeType,
      makingChargeValue: data.makingChargeValue,
      notes: data.notes || null,
    },
  });
  revalidatePath("/items");
  return item;
}

export async function toggleItemActive(id: string, isActive: boolean) {
  await prisma.item.update({ where: { id }, data: { isActive } });
  revalidatePath("/items");
}
