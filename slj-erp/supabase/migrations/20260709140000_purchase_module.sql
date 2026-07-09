-- Phase 3: Purchase module

CREATE TABLE "PurchaseBill" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT,
    "billDate" DATE NOT NULL,
    "supplierId" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "metalType" "MetalType" NOT NULL,
    "lotId" TEXT,
    "totalPieces" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseBill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseBillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "tagId" TEXT,
    "productId" TEXT NOT NULL,
    "grossWeight" DECIMAL(10,3) NOT NULL,
    "stoneWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "netWeight" DECIMAL(10,3) NOT NULL,
    "huidNumber" TEXT,
    "purchaseRate" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PurchaseBillItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OldMetalPurchase" (
    "id" TEXT NOT NULL,
    "voucherNumber" TEXT,
    "voucherDate" DATE NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "metalType" "MetalType" NOT NULL,
    "karat" TEXT,
    "itemDescription" TEXT NOT NULL,
    "grossWeight" DECIMAL(10,3) NOT NULL,
    "stoneWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "netWeight" DECIMAL(10,3) NOT NULL,
    "purity" DECIMAL(5,2) NOT NULL,
    "ratePerGram" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OldMetalPurchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseReturn" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT,
    "originalBillId" TEXT NOT NULL,
    "returnDate" DATE NOT NULL,
    "supplierId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseReturn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseReturnItem" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PurchaseReturnItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PurchaseBill_billNumber_key" ON "PurchaseBill"("billNumber");
CREATE UNIQUE INDEX "PurchaseBill_lotId_key" ON "PurchaseBill"("lotId");
CREATE INDEX "PurchaseBill_supplierId_idx" ON "PurchaseBill"("supplierId");
CREATE INDEX "PurchaseBill_billDate_idx" ON "PurchaseBill"("billDate");
CREATE INDEX "PurchaseBill_status_idx" ON "PurchaseBill"("status");

CREATE UNIQUE INDEX "PurchaseBillItem_tagId_key" ON "PurchaseBillItem"("tagId");
CREATE INDEX "PurchaseBillItem_billId_idx" ON "PurchaseBillItem"("billId");
CREATE INDEX "PurchaseBillItem_productId_idx" ON "PurchaseBillItem"("productId");

CREATE UNIQUE INDEX "OldMetalPurchase_voucherNumber_key" ON "OldMetalPurchase"("voucherNumber");
CREATE INDEX "OldMetalPurchase_voucherDate_idx" ON "OldMetalPurchase"("voucherDate");
CREATE INDEX "OldMetalPurchase_customerId_idx" ON "OldMetalPurchase"("customerId");
CREATE INDEX "OldMetalPurchase_metalType_idx" ON "OldMetalPurchase"("metalType");

CREATE UNIQUE INDEX "PurchaseReturn_returnNumber_key" ON "PurchaseReturn"("returnNumber");
CREATE INDEX "PurchaseReturn_originalBillId_idx" ON "PurchaseReturn"("originalBillId");
CREATE INDEX "PurchaseReturn_supplierId_idx" ON "PurchaseReturn"("supplierId");
CREATE INDEX "PurchaseReturn_returnDate_idx" ON "PurchaseReturn"("returnDate");
CREATE INDEX "PurchaseReturn_status_idx" ON "PurchaseReturn"("status");

CREATE UNIQUE INDEX "PurchaseReturnItem_tagId_key" ON "PurchaseReturnItem"("tagId");
CREATE INDEX "PurchaseReturnItem_returnId_idx" ON "PurchaseReturnItem"("returnId");

ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PurchaseBillItem" ADD CONSTRAINT "PurchaseBillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "PurchaseBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseBillItem" ADD CONSTRAINT "PurchaseBillItem_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PurchaseBillItem" ADD CONSTRAINT "PurchaseBillItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OldMetalPurchase" ADD CONSTRAINT "OldMetalPurchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_originalBillId_fkey" FOREIGN KEY ("originalBillId") REFERENCES "PurchaseBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseReturnItem" ADD CONSTRAINT "PurchaseReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "PurchaseReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseReturnItem" ADD CONSTRAINT "PurchaseReturnItem_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PurchaseBill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PurchaseBillItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OldMetalPurchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PurchaseReturn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PurchaseReturnItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_purchasebill" ON "PurchaseBill" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_purchasebillitem" ON "PurchaseBillItem" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_oldmetal" ON "OldMetalPurchase" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_purchasereturn" ON "PurchaseReturn" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_purchasereturnitem" ON "PurchaseReturnItem" FOR ALL TO authenticated USING (true) WITH CHECK (true);
