import { ItemForm } from "@/components/items/ItemForm";

export default function NewItemPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-navy">Add New Item</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Item code will be auto-generated on save (e.g. GOL-001, SIL-001).
      </p>
      <ItemForm />
    </div>
  );
}
