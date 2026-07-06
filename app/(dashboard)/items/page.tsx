import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ItemsTable } from "@/components/items/ItemsTable";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const items = await prisma.item.findMany({
    orderBy: { itemCode: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy">Item Master</h1>
        <Button asChild>
          <Link href="/items/new">
            <Plus className="h-4 w-4" />
            Add New Item
          </Link>
        </Button>
      </div>
      <ItemsTable
        items={items.map((i) => ({
          id: i.id,
          itemCode: i.itemCode,
          itemName: i.itemName,
          category: i.category,
          karat: i.karat,
          makingChargeType: i.makingChargeType,
          makingChargeValue: Number(i.makingChargeValue),
          isActive: i.isActive,
        }))}
      />
    </div>
  );
}
