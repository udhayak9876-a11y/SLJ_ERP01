import Link from "next/link";
import { getLots } from "@/lib/actions/lots";
import { LotsTable } from "@/components/stock/LotsTable";

export default async function LotsPage() {
  const lots = await getLots();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lot Management</h2>
          <p className="text-sm text-muted-foreground">
            Stock received in purchase batches
          </p>
        </div>
        <Link href="/stock" className="text-sm text-muted-foreground hover:underline">
          ← Stock
        </Link>
      </div>
      <LotsTable lots={lots} />
    </div>
  );
}
