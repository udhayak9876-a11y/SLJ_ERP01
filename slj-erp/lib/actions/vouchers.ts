"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { createJournalEntry } from "@/lib/accounting/journalService";
import { ACCOUNT_CODES } from "@/lib/accounting/defaultAccounts";
import { assertDayNotLocked } from "@/lib/accounting/dayLock";
import {
  generateVoucherNumber,
  parseDocumentSequence,
} from "@/lib/utils/documentNumber";
import { getFinancialYearDateRange } from "@/lib/utils/billNumber";
import { PaymentMode, VoucherType } from "@prisma/client";
import { revalidatePath } from "next/cache";

const VOUCHER_PREFIX: Record<VoucherType, string> = {
  RECEIPT: "RCV",
  PAYMENT: "PAY",
  JOURNAL: "JNL",
  ISSUE: "ISS",
};

async function nextVoucherNumber(type: VoucherType, date: Date) {
  const prefix = VOUCHER_PREFIX[type];
  const { start, end } = getFinancialYearDateRange(date);
  const existing = await prisma.voucher.findMany({
    where: {
      date: { gte: start, lte: end },
      voucherNumber: { startsWith: `${prefix}/` },
    },
    select: { voucherNumber: true },
  });
  let maxSeq = 0;
  for (const v of existing) {
    const seq = parseDocumentSequence(v.voucherNumber);
    if (seq > maxSeq) maxSeq = seq;
  }
  return generateVoucherNumber(prefix, maxSeq, date);
}

export async function getVouchers(type?: VoucherType) {
  return prisma.voucher.findMany({
    where: type ? { type } : undefined,
    include: { journalEntry: true },
    orderBy: { date: "desc" },
    take: 100,
  });
}

export async function getVoucher(id: string) {
  return prisma.voucher.findUnique({
    where: { id },
    include: {
      journalEntry: { include: { lines: { include: { account: true } } } },
    },
  });
}

export async function createVoucher(input: {
  date: Date;
  type: VoucherType;
  partyName: string;
  amount: number;
  paymentMode: PaymentMode;
  narration?: string;
  debitAccountCode?: string;
  creditAccountCode?: string;
}) {
  await assertDayNotLocked(input.date);
  const userEmail = await getCurrentUserEmail();
  const voucherNumber = await nextVoucherNumber(input.type, input.date);

  let debitCode = input.debitAccountCode;
  let creditCode = input.creditAccountCode;

  if (input.type === "RECEIPT") {
    debitCode =
      input.paymentMode === "CASH" ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.BANK;
    creditCode = creditCode ?? ACCOUNT_CODES.DEBTORS;
  } else if (input.type === "PAYMENT") {
    debitCode = debitCode ?? ACCOUNT_CODES.CREDITORS;
    creditCode =
      input.paymentMode === "CASH" ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.BANK;
  } else if (input.type === "JOURNAL") {
    if (!debitCode || !creditCode) {
      throw new Error("Journal voucher requires debit and credit accounts");
    }
  }

  const journal = await createJournalEntry({
    entryDate: input.date,
    description: `${input.type} voucher — ${input.partyName}`,
    lines: [
      {
        accountCode: debitCode!,
        debitAmount: input.amount,
        creditAmount: 0,
        referenceType: "VOUCHER",
        narration: input.narration,
      },
      {
        accountCode: creditCode!,
        debitAmount: 0,
        creditAmount: input.amount,
        referenceType: "VOUCHER",
        narration: input.narration,
      },
    ],
  });

  const voucher = await prisma.voucher.create({
    data: {
      voucherNumber,
      date: input.date,
      type: input.type,
      partyName: input.partyName,
      amount: input.amount,
      paymentMode: input.paymentMode,
      narration: input.narration || null,
      journalEntryId: journal.id,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });

  revalidatePath("/accounting/vouchers");
  return voucher;
}
