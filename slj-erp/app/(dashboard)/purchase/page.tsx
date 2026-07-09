import { PurchaseOverview } from "@/components/purchase/PurchaseOverview";

export default function PurchasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Purchase</h2>
        <p className="text-sm text-muted-foreground">
          Supplier purchases, old gold buyback & returns
        </p>
      </div>
      <PurchaseOverview />
    </div>
  );
}
