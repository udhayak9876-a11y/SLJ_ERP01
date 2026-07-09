"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { generateCounterCode } from "@/lib/utils/documentNumber";
import { MetalType } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function nextCounterCode(): Promise<string> {
  const last = await prisma.counter.findFirst({
    orderBy: { counterCode: "desc" },
  });
  let seq = 0;
  if (last) {
    const parts = last.counterCode.split("-");
    seq = parseInt(parts[1], 10) || 0;
  }
  return generateCounterCode(seq + 1);
}

export async function getCounters() {
  return prisma.counter.findMany({ orderBy: { counterCode: "asc" } });
}

export async function getActiveCounters(metalType?: MetalType) {
  return prisma.counter.findMany({
    where: {
      isActive: true,
      ...(metalType ? { metalType } : {}),
    },
    orderBy: { counterCode: "asc" },
  });
}

export async function getCounter(id: string) {
  return prisma.counter.findUnique({
    where: { id },
    include: {
      tags: {
        where: { status: { in: ["RECEIVED", "COUNTER_ASSIGNED"] } },
        include: { product: true },
      },
    },
  });
}

export async function createCounter(data: {
  counterName: string;
  location: string;
  metalType: MetalType;
}) {
  const userEmail = await getCurrentUserEmail();
  const counterCode = await nextCounterCode();
  const counter = await prisma.counter.create({
    data: {
      counterCode,
      counterName: data.counterName,
      location: data.location,
      metalType: data.metalType,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/stock/counters");
  return counter;
}

export async function updateCounter(
  id: string,
  data: {
    counterName: string;
    location: string;
    metalType: MetalType;
  }
) {
  const userEmail = await getCurrentUserEmail();
  const counter = await prisma.counter.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/stock/counters");
  return counter;
}

export async function toggleCounterActive(id: string, isActive: boolean) {
  const userEmail = await getCurrentUserEmail();
  await prisma.counter.update({
    where: { id },
    data: { isActive, updatedBy: userEmail },
  });
  revalidatePath("/stock/counters");
}

export async function getCounterStockReport() {
  const counters = await prisma.counter.findMany({
    where: { isActive: true },
    include: {
      tags: {
        where: { status: { in: ["RECEIVED", "COUNTER_ASSIGNED"] } },
        include: { product: true },
      },
    },
    orderBy: { counterCode: "asc" },
  });

  return counters.map((counter) => {
    const pieces = counter.tags.length;
    const weight = counter.tags.reduce(
      (sum, t) => sum + Number(t.netWeight),
      0
    );
    const value = counter.tags.reduce((sum, t) => {
      const rate = Number(t.purchaseRate ?? t.mrp ?? 0);
      return sum + Number(t.netWeight) * rate;
    }, 0);
    return {
      counter,
      pieces,
      weight,
      value,
    };
  });
}
