import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET() {
  const today = startOfDay(new Date());
  const todayRate = await prisma.dailyRate.findFirst({ where: { date: today } });
  const history = await prisma.dailyRate.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json({ todayRate, history });
}

export async function POST(req: Request) {
  const data = await req.json();
  const date = startOfDay(new Date());

  const saved = await prisma.dailyRate.upsert({
    where: { date },
    create: {
      date,
      gold24kRate: Number(data.gold24kRate),
      gold22kRate: Number(data.gold22kRate),
      gold18kRate: Number(data.gold18kRate),
      silverRate: Number(data.silverRate),
      enteredBy: data.enteredBy,
      notes: data.notes || null,
    },
    update: {
      gold24kRate: Number(data.gold24kRate),
      gold22kRate: Number(data.gold22kRate),
      gold18kRate: Number(data.gold18kRate),
      silverRate: Number(data.silverRate),
      enteredBy: data.enteredBy,
      notes: data.notes || null,
    },
  });

  return NextResponse.json(saved);
}
