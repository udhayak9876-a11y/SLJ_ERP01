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
import { createChitScheme } from "@/lib/actions/chitSchemes";
import { toISODate } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";

const schema = z.object({
  schemeName: z.string().min(1),
  durationMonths: z.coerce.number().int().min(1).max(36),
  instalmentAmount: z.coerce.number().positive(),
  startDate: z.string().min(1),
  bonusMonth: z.coerce.number().int().min(1).max(36).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function SchemeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: toISODate(new Date()),
      durationMonths: 11,
      instalmentAmount: 1000,
    },
  });

  const duration = watch("durationMonths") || 0;
  const instalment = watch("instalmentAmount") || 0;

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const scheme = await createChitScheme({
        schemeName: data.schemeName,
        durationMonths: data.durationMonths,
        instalmentAmount: data.instalmentAmount,
        startDate: new Date(data.startDate),
        bonusMonth: data.bonusMonth,
        notes: data.notes,
      });
      toast.success(`Scheme ${scheme.schemeCode} created`);
      router.push(`/schemes/${scheme.id}`);
    } catch {
      toast.error("Failed to create scheme");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div>
        <Label>Scheme Name *</Label>
        <Input {...register("schemeName")} placeholder="11 Month Gold Scheme" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Duration (months) *</Label>
          <Input type="number" {...register("durationMonths")} />
        </div>
        <div>
          <Label>Instalment (₹) *</Label>
          <Input type="number" step="0.01" {...register("instalmentAmount")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date *</Label>
          <Input type="date" {...register("startDate")} />
        </div>
        <div>
          <Label>Bonus Month (optional)</Label>
          <Input type="number" {...register("bonusMonth")} placeholder="11 = free last month" />
        </div>
      </div>
      <div className="rounded bg-gray-50 p-3 text-sm">
        Total per member: <IndianCurrency amount={duration * instalment} className="font-semibold inline" />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Scheme"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
