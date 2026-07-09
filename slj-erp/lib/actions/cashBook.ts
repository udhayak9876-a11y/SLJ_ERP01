"use server";

import { prisma } from "@/lib/prisma";
import { ensureDefaultAccounts, getAccountByCode } from "@/lib/accounting/journalService";
import { ACCOUNT_CODES } from "@/lib/accounting/defaultAccounts";

export async function getCashBook(fromDate: Date, toDate: Date) {
  await ensureDefaultAccounts();
  const cashAccount = await getAccountByCode(ACCOUNT_CODES.CASH);
  if (!cashAccount) return { opening: 0, lines: [], closing: 0 };

  const priorLines = await prisma.journalEntryLine.findMany({
    where: {
      accountId: cashAccount.id,
      journal: { entryDate: { lt: fromDate } },
    },
  });

  const opening =
    Number(cashAccount.openingBalance) +
    priorLines.reduce(
      (s, l) => s + Number(l.debitAmount) - Number(l.creditAmount),
      0
    );

  const lines = await prisma.journalEntryLine.findMany({
    where: {
      accountId: cashAccount.id,
      journal: { entryDate: { gte: fromDate, lte: toDate } },
    },
    include: { journal: true },
    orderBy: { journal: { entryDate: "asc" } },
  });

  let running = opening;
  const entries = lines.map((l) => {
    const debit = Number(l.debitAmount);
    const credit = Number(l.creditAmount);
    running += debit - credit;
    return {
      date: l.journal.entryDate,
      description: l.narration || l.journal.description,
      entryNumber: l.journal.entryNumber,
      debit,
      credit,
      balance: running,
    };
  });

  return { opening, lines: entries, closing: running };
}
