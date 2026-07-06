import { prisma } from "@/lib/prisma";
import { getTodayRate } from "@/lib/data";
import { BillForm } from "@/components/bills/BillForm";

export const dynamic = "force-dynamic";

export default async function NewBillPage() {
  const [items, customers, todayRate] = await Promise.all([
    prisma.item.findMany({
      where: { isActive: true },
      orderBy: { itemCode: "asc" },
    }),
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    getTodayRate(),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-navy">New Sales Bill</h1>
      <BillForm
        items={items.map((i) => ({
          id: i.id,
          itemCode: i.itemCode,
          itemName: i.itemName,
          category: i.category,
          karat: i.karat,
          hsnCode: i.hsnCode,
          makingChargeType: i.makingChargeType,
          makingChargeValue: Number(i.makingChargeValue),
        }))}
        customers={customers.map((c) => ({
          id: c.id,
          customerCode: c.customerCode,
          name: c.name,
          phone: c.phone,
          state: c.state,
          gstin: c.gstin,
          address: c.address,
          city: c.city,
        }))}
        rates={
          todayRate
            ? {
                gold24kRate: Number(todayRate.gold24kRate),
                gold22kRate: Number(todayRate.gold22kRate),
                gold18kRate: Number(todayRate.gold18kRate),
                silverRate: Number(todayRate.silverRate),
              }
            : null
        }
      />
    </div>
  );
}
