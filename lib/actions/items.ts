"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Category, MakingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CODE_PREFIX: Record<Category, string> = {
  GOLD: "GOL",
  SILVER: "SIL",
  DIAMOND: "DIA",
  STONE: "STO",
  OTHER: "OTH",
};

const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.nativeEnum(Category),
  karat: z.string().optional(),
  hsnCode: z.string().min(1, "HSN code is required"),
  makingChargeType: z.nativeEnum(MakingType),
  makingChargeValue: z.number().positive("Making charge must be positive"),
  notes: z.string().optional(),
});

async function nextItemCode(category: Category): Promise<string> {
  const prefix = CODE_PREFIX[category];
  const last = await prisma.item.findFirst({
    where: { itemCode: { startsWith: `${prefix}-` } },
    orderBy: { itemCode: "desc" },
    select: { itemCode: true },
  });
  const lastNum = last ? parseInt(last.itemCode.split("-")[1], 10) : 0;
  return `${prefix}-${String(lastNum + 1).padStart(3, "0")}`;
}

export async function createItem(input: z.infer<typeof itemSchema>) {
  const data = itemSchema.parse(input);
  const itemCode = await nextItemCode(data.category);

  const item = await prisma.item.create({
    data: {
      ...data,
      karat: data.karat || null,
      notes: data.notes || null,
      itemCode,
    },
  });

  revalidatePath("/items");
  return { success: true as const, itemCode: item.itemCode };
}

export async function updateItem(
  id: string,
  input: z.infer<typeof itemSchema>
) {
  const data = itemSchema.parse(input);

  await prisma.item.update({
    where: { id },
    data: {
      ...data,
      karat: data.karat || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/items");
  return { success: true as const };
}

export async function toggleItemActive(id: string, isActive: boolean) {
  await prisma.item.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/items");
  return { success: true as const };
}
