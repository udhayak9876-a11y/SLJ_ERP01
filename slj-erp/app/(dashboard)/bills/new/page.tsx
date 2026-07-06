import { BillForm } from "@/components/bills/BillForm";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function NewBillPage() {
  const [customers, items, todaysRate] = await Promise.all([
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.item.findMany({ where: { isActive: true }, orderBy: { itemName: "asc" } }),
    prisma.dailyRate.findFirst({ orderBy: { date: "desc" } }),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">New Sales Bill</h1>
      <BillForm
        customers={customers}
        items={items}
        todaysRate={
          todaysRate
            ? {
                gold24kRate: Number(todaysRate.gold24kRate),
                gold22kRate: Number(todaysRate.gold22kRate),
                gold18kRate: Number(todaysRate.gold18kRate),
                silverRate: Number(todaysRate.silverRate),
              }
            : null
        }
        userEmail={user?.email ?? "admin@slj.local"}
      />
    </div>
  );
}
