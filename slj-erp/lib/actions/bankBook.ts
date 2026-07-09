"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBankAccounts() {
  return prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { bankName: "asc" },
  });
}

export async function createBankAccount(data: {
  bankName: string;
  accountNumber: string;
  branch?: string;
  ifsc?: string;
  openingBalance?: number;
  ledgerAccountId?: string;
}) {
  const userEmail = await getCurrentUserEmail();
  const account = await prisma.bankAccount.create({
    data: {
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      branch: data.branch || "",
      ifsc: data.ifsc || "",
      openingBalance: data.openingBalance ?? 0,
      ledgerAccountId: data.ledgerAccountId || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/accounting/bank");
  return account;
}

export async function getBankBook(bankAccountId: string, fromDate?: Date, toDate?: Date) {
  const bank = await prisma.bankAccount.findUniqueOrThrow({
    where: { id: bankAccountId },
  });

  const where: Record<string, unknown> = { bankAccountId };
  if (fromDate || toDate) {
    where.date = {};
    if (fromDate) (where.date as Record<string, Date>).gte = fromDate;
    if (toDate) (where.date as Record<string, Date>).lte = toDate;
  }

  const transactions = await prisma.bankTransaction.findMany({
    where,
    orderBy: { date: "asc" },
  });

  let running = Number(bank.openingBalance);
  const lines = transactions.map((t) => {
    running += Number(t.credit) - Number(t.debit);
    return { ...t, runningBalance: running };
  });

  return { bank, lines, closingBalance: running };
}

export async function addBankTransaction(data: {
  bankAccountId: string;
  date: Date;
  description: string;
  debit?: number;
  credit?: number;
}) {
  const userEmail = await getCurrentUserEmail();
  const existing = await prisma.bankTransaction.findMany({
    where: { bankAccountId: data.bankAccountId },
    orderBy: { date: "desc" },
    take: 1,
  });
  const bank = await prisma.bankAccount.findUniqueOrThrow({
    where: { id: data.bankAccountId },
  });
  const lastBal =
    existing.length > 0
      ? Number(existing[0].balance)
      : Number(bank.openingBalance);
  const balance =
    lastBal + (data.credit ?? 0) - (data.debit ?? 0);

  const tx = await prisma.bankTransaction.create({
    data: {
      bankAccountId: data.bankAccountId,
      date: data.date,
      description: data.description,
      debit: data.debit ?? 0,
      credit: data.credit ?? 0,
      balance,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/accounting/bank");
  return tx;
}

export async function toggleBankTransactionCleared(
  id: string,
  isCleared: boolean,
  clearedDate?: Date
) {
  const userEmail = await getCurrentUserEmail();
  await prisma.bankTransaction.update({
    where: { id },
    data: {
      isCleared,
      clearedDate: isCleared ? clearedDate ?? new Date() : null,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/accounting/bank");
}

export async function getBankReconciliation(bankAccountId: string) {
  const { bank, lines, closingBalance } = await getBankBook(bankAccountId);
  const cleared = lines.filter((l) => l.isCleared);
  const uncleared = lines.filter((l) => !l.isCleared);
  const clearedBalance = cleared.length
    ? cleared[cleared.length - 1].runningBalance
    : Number(bank.openingBalance);

  return {
    bank,
    bookBalance: closingBalance,
    clearedBalance,
    unclearedItems: uncleared,
    clearedItems: cleared,
  };
}
