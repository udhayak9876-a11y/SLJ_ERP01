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
import { createCustomer } from "@/lib/actions/customers";
import { INDIAN_STATES, validateGSTIN } from "@/lib/utils/customer";
import { CustomerType } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  phoneAlt: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().optional(),
  gstin: z.string().optional(),
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "VIP"]),
  creditLimit: z.coerce.number().min(0),
  openingBalance: z.coerce.number(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CustomerForm() {
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
      city: "Tiruppur",
      state: "Tamil Nadu",
      customerType: "RETAIL",
      creditLimit: 0,
      openingBalance: 0,
    },
  });

  const state = watch("state");
  const customerType = watch("customerType");

  async function onSubmit(data: FormData) {
    if (data.gstin && !validateGSTIN(data.gstin)) {
      toast.error("Invalid GSTIN format");
      return;
    }

    setLoading(true);
    try {
      await createCustomer(data);
      toast.success("Customer created");
      router.push("/customers");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-1">
          <Label>Alt Phone</Label>
          <Input {...register("phoneAlt")} maxLength={10} />
        </div>
        <div className="space-y-1">
          <Label>Customer Type</Label>
          <Select
            value={customerType}
            onValueChange={(v) => setValue("customerType", v as CustomerType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RETAIL">Retail</SelectItem>
              <SelectItem value="WHOLESALE">Wholesale</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Address</Label>
        <Textarea {...register("address")} rows={2} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>City</Label>
          <Input {...register("city")} />
        </div>
        <div className="space-y-1">
          <Label>State</Label>
          <Select value={state} onValueChange={(v) => setValue("state", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Pincode</Label>
          <Input {...register("pincode")} maxLength={6} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>GSTIN</Label>
          <Input {...register("gstin")} placeholder="33AAAAA0000A1Z5" />
        </div>
        <div className="space-y-1">
          <Label>PAN</Label>
          <Input {...register("panNumber")} />
        </div>
        <div className="space-y-1">
          <Label>Aadhar (last 4 stored)</Label>
          <Input {...register("aadharNumber")} maxLength={12} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Credit Limit (₹)</Label>
          <Input type="number" step="0.01" {...register("creditLimit")} />
        </div>
        <div className="space-y-1">
          <Label>Opening Balance (₹)</Label>
          <Input type="number" step="0.01" {...register("openingBalance")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Customer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/customers")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
