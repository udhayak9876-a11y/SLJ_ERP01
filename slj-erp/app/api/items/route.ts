import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

const prefixMap: Record<string, string> = {
  GOLD: "GOL",
  SILVER: "SIL",
  DIAMOND: "DIA",
  STONE: "STO",
  OTHER: "OTH",
};

export async function GET() {
  const items = await prisma.item.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const data = await req.json();
  const category = data.category as Category;

  const last = await prisma.item.findFirst({
    where: { category },
    orderBy: { itemCode: "desc" },
    select: { itemCode: true },
  });

  const prev = last?.itemCode?.split("-")[1];
  const nextNumber = String((prev ? Number(prev) : 0) + 1).padStart(3, "0");
  const itemCode = `${prefixMap[category]}-${nextNumber}`;

  const created = await prisma.item.create({
    data: {
      itemCode,
      itemName: data.itemName,
      category: category as Category,
      karat: data.karat || null,
      hsnCode: data.hsnCode || "7113",
      makingChargeType: data.makingChargeType,
      makingChargeValue: Number(data.makingChargeValue),
      notes: data.notes || null,
    },
  });

  return NextResponse.json(created);
}
