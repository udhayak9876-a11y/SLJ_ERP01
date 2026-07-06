"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quickAddCustomer } from "@/lib/actions/customers";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits"),
});

type FormData = z.infer<typeof schema>;

export interface QuickAddCustomerResult {
  customerId: string;
  customerCode: string;
  name: string;
}

interface QuickAddCustomerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customer: QuickAddCustomerResult) => void;
}

export function QuickAddCustomer({
  open,
  onOpenChange,
  onSuccess,
}: QuickAddCustomerProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const customer = await quickAddCustomer(data);
      toast.success(`Customer ${customer.customerCode} created`);
      onSuccess({
        customerId: customer.id,
        customerCode: customer.customerCode,
        name: customer.name,
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Phone *</Label>
            <Input {...register("phone")} maxLength={10} />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Add Customer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
