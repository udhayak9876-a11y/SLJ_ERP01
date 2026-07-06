"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DailyRate } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { saveDailyRate } from "@/lib/actions/rates";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

const schema = z.object({
  gold24kRate: z.coerce.number().positive("Required"),
  gold22kRate: z.coerce.number().positive("Required"),
  gold18kRate: z.coerce.number().positive("Required"),
  silverRate: z.coerce.number().positive("Required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RatesPageClientProps {
  todayRate: DailyRate | null;
  history: DailyRate[];
}

export function RatesPageClient({ todayRate, history }: RatesPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: todayRate
      ? {
          gold24kRate: Number(todayRate.gold24kRate),
          gold22kRate: Number(todayRate.gold22kRate),
          gold18kRate: Number(todayRate.gold18kRate),
          silverRate: Number(todayRate.silverRate),
          notes: todayRate.notes || "",
        }
      : undefined,
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await saveDailyRate(data);
      toast.success(todayRate ? "Rate updated" : "Rate saved");
      router.refresh();
    } catch {
      toast.error("Failed to save rate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {todayRate ? "Edit" : "Enter"} Today&apos;s Rates —{" "}
            {formatDateDDMMYYYY(new Date())}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {(
                [
                  ["gold24kRate", "24K Gold"],
                  ["gold22kRate", "22K Gold"],
                  ["gold18kRate", "18K Gold"],
                  ["silverRate", "Silver"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="space-y-1">
                  <Label>
                    {label} <span className="text-xs text-muted-foreground">per gram (₹)</span>
                  </Label>
                  <Input type="number" step="0.01" {...register(field)} />
                  {errors[field] && (
                    <p className="text-xs text-destructive">
                      {errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea {...register("notes")} rows={2} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Rates"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate History (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>24K</TableHead>
                <TableHead>22K</TableHead>
                <TableHead>18K</TableHead>
                <TableHead>Silver</TableHead>
                <TableHead>Entered By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{formatDateDDMMYYYY(rate.date)}</TableCell>
                  <TableCell>
                    <IndianCurrency amount={Number(rate.gold24kRate)} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={Number(rate.gold22kRate)} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={Number(rate.gold18kRate)} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={Number(rate.silverRate)} />
                  </TableCell>
                  <TableCell className="text-xs">{rate.enteredBy}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No rate history
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
