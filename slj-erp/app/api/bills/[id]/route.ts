import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await prisma.salesBill.findUnique({
    where: { id },
    include: { items: { include: { item: true } }, customer: true },
  });
  return NextResponse.json(bill);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const bill = await prisma.salesBill.update({ where: { id }, data });
  return NextResponse.json(bill);
}
