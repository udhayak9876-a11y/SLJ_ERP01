"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { startOfToday } from "@/lib/utils/date";
import { revalidatePath } from "next/cache";

export async function getTodayRate() {
  const today = startOfToday();
  return prisma.dailyRate.findUnique({
    where: { date: today },
  });
}

export async function getRateHistory(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.dailyRate.findMany({
    where: { date: { gte: startDate } },
    orderBy: { date: "desc" },
    take: days,
  });
}

export async function saveDailyRate(data: {
  gold24kRate: number;
  gold22kRate: number;
  gold18kRate: number;
  silverRate: number;
  notes?: string;
  date?: Date;
}) {
  const email = await getCurrentUserEmail();
  const date = data.date || startOfToday();

  const rate = await prisma.dailyRate.upsert({
    where: { date },
    update: {
      gold24kRate: data.gold24kRate,
      gold22kRate: data.gold22kRate,
      gold18kRate: data.gold18kRate,
      silverRate: data.silverRate,
      notes: data.notes || null,
      enteredBy: email,
    },
    create: {
      date,
      gold24kRate: data.gold24kRate,
      gold22kRate: data.gold22kRate,
      gold18kRate: data.gold18kRate,
      silverRate: data.silverRate,
      notes: data.notes || null,
      enteredBy: email,
    },
  });

  revalidatePath("/rates");
  revalidatePath("/", "layout");
  return rate;
}
