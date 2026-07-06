"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { saveTodayRate } from "@/lib/actions/rates";
import { todayDisplay } from "@/lib/utils/date";

const schema = z.object({
  gold24kRate: z.coerce.number().positive("Enter a valid rate"),
  gold22kRate: z.coerce.number().positive("Enter a valid rate"),
  gold18kRate: z.coerce.number().positive("Enter a valid rate"),
  silverRate: z.coerce.number().positive("Enter a valid rate"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RateFormProps {
  existing: {
    gold24kRate: number;
    gold22kRate: number;
    gold18kRate: number;
    silverRate: number;
    notes: string;
  } | null;
}

export function RateForm({ existing }: RateFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: existing ?? undefined,
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      await saveTodayRate({
        gold24kRate: values.gold24kRate,
        gold22kRate: values.gold22kRate,
        gold18kRate: values.gold18kRate,
        silverRate: values.silverRate,
        notes: values.notes,
      });
      toast({
        title: existing ? "Today's rate updated" : "Today's rate saved",
        variant: "success",
      });
      router.refresh();
    } catch {
      toast({ title: "Failed to save rate", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { name: "gold24kRate" as const, label: "Gold 24K" },
    { name: "gold22kRate" as const, label: "Gold 22K" },
    { name: "gold18kRate" as const, label: "Gold 18K" },
    { name: "silverRate" as const, label: "Silver" },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border bg-gold-light/30 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-navy">
        {existing ? "Edit" : "Enter"} rate for today — {todayDisplay()}
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {fields.map(({ name, label }) => (
          <div key={name} className="space-y-1.5">
            <Label htmlFor={name}>
              {label} <span className="text-muted-foreground">per gram (₹)</span>
            </Label>
            <Input
              id={name}
              type="number"
              step="0.01"
              min="0"
              {...register(name)}
            />
            {errors[name] && (
              <p className="text-xs text-red-600">{errors[name]?.message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" placeholder="Optional" {...register("notes")} />
      </div>

      <Button type="submit" className="mt-4" disabled={saving}>
        {saving ? "Saving…" : existing ? "Update Rate" : "Save Rate"}
      </Button>
    </form>
  );
}
