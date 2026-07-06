-- Sri Lakshmi Jewellery ERP — initial schema
-- Run in Supabase SQL Editor, or via: npx prisma db push

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GOLD', 'SILVER', 'DIAMOND', 'STONE', 'OTHER');

-- CreateEnum
CREATE TYPE "MakingType" AS ENUM ('PER_GRAM', 'PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'VIP');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('CASH', 'CREDIT', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'CARD', 'UPI', 'CHEQUE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ShopSettings" (
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

-- CreateTable
CREATE TABLE "Item" (
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

-- CreateTable
CREATE TABLE "Customer" (
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

-- CreateTable
CREATE TABLE "DailyRate" (
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

-- CreateTable
CREATE TABLE "SalesBill" (
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

-- CreateTable
CREATE TABLE "SalesBillItem" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Item_itemCode_key" ON "Item"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRate_date_key" ON "DailyRate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SalesBill_billNumber_key" ON "SalesBill"("billNumber");

-- AddForeignKey
ALTER TABLE "SalesBill" ADD CONSTRAINT "SalesBill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItem" ADD CONSTRAINT "SalesBillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "SalesBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItem" ADD CONSTRAINT "SalesBillItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default shop settings
INSERT INTO "ShopSettings" ("id") VALUES ('singleton') ON CONFLICT DO NOTHING;
