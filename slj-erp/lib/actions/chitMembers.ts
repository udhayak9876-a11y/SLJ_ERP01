"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { generateChitMemberId } from "@/lib/utils/documentNumber";
import { updateSchemeMemberCount } from "@/lib/actions/chitSchemes";
import { assertDayNotLocked } from "@/lib/accounting/dayLock";
import { revalidatePath } from "next/cache";

async function nextMemberId(schemeCode: string, schemeId: string): Promise<string> {
  const last = await prisma.chitMember.findFirst({
    where: { schemeId },
    orderBy: { memberId: "desc" },
  });
  let seq = 0;
  if (last) {
    const parts = last.memberId.split("-");
    seq = parseInt(parts[parts.length - 1], 10) || 0;
  }
  return generateChitMemberId(schemeCode, seq + 1);
}

export async function getChitMembers(schemeId?: string) {
  return prisma.chitMember.findMany({
    where: schemeId ? { schemeId } : undefined,
    include: {
      customer: true,
      scheme: true,
      payments: { orderBy: { instalmentNumber: "asc" } },
    },
    orderBy: { memberId: "asc" },
  });
}

export async function getChitMember(id: string) {
  return prisma.chitMember.findUnique({
    where: { id },
    include: {
      customer: true,
      scheme: true,
      payments: { orderBy: { instalmentNumber: "asc" } },
    },
  });
}

export async function getMemberInstalmentStatus(memberId: string) {
  const member = await prisma.chitMember.findUniqueOrThrow({
    where: { id: memberId },
    include: {
      customer: true,
      scheme: true,
      payments: { orderBy: { instalmentNumber: "asc" } },
    },
  });

  const paidNumbers = new Set(member.payments.map((p) => p.instalmentNumber));
  const paidCount = paidNumbers.size;
  const totalInstalments = member.scheme.durationMonths;
  const remaining = totalInstalments - paidCount;
  const nextInstalment = paidCount + 1;
  const totalPaid = member.payments.reduce((s, p) => s + Number(p.amount), 0);

  const instalments = Array.from({ length: totalInstalments }, (_, i) => {
    const num = i + 1;
    const payment = member.payments.find((p) => p.instalmentNumber === num);
    return {
      number: num,
      paid: paidNumbers.has(num),
      payment,
      dueDate: getInstalmentDueDate(member.enrolmentDate, num),
    };
  });

  return {
    member,
    paidCount,
    remaining,
    nextInstalment: nextInstalment <= totalInstalments ? nextInstalment : null,
    totalPaid,
    instalments,
    isMature: paidCount >= totalInstalments,
  };
}

function getInstalmentDueDate(enrolmentDate: Date, instalmentNumber: number): Date {
  const d = new Date(enrolmentDate);
  d.setMonth(d.getMonth() + instalmentNumber - 1);
  return d;
}

export async function enrolChitMember(data: {
  schemeId: string;
  customerId: string;
  enrolmentDate: Date;
  notes?: string;
}) {
  await assertDayNotLocked(data.enrolmentDate);
  const userEmail = await getCurrentUserEmail();

  const scheme = await prisma.chitScheme.findUniqueOrThrow({
    where: { id: data.schemeId },
  });

  if (scheme.status !== "ACTIVE") {
    throw new Error("Cannot enrol in a closed scheme");
  }

  const existing = await prisma.chitMember.findFirst({
    where: {
      schemeId: data.schemeId,
      customerId: data.customerId,
      status: "ACTIVE",
    },
  });
  if (existing) {
    throw new Error("Customer already enrolled in this scheme");
  }

  const memberIdStr = await nextMemberId(scheme.schemeCode, scheme.id);
  const totalAmount =
    Number(scheme.instalmentAmount) * scheme.durationMonths;

  const member = await prisma.chitMember.create({
    data: {
      memberId: memberIdStr,
      schemeId: data.schemeId,
      customerId: data.customerId,
      enrolmentDate: data.enrolmentDate,
      totalAmount,
      notes: data.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });

  await updateSchemeMemberCount(data.schemeId);
  revalidatePath("/schemes");
  revalidatePath(`/schemes/${data.schemeId}`);
  return member;
}

export async function closeChitMember(id: string) {
  const userEmail = await getCurrentUserEmail();
  const member = await prisma.chitMember.update({
    where: { id },
    data: { status: "CLOSED", updatedBy: userEmail },
  });
  revalidatePath(`/schemes/members/${id}`);
  revalidatePath(`/schemes/${member.schemeId}`);
}

export async function markMemberDefaulted(id: string) {
  const userEmail = await getCurrentUserEmail();
  await prisma.chitMember.update({
    where: { id },
    data: { status: "DEFAULTED", updatedBy: userEmail },
  });
  revalidatePath(`/schemes/members/${id}`);
}

export async function getChitReminders(withinDays = 7) {
  const members = await prisma.chitMember.findMany({
    where: { status: "ACTIVE" },
    include: {
      customer: true,
      scheme: true,
      payments: true,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + withinDays);

  const reminders: {
    member: (typeof members)[0];
    nextInstalment: number;
    dueDate: Date;
    daysUntilDue: number;
    amount: number;
  }[] = [];

  for (const member of members) {
    const paidCount = member.payments.length;
    const nextNum = paidCount + 1;
    if (nextNum > member.scheme.durationMonths) continue;

    const dueDate = getInstalmentDueDate(member.enrolmentDate, nextNum);
    if (dueDate <= cutoff) {
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      reminders.push({
        member,
        nextInstalment: nextNum,
        dueDate,
        daysUntilDue,
        amount: Number(member.scheme.instalmentAmount),
      });
    }
  }

  return reminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export async function getOverdueReminders() {
  const all = await getChitReminders(365);
  return all.filter((r) => r.daysUntilDue < 0);
}
