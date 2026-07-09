"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { generateSchemeCode } from "@/lib/utils/documentNumber";
import { ChitSchemeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function nextSchemeCode(): Promise<string> {
  const last = await prisma.chitScheme.findFirst({
    orderBy: { schemeCode: "desc" },
  });
  let seq = 0;
  if (last) {
    seq = parseInt(last.schemeCode.replace("SCH-", ""), 10) || 0;
  }
  return generateSchemeCode(seq + 1);
}

function calcMaturityDate(startDate: Date, durationMonths: number): Date {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + durationMonths);
  return d;
}

export async function getChitSchemes(status?: ChitSchemeStatus) {
  return prisma.chitScheme.findMany({
    where: status ? { status } : undefined,
    include: { _count: { select: { members: true } } },
    orderBy: { startDate: "desc" },
  });
}

export async function getActiveChitSchemes() {
  return getChitSchemes("ACTIVE");
}

export async function getChitScheme(id: string) {
  return prisma.chitScheme.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          customer: true,
          payments: { orderBy: { instalmentNumber: "asc" } },
        },
        orderBy: { memberId: "asc" },
      },
      _count: { select: { members: true, payments: true } },
    },
  });
}

export async function createChitScheme(data: {
  schemeName: string;
  durationMonths: number;
  instalmentAmount: number;
  startDate: Date;
  bonusMonth?: number;
  notes?: string;
}) {
  const userEmail = await getCurrentUserEmail();
  const schemeCode = await nextSchemeCode();
  const maturityDate = calcMaturityDate(data.startDate, data.durationMonths);

  const scheme = await prisma.chitScheme.create({
    data: {
      schemeCode,
      schemeName: data.schemeName,
      durationMonths: data.durationMonths,
      instalmentAmount: data.instalmentAmount,
      startDate: data.startDate,
      maturityDate,
      bonusMonth: data.bonusMonth ?? null,
      notes: data.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });

  revalidatePath("/schemes");
  return scheme;
}

export async function closeChitScheme(id: string) {
  const userEmail = await getCurrentUserEmail();
  await prisma.chitScheme.update({
    where: { id },
    data: { status: "CLOSED", updatedBy: userEmail },
  });
  revalidatePath("/schemes");
  revalidatePath(`/schemes/${id}`);
}

export async function updateSchemeMemberCount(schemeId: string) {
  const count = await prisma.chitMember.count({
    where: { schemeId, status: { in: ["ACTIVE", "CLOSED"] } },
  });
  await prisma.chitScheme.update({
    where: { id: schemeId },
    data: { totalMembers: count },
  });
}
