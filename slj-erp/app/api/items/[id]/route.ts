import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const item = await prisma.item.update({
    where: { id },
    data,
  });
  return NextResponse.json(item);
}
