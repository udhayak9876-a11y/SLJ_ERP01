"use server";

import { prisma } from "@/lib/prisma";
import {
  createJournalEntry,
  ensureDefaultAccounts,
  JournalLineInput,
} from "@/lib/accounting/journalService";
import { assertDayNotLocked } from "@/lib/accounting/dayLock";
import { revalidatePath } from "next/cache";

export async function getJournalEntries(fromDate?: Date, toDate?: Date) {
  await ensureDefaultAccounts();
  const where: Record<string, unknown> = {};
  if (fromDate || toDate) {
    where.entryDate = {};
    if (fromDate) (where.entryDate as Record<string, Date>).gte = fromDate;
    if (toDate) (where.entryDate as Record<string, Date>).lte = toDate;
  }

  return prisma.journalEntry.findMany({
    where,
    include: {
      lines: { include: { account: true } },
    },
    orderBy: { entryDate: "desc" },
    take: 200,
  });
}

export async function getJournalEntry(id: string) {
  return prisma.journalEntry.findUnique({
    where: { id },
    include: { lines: { include: { account: true } } },
  });
}

export async function createManualJournalEntry(input: {
  entryDate: Date;
  description: string;
  lines: JournalLineInput[];
}) {
  await assertDayNotLocked(input.entryDate);
  const entry = await createJournalEntry(input);
  revalidatePath("/accounting/journal");
  return entry;
}

export async function getGeneralLedger(
  accountId: string,
  fromDate?: Date,
  toDate?: Date
) {
  const where: {
    accountId: string;
    journal?: { entryDate?: { gte?: Date; lte?: Date } };
  } = { accountId };

  if (fromDate || toDate) {
    where.journal = { entryDate: {} };
    if (fromDate) where.journal!.entryDate!.gte = fromDate;
    if (toDate) where.journal!.entryDate!.lte = toDate;
  }

  return prisma.journalEntryLine.findMany({
    where,
    include: {
      journal: true,
      account: true,
    },
    orderBy: { journal: { entryDate: "asc" } },
  });
}
