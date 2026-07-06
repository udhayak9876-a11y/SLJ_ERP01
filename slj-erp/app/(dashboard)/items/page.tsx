import { getItems } from "@/lib/actions/items";
import { ItemsTable } from "@/components/items/ItemsTable";

export default async function ItemsPage() {
  const items = await getItems();
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Item Master</h2>
      <ItemsTable items={items} />
    </div>
  );
}
