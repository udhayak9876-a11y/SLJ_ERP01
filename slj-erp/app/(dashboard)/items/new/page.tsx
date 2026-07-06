"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const schema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.enum(["GOLD", "SILVER", "DIAMOND", "STONE", "OTHER"]),
  karat: z.string().optional(),
  hsnCode: z.string().default("7113"),
  makingChargeType: z.enum(["PER_GRAM", "PERCENTAGE", "FIXED"]),
  makingChargeValue: z.coerce.number().positive("Must be positive"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewItemPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      category: "GOLD",
      hsnCode: "7113",
      makingChargeType: "PER_GRAM",
      makingChargeValue: 0,
    },
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) router.push("/items");
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Add New Item</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md border p-3">
        <div>
          <label className="mb-1 block text-sm">Item Name</label>
          <Input {...register("itemName")} />
          {errors.itemName ? <p className="text-xs text-red-600">{errors.itemName.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm">Category</label>
          <Select {...register("category")}>
            <option value="GOLD">Gold</option>
            <option value="SILVER">Silver</option>
            <option value="DIAMOND">Diamond</option>
            <option value="STONE">Stone</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-sm">Karat</label><Input {...register("karat")} /></div>
          <div><label className="mb-1 block text-sm">HSN Code</label><Input {...register("hsnCode")} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm">Making Type</label>
            <Select {...register("makingChargeType")}>
              <option value="PER_GRAM">Per Gram</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Making Value</label>
            <Input type="number" step="0.01" {...register("makingChargeValue")} />
            {errors.makingChargeValue ? <p className="text-xs text-red-600">{errors.makingChargeValue.message}</p> : null}
          </div>
        </div>
        <div><label className="mb-1 block text-sm">Notes</label><Input {...register("notes")} /></div>
        <Button type="submit">Save Item</Button>
      </form>
    </div>
  );
}
