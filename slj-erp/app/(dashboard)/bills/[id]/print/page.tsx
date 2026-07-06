import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BillPrintView } from "@/components/bills/BillPrintView";

export default async function BillPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await prisma.salesBill.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });

  if (!bill) return notFound();

  const settings = await prisma.shopSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  return <BillPrintView bill={bill} settings={settings} />;
}
