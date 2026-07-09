-- Phase 5: Gold Saving Scheme (Chit Fund) — no karigar/repair

CREATE TYPE "ChitSchemeStatus" AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE "ChitMemberStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DEFAULTED');

CREATE TABLE "ChitScheme" (
    "id" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "instalmentAmount" DECIMAL(10,2) NOT NULL,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATE NOT NULL,
    "maturityDate" DATE NOT NULL,
    "bonusMonth" INTEGER,
    "status" "ChitSchemeStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChitScheme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChitMember" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "enrolmentDate" DATE NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "ChitMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChitMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChitPayment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "paymentDate" DATE NOT NULL,
    "instalmentNumber" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "collectedBy" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChitPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChitScheme_schemeCode_key" ON "ChitScheme"("schemeCode");
CREATE INDEX "ChitScheme_status_idx" ON "ChitScheme"("status");

CREATE UNIQUE INDEX "ChitMember_memberId_key" ON "ChitMember"("memberId");
CREATE INDEX "ChitMember_schemeId_idx" ON "ChitMember"("schemeId");
CREATE INDEX "ChitMember_customerId_idx" ON "ChitMember"("customerId");
CREATE INDEX "ChitMember_status_idx" ON "ChitMember"("status");

CREATE UNIQUE INDEX "ChitPayment_receiptNumber_key" ON "ChitPayment"("receiptNumber");
CREATE INDEX "ChitPayment_memberId_idx" ON "ChitPayment"("memberId");
CREATE INDEX "ChitPayment_schemeId_idx" ON "ChitPayment"("schemeId");
CREATE INDEX "ChitPayment_paymentDate_idx" ON "ChitPayment"("paymentDate");

ALTER TABLE "ChitMember" ADD CONSTRAINT "ChitMember_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "ChitScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChitMember" ADD CONSTRAINT "ChitMember_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChitPayment" ADD CONSTRAINT "ChitPayment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ChitMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChitPayment" ADD CONSTRAINT "ChitPayment_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "ChitScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChitScheme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChitMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChitPayment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_chitscheme" ON "ChitScheme" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_chitmember" ON "ChitMember" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_chitpayment" ON "ChitPayment" FOR ALL TO authenticated USING (true) WITH CHECK (true);
