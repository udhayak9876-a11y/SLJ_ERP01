import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/utils/date";
import { formatINR } from "@/lib/utils/currency";

export default async function BillViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await prisma.salesBill.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });

  if (!bill) return notFound();

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Bill {bill.billNumber}</h1>
      <p>Date: {formatDisplayDate(bill.billDate)}</p>
      <p>Customer: {bill.customer?.name ?? bill.walkInName ?? "Walk-in"}</p>
      <p>Total: {formatINR(Number(bill.totalAmount))}</p>
      <Link href={`/bills/${bill.id}/print`} className="text-sm text-blue-600 underline">Go to Print View</Link>
    </div>
  );
}
