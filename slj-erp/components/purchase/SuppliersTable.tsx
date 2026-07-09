"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Supplier } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createSupplier, toggleSupplierActive } from "@/lib/actions/suppliers";
import { IndianCurrency } from "@/components/shared/IndianCurrency";

const schema = z.object({
  companyName: z.string().min(1),
  contactPerson: z.string().optional(),
  phone: z.string().min(10).max(10),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gstin: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SuppliersTableProps {
  suppliers: Supplier[];
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await createSupplier(data);
      toast.success("Supplier created");
      reset();
      setOpen(false);
      window.location.reload();
    } catch {
      toast.error("Failed to create supplier");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Supplier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Supplier</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label>Company Name</Label>
                <Input {...register("companyName")} />
                {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
              </div>
              <div>
                <Label>Phone (10 digits)</Label>
                <Input {...register("phone")} maxLength={10} />
              </div>
              <div>
                <Label>Contact Person</Label>
                <Input {...register("contactPerson")} />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input {...register("gstin")} />
              </div>
              <Button type="submit" disabled={loading}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-xs">{s.supplierCode}</TableCell>
              <TableCell>{s.companyName}</TableCell>
              <TableCell>{s.phone}</TableCell>
              <TableCell>{s.gstin ?? "—"}</TableCell>
              <TableCell><IndianCurrency amount={Number(s.openingBalance)} /></TableCell>
              <TableCell><Badge variant="secondary">{s.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => toggleSupplierActive(s.id, !s.isActive).then(() => window.location.reload())}>
                  {s.isActive ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {suppliers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No suppliers — add your first dealer
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
