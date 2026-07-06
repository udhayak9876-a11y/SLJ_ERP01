import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getShopSettings } from "@/lib/data";
import { BillPrintView } from "@/components/bills/BillPrintView";
import { formatDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function BillPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const [bill, shop] = await Promise.all([
    prisma.salesBill.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: { orderBy: { sortOrder: "asc" }, include: { item: true } },
      },
    }),
    getShopSettings(),
  ]);

  if (!bill) notFound();

  const customerAddress = bill.customer
    ? [bill.customer.address, bill.customer.city, bill.customer.state]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <BillPrintView
      bill={{
        billNumber: bill.status === "DRAFT" ? "DRAFT" : bill.billNumber,
        billDate: formatDate(bill.billDate),
        billType: bill.billType,
        paymentMode: bill.paymentMode,
        status: bill.status,
        customerName: bill.customer?.name ?? bill.walkInName ?? "Walk-in Customer",
        customerAddress,
        customerPhone: bill.customer?.phone ?? "",
        customerGstin: bill.customer?.gstin ?? null,
        subtotal: Number(bill.subtotal),
        cgstAmount: Number(bill.cgstAmount),
        sgstAmount: Number(bill.sgstAmount),
        igstAmount: Number(bill.igstAmount),
        discountAmount: Number(bill.discountAmount),
        roundOff: Number(bill.roundOff),
        totalAmount: Number(bill.totalAmount),
        amountPaid: Number(bill.amountPaid),
        balanceDue: Number(bill.balanceDue),
        items: bill.items.map((item) => ({
          description: item.description,
          tagNumber: item.tagNumber,
          hsnCode: item.item.hsnCode,
          grossWeight: Number(item.grossWeight),
          stoneWeight: Number(item.stoneWeight),
          netWeight: Number(item.netWeight),
          wastageWeight: Number(item.wastageWeight),
          totalWeight: Number(item.totalWeight),
          ratePerGram: Number(item.ratePerGram),
          goldValue: Number(item.goldValue),
          makingChargeAmount: Number(item.makingChargeAmount),
          stoneCharge: Number(item.stoneCharge),
          taxableAmount: Number(item.taxableAmount),
          gstRate: Number(item.gstRate),
          gstAmount: Number(item.gstAmount),
          lineTotal: Number(item.lineTotal),
        })),
      }}
      shop={{
        shopName: shop.shopName,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        pincode: shop.pincode,
        phone: shop.phone,
        email: shop.email,
        gstin: shop.gstin,
        bankDetails: shop.bankDetails,
      }}
    />
  );
}
