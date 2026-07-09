"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Supplier, MetalType } from "@prisma/client";
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
import { createLot } from "@/lib/actions/lots";
import { toISODate } from "@/lib/utils/date";

const schema = z.object({
  lotDate: z.string().min(1),
  supplierId: z.string().optional(),
  metalType: z.enum(["GOLD", "SILVER", "DIAMOND"]),
  invoiceNumber: z.string().optional(),
  purchaseRate: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LotFormProps {
  suppliers: Supplier[];
}

export function LotForm({ suppliers }: LotFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      lotDate: toISODate(new Date()),
      metalType: "GOLD",
      supplierId: "",
    },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const lot = await createLot({
        lotDate: new Date(data.lotDate),
        supplierId: data.supplierId || undefined,
        metalType: data.metalType as MetalType,
        invoiceNumber: data.invoiceNumber,
        purchaseRate: data.purchaseRate,
        notes: data.notes,
      });
      toast.success(`Lot ${lot.lotNumber} created`);
      router.push(`/stock/lots/${lot.id}`);
    } catch {
      toast.error("Failed to create lot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div>
        <Label>Lot Date *</Label>
        <Input type="date" {...register("lotDate")} />
      </div>
      <div>
        <Label>Supplier</Label>
        <Select
          value={watch("supplierId") || "none"}
          onValueChange={(v) => setValue("supplierId", v === "none" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No supplier</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.supplierCode} — {s.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Metal Type *</Label>
        <Select
          value={watch("metalType")}
          onValueChange={(v) => setValue("metalType", v as MetalType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GOLD">Gold</SelectItem>
            <SelectItem value="SILVER">Silver</SelectItem>
            <SelectItem value="DIAMOND">Diamond</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Supplier Invoice No.</Label>
        <Input {...register("invoiceNumber")} />
      </div>
      <div>
        <Label>Purchase Rate (₹/g)</Label>
        <Input type="number" step="0.01" {...register("purchaseRate")} />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Lot"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
