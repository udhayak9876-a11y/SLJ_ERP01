-- Phase 4: Accounting module

CREATE TYPE "AccountGroup" AS ENUM ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY');
CREATE TYPE "ReferenceType" AS ENUM ('BILL', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'JOURNAL', 'VOUCHER', 'OLD_METAL', 'DAY_END');
CREATE TYPE "VoucherType" AS ENUM ('RECEIPT', 'PAYMENT', 'JOURNAL', 'ISSUE');

CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountGroup" "AccountGroup" NOT NULL,
    "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debitAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "narration" TEXT,
    "referenceType" "ReferenceType",
    "referenceId" TEXT,
    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT '',
    "ifsc" TEXT NOT NULL DEFAULT '',
    "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ledgerAccountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "debit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "referenceType" "ReferenceType",
    "referenceId" TEXT,
    "isCleared" BOOLEAN NOT NULL DEFAULT false,
    "clearedDate" DATE,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "VoucherType" NOT NULL,
    "partyName" TEXT NOT NULL DEFAULT '',
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "narration" TEXT,
    "journalEntryId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DayEnd" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "openingCash" DECIMAL(12,2) NOT NULL,
    "totalSales" DECIMAL(12,2) NOT NULL,
    "totalPurchases" DECIMAL(12,2) NOT NULL,
    "totalChitCollection" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalExpenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "closingCash" DECIMAL(12,2) NOT NULL,
    "isDayLocked" BOOLEAN NOT NULL DEFAULT true,
    "lockedBy" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayEndReport" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DayEnd_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LedgerAccount_accountCode_key" ON "LedgerAccount"("accountCode");
CREATE INDEX "LedgerAccount_accountGroup_idx" ON "LedgerAccount"("accountGroup");

CREATE UNIQUE INDEX "JournalEntry_entryNumber_key" ON "JournalEntry"("entryNumber");
CREATE INDEX "JournalEntry_entryDate_idx" ON "JournalEntry"("entryDate");

CREATE INDEX "JournalEntryLine_journalId_idx" ON "JournalEntryLine"("journalId");
CREATE INDEX "JournalEntryLine_accountId_idx" ON "JournalEntryLine"("accountId");

CREATE INDEX "BankAccount_bankName_idx" ON "BankAccount"("bankName");
CREATE INDEX "BankTransaction_bankAccountId_idx" ON "BankTransaction"("bankAccountId");
CREATE INDEX "BankTransaction_date_idx" ON "BankTransaction"("date");

CREATE UNIQUE INDEX "Voucher_voucherNumber_key" ON "Voucher"("voucherNumber");
CREATE UNIQUE INDEX "Voucher_journalEntryId_key" ON "Voucher"("journalEntryId");
CREATE INDEX "Voucher_date_idx" ON "Voucher"("date");

CREATE UNIQUE INDEX "DayEnd_date_key" ON "DayEnd"("date");
CREATE INDEX "DayEnd_date_idx" ON "DayEnd"("date");

ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_ledgerAccountId_fkey" FOREIGN KEY ("ledgerAccountId") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LedgerAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntryLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Voucher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DayEnd" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_ledger" ON "LedgerAccount" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_journal" ON "JournalEntry" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_journalline" ON "JournalEntryLine" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_bankaccount" ON "BankAccount" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_banktx" ON "BankTransaction" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_voucher" ON "Voucher" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_dayend" ON "DayEnd" FOR ALL TO authenticated USING (true) WITH CHECK (true);
