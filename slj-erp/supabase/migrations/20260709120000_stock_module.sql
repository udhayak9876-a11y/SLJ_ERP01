-- Phase 2: Stock & Tags module

CREATE TYPE "MetalType" AS ENUM ('GOLD', 'SILVER', 'DIAMOND');
CREATE TYPE "TagStatus" AS ENUM ('RECEIVED', 'COUNTER_ASSIGNED', 'SOLD', 'RETURNED', 'WITH_KARIGAR');
CREATE TYPE "LotStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE_IN', 'SALE_OUT', 'RETURN_IN', 'KARIGAR_OUT', 'KARIGAR_IN', 'COUNTER_TRANSFER');

CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT,
    "panNumber" TEXT,
    "metalTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "openingBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "counterCode" TEXT NOT NULL,
    "counterName" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "metalType" "MetalType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "supplierId" TEXT,
    "lotDate" DATE NOT NULL,
    "metalType" "MetalType" NOT NULL,
    "totalPieces" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "invoiceNumber" TEXT,
    "purchaseRate" DECIMAL(10,2),
    "status" "LotStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lotId" TEXT,
    "counterId" TEXT,
    "grossWeight" DECIMAL(10,3) NOT NULL,
    "stoneWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "netWeight" DECIMAL(10,3) NOT NULL,
    "stoneCount" INTEGER NOT NULL DEFAULT 0,
    "stoneDescription" TEXT,
    "huidNumber" TEXT,
    "purchaseRate" DECIMAL(10,2),
    "mrp" DECIMAL(10,2),
    "status" "TagStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedDate" DATE NOT NULL,
    "soldDate" DATE,
    "returnedDate" DATE,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "movementType" "StockMovementType" NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT,
    "weight" DECIMAL(10,3) NOT NULL,
    "date" DATE NOT NULL,
    "referenceId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Supplier_supplierCode_key" ON "Supplier"("supplierCode");
CREATE INDEX "Supplier_supplierCode_idx" ON "Supplier"("supplierCode");

CREATE UNIQUE INDEX "Counter_counterCode_key" ON "Counter"("counterCode");
CREATE INDEX "Counter_counterCode_idx" ON "Counter"("counterCode");
CREATE INDEX "Counter_metalType_idx" ON "Counter"("metalType");

CREATE UNIQUE INDEX "Lot_lotNumber_key" ON "Lot"("lotNumber");
CREATE INDEX "Lot_supplierId_idx" ON "Lot"("supplierId");
CREATE INDEX "Lot_lotDate_idx" ON "Lot"("lotDate");
CREATE INDEX "Lot_status_idx" ON "Lot"("status");

CREATE UNIQUE INDEX "Tag_tagId_key" ON "Tag"("tagId");
CREATE INDEX "Tag_productId_idx" ON "Tag"("productId");
CREATE INDEX "Tag_lotId_idx" ON "Tag"("lotId");
CREATE INDEX "Tag_counterId_idx" ON "Tag"("counterId");
CREATE INDEX "Tag_status_idx" ON "Tag"("status");
CREATE INDEX "Tag_receivedDate_idx" ON "Tag"("receivedDate");
CREATE INDEX "Tag_huidNumber_idx" ON "Tag"("huidNumber");

CREATE INDEX "StockMovement_tagId_idx" ON "StockMovement"("tagId");
CREATE INDEX "StockMovement_movementType_idx" ON "StockMovement"("movementType");
CREATE INDEX "StockMovement_date_idx" ON "StockMovement"("date");

ALTER TABLE "Lot" ADD CONSTRAINT "Lot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "Counter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Counter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_supplier" ON "Supplier" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_counter" ON "Counter" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_lot" ON "Lot" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_tag" ON "Tag" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_stockmovement" ON "StockMovement" FOR ALL TO authenticated USING (true) WITH CHECK (true);
