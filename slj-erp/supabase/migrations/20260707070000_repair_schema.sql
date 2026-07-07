-- Safe to re-run: creates any missing ERP schema objects.
-- Use this if init.sql failed with "type already exists" or similar errors.

-- Enums (skip if they already exist)
DO $$ BEGIN
  CREATE TYPE "Category" AS ENUM ('GOLD', 'SILVER', 'DIAMOND', 'STONE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MakingType" AS ENUM ('PER_GRAM', 'PERCENTAGE', 'FIXED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'VIP');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BillType" AS ENUM ('CASH', 'CREDIT', 'EXCHANGE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'CARD', 'UPI', 'CHEQUE', 'MULTIPLE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "ShopSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "shopName" TEXT NOT NULL DEFAULT 'Sri Lakshmi Jewellery',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT 'Tiruppur',
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "pincode" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "bankDetails" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "financialYearStart" INTEGER NOT NULL DEFAULT 4,
    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Item" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "karat" TEXT,
    "hsnCode" TEXT NOT NULL DEFAULT '7113',
    "makingChargeType" "MakingType" NOT NULL,
    "makingChargeValue" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneAlt" TEXT,
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT 'Tiruppur',
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "pincode" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT,
    "panNumber" TEXT,
    "aadharNumber" TEXT,
    "customerType" "CustomerType" NOT NULL DEFAULT 'RETAIL',
    "creditLimit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "openingBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "dateJoined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DailyRate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "gold24kRate" DECIMAL(10,2) NOT NULL,
    "gold22kRate" DECIMAL(10,2) NOT NULL,
    "gold18kRate" DECIMAL(10,2) NOT NULL,
    "silverRate" DECIMAL(10,2) NOT NULL,
    "enteredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "DailyRate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SalesBill" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT,
    "billDate" DATE NOT NULL,
    "billType" "BillType" NOT NULL DEFAULT 'CASH',
    "customerId" TEXT,
    "walkInName" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "cgstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "igstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "roundOff" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "balanceDue" DECIMAL(10,2) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "SalesBill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SalesBillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "tagNumber" TEXT,
    "description" TEXT NOT NULL,
    "grossWeight" DECIMAL(10,3) NOT NULL,
    "stoneWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "netWeight" DECIMAL(10,3) NOT NULL,
    "wastagePercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "wastageWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(10,3) NOT NULL,
    "ratePerGram" DECIMAL(10,2) NOT NULL,
    "goldValue" DECIMAL(10,2) NOT NULL,
    "makingChargeType" "MakingType" NOT NULL,
    "makingChargeValue" DECIMAL(10,2) NOT NULL,
    "makingChargeAmount" DECIMAL(10,2) NOT NULL,
    "stoneCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(10,2) NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 3.0,
    "gstAmount" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SalesBillItem_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Item_itemCode_key" ON "Item"("itemCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_customerCode_key" ON "Customer"("customerCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_phone_key" ON "Customer"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "DailyRate_date_key" ON "DailyRate"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesBill_billNumber_key" ON "SalesBill"("billNumber");

-- Foreign keys (skip if already present)
DO $$ BEGIN
  ALTER TABLE "SalesBill"
    ADD CONSTRAINT "SalesBill_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "SalesBillItem"
    ADD CONSTRAINT "SalesBillItem_billId_fkey"
    FOREIGN KEY ("billId") REFERENCES "SalesBill"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "SalesBillItem"
    ADD CONSTRAINT "SalesBillItem_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "Item"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed default shop settings
INSERT INTO "ShopSettings" ("id") VALUES ('singleton') ON CONFLICT ("id") DO NOTHING;
