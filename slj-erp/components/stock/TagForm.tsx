"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Item, Counter, Lot } from "@prisma/client";
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
import { createTag } from "@/lib/actions/tags";
import { roundWeight } from "@/lib/utils/weight";
import { formatHuidError, validateHuid } from "@/lib/utils/huid";
import { toISODate } from "@/lib/utils/date";

const schema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    lotId: z.string().optional(),
    counterId: z.string().optional(),
    grossWeight: z.coerce.number().positive("Gross weight required"),
    stoneWeight: z.coerce.number().min(0),
    stoneCount: z.coerce.number().min(0).optional(),
    stoneDescription: z.string().optional(),
    huidNumber: z.string().optional(),
    purchaseRate: z.coerce.number().min(0).optional(),
    mrp: z.coerce.number().min(0).optional(),
    receivedDate: z.string().min(1),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.huidNumber && data.huidNumber.length > 0) {
        return validateHuid(data.huidNumber);
      }
      return true;
    },
    { message: formatHuidError(), path: ["huidNumber"] }
  );

type FormData = z.infer<typeof schema>;

interface TagFormProps {
  products: Item[];
  counters: Counter[];
  lots: (Lot & { supplier?: { companyName: string } | null })[];
  defaultLotId?: string;
}

export function TagForm({
  products,
  counters,
  lots,
  defaultLotId,
}: TagFormProps) {
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
    defaultValues: {
      productId: "",
      lotId: defaultLotId || "",
      counterId: "",
      grossWeight: 0,
      stoneWeight: 0,
      stoneCount: 0,
      receivedDate: toISODate(new Date()),
      huidNumber: "",
      purchaseRate: 0,
      mrp: 0,
    },
  });

  const grossWeight = watch("grossWeight") || 0;
  const stoneWeight = watch("stoneWeight") || 0;
  const netWeight = roundWeight(Number(grossWeight) - Number(stoneWeight));
  const selectedProduct = products.find((p) => p.id === watch("productId"));

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const tag = await createTag({
        productId: data.productId,
        lotId: data.lotId || undefined,
        counterId: data.counterId || undefined,
        grossWeight: data.grossWeight,
        stoneWeight: data.stoneWeight,
        stoneCount: data.stoneCount,
        stoneDescription: data.stoneDescription,
        huidNumber: data.huidNumber || undefined,
        purchaseRate: data.purchaseRate || undefined,
        mrp: data.mrp || undefined,
        receivedDate: new Date(data.receivedDate),
        notes: data.notes,
      });
      toast.success(`Tag ${tag.tagId} created`);
      router.push(`/stock/tags/${tag.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create tag");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Product *</Label>
          <Select
            value={watch("productId")}
            onValueChange={(v) => setValue("productId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.itemCode} — {p.itemName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.productId && (
            <p className="text-sm text-red-500">{errors.productId.message}</p>
          )}
        </div>

        <div>
          <Label>Lot (optional)</Label>
          <Select
            value={watch("lotId") || "none"}
            onValueChange={(v) => setValue("lotId", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No lot</SelectItem>
              {lots.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.lotNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Assign Counter (optional)</Label>
          <Select
            value={watch("counterId") || "none"}
            onValueChange={(v) => setValue("counterId", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select counter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {counters.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.counterName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Received Date *</Label>
          <Input type="date" {...register("receivedDate")} />
        </div>

        <div>
          <Label>Gross Weight (g) *</Label>
          <Input type="number" step="0.001" {...register("grossWeight")} />
          {errors.grossWeight && (
            <p className="text-sm text-red-500">{errors.grossWeight.message}</p>
          )}
        </div>

        <div>
          <Label>Stone Weight (g)</Label>
          <Input type="number" step="0.001" {...register("stoneWeight")} />
        </div>

        <div className="col-span-2 rounded bg-gray-50 p-3 text-sm">
          Net Weight: <strong>{netWeight.toFixed(3)} g</strong>
        </div>

        {selectedProduct?.category === "GOLD" && (
          <div>
            <Label>HUID (6 chars)</Label>
            <Input
              {...register("huidNumber")}
              placeholder="AA1B2C"
              className="uppercase font-mono"
            />
            {errors.huidNumber && (
              <p className="text-sm text-red-500">{errors.huidNumber.message}</p>
            )}
          </div>
        )}

        <div>
          <Label>Stone Count</Label>
          <Input type="number" {...register("stoneCount")} />
        </div>

        <div>
          <Label>Purchase Rate (₹/g)</Label>
          <Input type="number" step="0.01" {...register("purchaseRate")} />
        </div>

        <div>
          <Label>MRP (₹)</Label>
          <Input type="number" step="0.01" {...register("mrp")} />
        </div>

        <div className="col-span-2">
          <Label>Stone Description</Label>
          <Input {...register("stoneDescription")} />
        </div>

        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea {...register("notes")} rows={2} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Tag"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
