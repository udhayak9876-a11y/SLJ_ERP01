import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateGST } from "@/lib/utils/gst";
import { generateBillNumber } from "@/lib/utils/billNumber";
import { revalidatePath } from "next/cache";

export async function GET() {
  const bills = await prisma.salesBill.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bills);
}

export async function POST(req: Request) {
  const payload = await req.json();

  const subtotal = payload.items.reduce((sum: number, item: any) => sum + Number(item.taxableAmount || 0), 0);
  const gstSplit = calculateGST(subtotal, payload.customerState || "Tamil Nadu");
  const grossTotal = subtotal + gstSplit.cgst + gstSplit.sgst + gstSplit.igst;
  const roundedTotal = Math.round(grossTotal - Number(payload.discountAmount || 0));
  const roundOff = roundedTotal - (grossTotal - Number(payload.discountAmount || 0));

  const lastConfirmed = await prisma.salesBill.count({ where: { status: "CONFIRMED" } });
  const isConfirmed = payload.status === "CONFIRMED";
  const billNumber = isConfirmed ? generateBillNumber(lastConfirmed) : `DRAFT-${Date.now()}`;

  const bill = await prisma.salesBill.create({
    data: {
      billNumber,
      billDate: new Date(payload.billDate),
      billType: payload.billType,
      customerId: payload.customerId || null,
      walkInName: payload.walkInName || null,
      subtotal,
      cgstAmount: gstSplit.cgst,
      sgstAmount: gstSplit.sgst,
      igstAmount: gstSplit.igst,
      discountAmount: Number(payload.discountAmount || 0),
      roundOff,
      totalAmount: roundedTotal,
      amountPaid: Number(payload.amountPaid || 0),
      balanceDue: roundedTotal - Number(payload.amountPaid || 0),
      paymentMode: payload.paymentMode,
      status: payload.status,
      createdBy: payload.createdBy,
      notes: payload.notes || null,
      items: {
        create: payload.items.map((item: any, index: number) => ({
          itemId: item.itemId,
          tagNumber: item.tagNumber || null,
          description: item.description,
          grossWeight: Number(item.grossWeight || 0),
          stoneWeight: Number(item.stoneWeight || 0),
          netWeight: Number(item.netWeight || 0),
          wastagePercent: Number(item.wastagePercent || 0),
          wastageWeight: Number(item.wastageWeight || 0),
          totalWeight: Number(item.totalWeight || 0),
          ratePerGram: Number(item.ratePerGram || 0),
          goldValue: Number(item.goldValue || 0),
          makingChargeType: item.makingChargeType,
          makingChargeValue: Number(item.makingChargeValue || 0),
          makingChargeAmount: Number(item.makingChargeAmount || 0),
          stoneCharge: Number(item.stoneCharge || 0),
          taxableAmount: Number(item.taxableAmount || 0),
          gstRate: Number(item.gstRate || 3),
          gstAmount: Number(item.gstAmount || 0),
          lineTotal: Number(item.lineTotal || 0),
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/bills");
  revalidatePath("/rates");

  return NextResponse.json(bill);
}
