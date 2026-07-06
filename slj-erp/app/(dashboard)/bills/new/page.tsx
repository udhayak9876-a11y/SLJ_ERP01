import { getActiveItems } from "@/lib/actions/items";
import { getActiveCustomers } from "@/lib/actions/customers";
import { getTodayRate } from "@/lib/actions/rates";
import { BillForm } from "@/components/bills/BillForm";

export default async function NewBillPage() {
  const [items, customers, todayRate] = await Promise.all([
    getActiveItems(),
    getActiveCustomers(),
    getTodayRate(),
  ]);

  const rates = todayRate
    ? {
        gold24kRate: Number(todayRate.gold24kRate),
        gold22kRate: Number(todayRate.gold22kRate),
        gold18kRate: Number(todayRate.gold18kRate),
        silverRate: Number(todayRate.silverRate),
      }
    : null;

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">New Sales Bill</h2>
      <BillForm items={items} customers={customers} rates={rates} />
    </div>
  );
}
