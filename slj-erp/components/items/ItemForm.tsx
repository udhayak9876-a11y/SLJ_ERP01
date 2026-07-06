"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItem, updateItem } from "@/lib/actions/items";
import { Category, Item, MakingType } from "@prisma/client";

const schema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.enum(["GOLD", "SILVER", "DIAMOND", "STONE", "OTHER"]),
  karat: z.string().optional(),
  hsnCode: z.string().min(1),
  makingChargeType: z.enum(["PER_GRAM", "PERCENTAGE", "FIXED"]),
  makingChargeValue: z.coerce.number().positive("Must be positive"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ItemFormProps {
  item?: Item;
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: item
      ? {
          itemName: item.itemName,
          category: item.category,
          karat: item.karat || "",
          hsnCode: item.hsnCode,
          makingChargeType: item.makingChargeType,
          makingChargeValue: Number(item.makingChargeValue),
          notes: item.notes || "",
        }
      : {
          category: "GOLD",
          hsnCode: "7113",
          makingChargeType: "PER_GRAM",
        },
  });

  const category = watch("category");
  const makingChargeType = watch("makingChargeType");

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      if (item) {
        await updateItem(item.id, data);
        toast.success("Item updated");
      } else {
        await createItem(data);
        toast.success("Item created");
      }
      router.push("/items");
      router.refresh();
    } catch {
      toast.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      {item && (
        <div className="space-y-1">
          <Label>Item Code</Label>
          <Input value={item.itemCode} disabled />
        </div>
      )}

      <div className="space-y-1">
        <Label>Item Name *</Label>
        <Input {...register("itemName")} />
        {errors.itemName && (
          <p className="text-xs text-destructive">{errors.itemName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Category *</Label>
        <Select
          value={category}
          onValueChange={(v) => setValue("category", v as Category)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["GOLD", "SILVER", "DIAMOND", "STONE", "OTHER"] as const).map(
              (c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Karat</Label>
        <Input {...register("karat")} placeholder="22K, 18K, Silver 925" />
      </div>

      <div className="space-y-1">
        <Label>HSN Code</Label>
        <Input {...register("hsnCode")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Making Charge Type</Label>
          <Select
            value={makingChargeType}
            onValueChange={(v) =>
              setValue("makingChargeType", v as MakingType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PER_GRAM">Per Gram</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Making Charge Value *</Label>
          <Input type="number" step="0.01" {...register("makingChargeValue")} />
          {errors.makingChargeValue && (
            <p className="text-xs text-destructive">
              {errors.makingChargeValue.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : item ? "Update Item" : "Save Item"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/items")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
