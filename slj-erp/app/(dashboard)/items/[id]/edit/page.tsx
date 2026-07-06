import { notFound } from "next/navigation";
import { getItem } from "@/lib/actions/items";
import { ItemForm } from "@/components/items/ItemForm";

export default async function EditItemPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getItem(params.id);
  if (!item) notFound();

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Edit Item — {item.itemCode}</h2>
      <ItemForm item={item} />
    </div>
  );
}
