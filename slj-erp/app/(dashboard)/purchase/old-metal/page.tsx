import Link from "next/link";
import { getOldMetalPurchases } from "@/lib/actions/oldMetalPurchase";
import { OldMetalTable } from "@/components/purchase/OldMetalTable";

export default async function OldMetalPage() {
  const records = await getOldMetalPurchases();
  return (
    <div>
      <Link href="/purchase" className="text-sm text-muted-foreground hover:underline">← Purchase</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Old Gold / Silver Buyback</h2>
      <OldMetalTable records={records} />
    </div>
  );
}
