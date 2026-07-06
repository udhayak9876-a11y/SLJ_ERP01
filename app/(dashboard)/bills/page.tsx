import { getBills, getTodayBillsSummary } from "@/lib/actions/bills";
import { BillsTable } from "@/components/bills/BillsTable";

export default async function BillsPage() {
  const [bills, summary] = await Promise.all([
    getBills(),
    getTodayBillsSummary(),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Sales Bills</h2>
      <BillsTable bills={bills} summary={summary} />
    </div>
  );
}
