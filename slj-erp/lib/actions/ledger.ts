"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { ensureDefaultAccounts } from "@/lib/accounting/journalService";
import { AccountGroup } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getLedgerAccounts() {
  await ensureDefaultAccounts();
  return prisma.ledgerAccount.findMany({
    orderBy: { accountCode: "asc" },
  });
}

export async function createLedgerAccount(data: {
  accountCode: string;
  accountName: string;
  accountGroup: AccountGroup;
  openingBalance?: number;
}) {
  const userEmail = await getCurrentUserEmail();
  const account = await prisma.ledgerAccount.create({
    data: {
      accountCode: data.accountCode,
      accountName: data.accountName,
      accountGroup: data.accountGroup,
      openingBalance: data.openingBalance ?? 0,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/accounting/accounts");
  return account;
}

export async function toggleLedgerAccountActive(id: string, isActive: boolean) {
  const userEmail = await getCurrentUserEmail();
  await prisma.ledgerAccount.update({
    where: { id },
    data: { isActive, updatedBy: userEmail },
  });
  revalidatePath("/accounting/accounts");
}

export async function getLedgerAccount(id: string) {
  return prisma.ledgerAccount.findUnique({
    where: { id },
    include: {
      journalLines: {
        include: { journal: true },
        orderBy: { journal: { entryDate: "desc" } },
        take: 50,
      },
    },
  });
}
