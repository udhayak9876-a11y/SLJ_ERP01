import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/items/ItemForm";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-navy">
        Edit Item — {item.itemCode}
      </h1>
      <ItemForm
        itemId={item.id}
        defaultValues={{
          itemName: item.itemName,
          category: item.category,
          karat: item.karat ?? undefined,
          hsnCode: item.hsnCode,
          makingChargeType: item.makingChargeType,
          makingChargeValue: Number(item.makingChargeValue),
          notes: item.notes ?? undefined,
        }}
      />
    </div>
  );
}
