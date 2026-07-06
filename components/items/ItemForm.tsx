"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category, MakingType } from "@prisma/client";
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
import { useToast } from "@/components/ui/use-toast";
import { createItem, updateItem } from "@/lib/actions/items";

const schema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.nativeEnum(Category),
  karat: z.string().optional(),
  hsnCode: z.string().min(1, "HSN code is required"),
  makingChargeType: z.nativeEnum(MakingType),
  makingChargeValue: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .positive("Making charge must be positive"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ItemFormProps {
  itemId?: string;
  defaultValues?: Partial<FormValues>;
}

const KARAT_OPTIONS = ["24K", "22K", "18K", "Silver 925", "Silver 999"];

export function ItemForm({ itemId, defaultValues }: ItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      category: "GOLD",
      hsnCode: "7113",
      makingChargeType: "PER_GRAM",
      karat: "22K",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  const category = watch("category");
  const makingChargeType = watch("makingChargeType");
  const karat = watch("karat");

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const payload = {
        itemName: values.itemName,
        category: values.category,
        karat: values.karat,
        hsnCode: values.hsnCode,
        makingChargeType: values.makingChargeType,
        makingChargeValue: values.makingChargeValue,
        notes: values.notes,
      };
      if (itemId) {
        await updateItem(itemId, payload);
        toast({ title: "Item updated", variant: "success" });
      } else {
        const result = await createItem(payload);
        toast({
          title: `Item saved as ${result.itemCode}`,
          variant: "success",
        });
      }
      router.push("/items");
      router.refresh();
    } catch {
      toast({ title: "Failed to save item", variant: "destructive" });
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="itemName">Item Name *</Label>
        <Input
          id="itemName"
          placeholder="e.g. Gold Chain, Silver Anklet"
          {...register("itemName")}
        />
        {errors.itemName && (
          <p className="text-xs text-red-600">{errors.itemName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select
            value={category}
            onValueChange={(v) => setValue("category", v as Category)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GOLD">Gold</SelectItem>
              <SelectItem value="SILVER">Silver</SelectItem>
              <SelectItem value="DIAMOND">Diamond</SelectItem>
              <SelectItem value="STONE">Stone</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Karat / Purity</Label>
          <Select
            value={karat || ""}
            onValueChange={(v) => setValue("karat", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {KARAT_OPTIONS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="hsnCode">HSN Code</Label>
          <Input id="hsnCode" {...register("hsnCode")} />
          {errors.hsnCode && (
            <p className="text-xs text-red-600">{errors.hsnCode.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Making Charge Type *</Label>
          <Select
            value={makingChargeType}
            onValueChange={(v) => setValue("makingChargeType", v as MakingType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PER_GRAM">Per Gram (₹/g)</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
              <SelectItem value="FIXED">Fixed (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="makingChargeValue">
            Value{" "}
            {makingChargeType === "PER_GRAM"
              ? "(₹/g)"
              : makingChargeType === "PERCENTAGE"
                ? "(%)"
                : "(₹)"}
            {" *"}
          </Label>
          <Input
            id="makingChargeValue"
            type="number"
            step="0.01"
            min="0"
            {...register("makingChargeValue")}
          />
          {errors.makingChargeValue && (
            <p className="text-xs text-red-600">
              {errors.makingChargeValue.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} {...register("notes")} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : itemId ? "Update Item" : "Save Item"}
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
