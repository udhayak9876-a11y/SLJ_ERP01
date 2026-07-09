import Link from "next/link";
import { getCustomers } from "@/lib/actions/customers";
import { OldMetalForm } from "@/components/purchase/OldMetalForm";

export default async function NewOldMetalPage() {
  const customers = await getCustomers();
  return (
    <div>
      <Link href="/purchase/old-metal" className="text-sm text-muted-foreground hover:underline">← Buyback</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Old Metal Purchase</h2>
      <OldMetalForm customers={customers} />
    </div>
  );
}
