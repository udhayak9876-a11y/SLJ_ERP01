import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { DEFAULT_ACCOUNTS } from "@/lib/accounting/defaultAccounts";
import {
  generateJournalNumber,
  parseDocumentSequence,
} from "@/lib/utils/documentNumber";
import { getFinancialYearDateRange } from "@/lib/utils/billNumber";
import { roundMoney } from "@/lib/utils/weight";
import {
  PaymentMode,
  ReferenceType,
} from "@prisma/client";

export async function ensureDefaultAccounts(): Promise<void> {
  const count = await prisma.ledgerAccount.count();
  if (count > 0) return;

  const userEmail = await getCurrentUserEmail();
  await prisma.ledgerAccount.createMany({
    data: DEFAULT_ACCOUNTS.map((a) => ({
      ...a,
      createdBy: userEmail,
      updatedBy: userEmail,
    })),
  });
}

export async function getAccountByCode(code: string) {
  await ensureDefaultAccounts();
  return prisma.ledgerAccount.findUnique({ where: { accountCode: code } });
}

async function nextJournalNumber(entryDate: Date): Promise<string> {
  const { start, end } = getFinancialYearDateRange(entryDate);
  const entries = await prisma.journalEntry.findMany({
    where: { entryDate: { gte: start, lte: end } },
    select: { entryNumber: true },
  });
  let maxSeq = 0;
  for (const e of entries) {
    const seq = parseDocumentSequence(e.entryNumber);
    if (seq > maxSeq) maxSeq = seq;
  }
  return generateJournalNumber(maxSeq, entryDate);
}

export interface JournalLineInput {
  accountCode: string;
  debitAmount: number;
  creditAmount: number;
  narration?: string;
  referenceType?: ReferenceType;
  referenceId?: string;
}

export async function createJournalEntry(data: {
  entryDate: Date;
  description: string;
  lines: JournalLineInput[];
}) {
  const userEmail = await getCurrentUserEmail();
  await ensureDefaultAccounts();

  const totalDebit = roundMoney(
    data.lines.reduce((s, l) => s + l.debitAmount, 0)
  );
  const totalCredit = roundMoney(
    data.lines.reduce((s, l) => s + l.creditAmount, 0)
  );

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error("Journal entry must balance (debit = credit)");
  }

  const entryNumber = await nextJournalNumber(data.entryDate);
  const accountMap = new Map(
    (
      await prisma.ledgerAccount.findMany({
        where: {
          accountCode: { in: data.lines.map((l) => l.accountCode) },
        },
      })
    ).map((a) => [a.accountCode, a.id])
  );

  for (const line of data.lines) {
    if (!accountMap.has(line.accountCode)) {
      throw new Error(`Account ${line.accountCode} not found`);
    }
  }

  return prisma.journalEntry.create({
    data: {
      entryNumber,
      entryDate: data.entryDate,
      description: data.description,
      createdBy: userEmail,
      updatedBy: userEmail,
      lines: {
        create: data.lines.map((l) => ({
          accountId: accountMap.get(l.accountCode)!,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
          narration: l.narration || null,
          referenceType: l.referenceType || null,
          referenceId: l.referenceId || null,
        })),
      },
    },
    include: { lines: { include: { account: true } } },
  });
}

export async function postSalesBillJournal(bill: {
  id: string;
  billNumber: string | null;
  billDate: Date;
  billType: string;
  paymentMode: PaymentMode;
  subtotal: number | { toString(): string };
  cgstAmount: number | { toString(): string };
  sgstAmount: number | { toString(): string };
  igstAmount: number | { toString(): string };
  totalAmount: number | { toString(): string };
  amountPaid: number | { toString(): string };
}) {
  const { ACCOUNT_CODES } = await import("@/lib/accounting/defaultAccounts");
  const subtotal = Number(bill.subtotal);
  const cgst = Number(bill.cgstAmount);
  const sgst = Number(bill.sgstAmount);
  const igst = Number(bill.igstAmount);
  const total = Number(bill.totalAmount);
  const paid = Number(bill.amountPaid);
  const credit = roundMoney(total - paid);

  const cashOrBank =
    bill.paymentMode === "CARD" || bill.paymentMode === "UPI"
      ? ACCOUNT_CODES.BANK
      : ACCOUNT_CODES.CASH;

  const lines: JournalLineInput[] = [];

  if (bill.billType === "CREDIT") {
    if (paid > 0) {
      lines.push({
        accountCode: cashOrBank,
        debitAmount: paid,
        creditAmount: 0,
        referenceType: "BILL",
        referenceId: bill.id,
      });
    }
    if (credit > 0) {
      lines.push({
        accountCode: ACCOUNT_CODES.DEBTORS,
        debitAmount: credit,
        creditAmount: 0,
        referenceType: "BILL",
        referenceId: bill.id,
        narration: "Credit portion",
      });
    }
  } else {
    lines.push({
      accountCode: cashOrBank,
      debitAmount: total,
      creditAmount: 0,
      referenceType: "BILL",
      referenceId: bill.id,
      narration: bill.billNumber ?? undefined,
    });
  }

  lines.push({
    accountCode: ACCOUNT_CODES.SALES,
    debitAmount: 0,
    creditAmount: subtotal,
    referenceType: "BILL",
    referenceId: bill.id,
  });

  if (cgst > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.CGST,
      debitAmount: 0,
      creditAmount: cgst,
      referenceType: "BILL",
      referenceId: bill.id,
    });
  }
  if (sgst > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.SGST,
      debitAmount: 0,
      creditAmount: sgst,
      referenceType: "BILL",
      referenceId: bill.id,
    });
  }
  if (igst > 0) {
    lines.push({
      accountCode: ACCOUNT_CODES.IGST,
      debitAmount: 0,
      creditAmount: igst,
      referenceType: "BILL",
      referenceId: bill.id,
    });
  }

  return createJournalEntry({
    entryDate: bill.billDate,
    description: `Sales bill ${bill.billNumber ?? bill.id}`,
    lines,
  });
}

export async function postPurchaseBillJournal(bill: {
  id: string;
  billNumber: string | null;
  billDate: Date;
  paymentMode: PaymentMode;
  totalAmount: number | { toString(): string };
}) {
  const { ACCOUNT_CODES } = await import("@/lib/accounting/defaultAccounts");
  const total = Number(bill.totalAmount);
  const creditAccount =
    bill.paymentMode === "CASH" ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.CREDITORS;

  return createJournalEntry({
    entryDate: bill.billDate,
    description: `Purchase bill ${bill.billNumber ?? bill.id}`,
    lines: [
      {
        accountCode: ACCOUNT_CODES.PURCHASES,
        debitAmount: total,
        creditAmount: 0,
        referenceType: "PURCHASE",
        referenceId: bill.id,
      },
      {
        accountCode: creditAccount,
        debitAmount: 0,
        creditAmount: total,
        referenceType: "PURCHASE",
        referenceId: bill.id,
      },
    ],
  });
}

export async function postOldMetalJournal(record: {
  id: string;
  voucherNumber: string | null;
  voucherDate: Date;
  paymentMode: PaymentMode;
  totalAmount: number | { toString(): string };
}) {
  const { ACCOUNT_CODES } = await import("@/lib/accounting/defaultAccounts");
  const total = Number(record.totalAmount);
  const creditAccount =
    record.paymentMode === "CASH" ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.BANK;

  return createJournalEntry({
    entryDate: record.voucherDate,
    description: `Old metal ${record.voucherNumber ?? record.id}`,
    lines: [
      {
        accountCode: ACCOUNT_CODES.OLD_METAL,
        debitAmount: total,
        creditAmount: 0,
        referenceType: "OLD_METAL",
        referenceId: record.id,
      },
      {
        accountCode: creditAccount,
        debitAmount: 0,
        creditAmount: total,
        referenceType: "OLD_METAL",
        referenceId: record.id,
      },
    ],
  });
}

export async function getAccountBalance(
  accountId: string,
  asOfDate?: Date
): Promise<{ debit: number; credit: number; balance: number }> {
  const account = await prisma.ledgerAccount.findUniqueOrThrow({
    where: { id: accountId },
  });

  const where: { accountId: string; journal?: { entryDate?: { lte: Date } } } =
    { accountId };
  if (asOfDate) {
    where.journal = { entryDate: { lte: asOfDate } };
  }

  const lines = await prisma.journalEntryLine.findMany({
    where,
    include: { journal: true },
  });

  const debit = lines.reduce((s, l) => s + Number(l.debitAmount), 0);
  const credit = lines.reduce((s, l) => s + Number(l.creditAmount), 0);
  const opening = Number(account.openingBalance);

  const isDebitNature = ["ASSET", "EXPENSE"].includes(account.accountGroup);
  const balance = isDebitNature
    ? opening + debit - credit
    : opening + credit - debit;

  return { debit, credit, balance };
}

export async function getTrialBalance(fromDate: Date, toDate: Date) {
  await ensureDefaultAccounts();
  const accounts = await prisma.ledgerAccount.findMany({
    where: { isActive: true },
    orderBy: { accountCode: "asc" },
  });

  const rows = await Promise.all(
    accounts.map(async (account) => {
      const openingLines = await prisma.journalEntryLine.findMany({
        where: {
          accountId: account.id,
          journal: { entryDate: { lt: fromDate } },
        },
      });
      const periodLines = await prisma.journalEntryLine.findMany({
        where: {
          accountId: account.id,
          journal: { entryDate: { gte: fromDate, lte: toDate } },
        },
      });

      const openingDebit = openingLines.reduce(
        (s, l) => s + Number(l.debitAmount),
        0
      );
      const openingCredit = openingLines.reduce(
        (s, l) => s + Number(l.creditAmount),
        0
      );
      const periodDebit = periodLines.reduce(
        (s, l) => s + Number(l.debitAmount),
        0
      );
      const periodCredit = periodLines.reduce(
        (s, l) => s + Number(l.creditAmount),
        0
      );

      const ob = Number(account.openingBalance);
      const isDebitNature = ["ASSET", "EXPENSE"].includes(account.accountGroup);
      const openingBal = isDebitNature
        ? ob + openingDebit - openingCredit
        : ob + openingCredit - openingDebit;
      const closingBal = isDebitNature
        ? openingBal + periodDebit - periodCredit
        : openingBal + periodCredit - periodDebit;

      return {
        account,
        openingDebit: isDebitNature && openingBal >= 0 ? openingBal : 0,
        openingCredit: !isDebitNature && openingBal >= 0 ? openingBal : 0,
        periodDebit,
        periodCredit,
        closingDebit: isDebitNature && closingBal >= 0 ? closingBal : 0,
        closingCredit: !isDebitNature && closingBal >= 0 ? closingBal : 0,
      };
    })
  );

  return rows.filter(
    (r) =>
      r.periodDebit > 0 ||
      r.periodCredit > 0 ||
      r.openingDebit > 0 ||
      r.openingCredit > 0
  );
}
