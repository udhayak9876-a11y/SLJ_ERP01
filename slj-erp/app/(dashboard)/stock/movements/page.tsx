import Link from "next/link";
import { getStockMovements } from "@/lib/actions/stockMovements";
import { MovementsTable } from "@/components/stock/MovementsTable";

export default async function MovementsPage() {
  const movements = await getStockMovements();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Stock Movement Log</h2>
          <p className="text-sm text-muted-foreground">
            Audit trail of every tag movement
          </p>
        </div>
        <Link href="/stock" className="text-sm text-muted-foreground hover:underline">
          ← Stock
        </Link>
      </div>
      <MovementsTable movements={movements} />
    </div>
  );
}
