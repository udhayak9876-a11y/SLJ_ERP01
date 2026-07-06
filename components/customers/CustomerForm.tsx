"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerType } from "@prisma/client";
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
import { createCustomer } from "@/lib/actions/customers";
import { GSTIN_REGEX, PHONE_REGEX } from "@/lib/utils/validation";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(PHONE_REGEX, "Phone must be exactly 10 digits"),
  phoneAlt: z
    .string()
    .refine((v) => !v || PHONE_REGEX.test(v), "Must be 10 digits")
    .optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstin: z
    .string()
    .refine((v) => !v || GSTIN_REGEX.test(v), "Invalid GSTIN format")
    .optional(),
  panNumber: z.string().optional(),
  aadharNumber: z
    .string()
    .refine(
      (v) => !v || /^\d{12}$/.test(v.replace(/\D/g, "")),
      "Aadhar must be 12 digits"
    )
    .optional(),
  customerType: z.nativeEnum(CustomerType),
  creditLimit: z.coerce.number().min(0, "Cannot be negative"),
  openingBalance: z.coerce.number(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CustomerForm() {
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
      city: "Tiruppur",
      state: "Tamil Nadu",
      customerType: "RETAIL",
      creditLimit: 0,
      openingBalance: 0,
    },
    mode: "onBlur",
  });

  const customerType = watch("customerType");

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const result = await createCustomer({
        ...values,
        gstin: values.gstin || undefined,
      });
      if (!result.success) {
        toast({ title: result.error, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({
        title: `Customer saved as ${result.customerCode}`,
        variant: "success",
      });
      router.push("/customers");
      router.refresh();
    } catch {
      toast({ title: "Failed to save customer", variant: "destructive" });
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone * (10 digits)</Label>
          <Input id="phone" inputMode="numeric" maxLength={10} {...register("phone")} />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phoneAlt">Alternate Phone</Label>
          <Input id="phoneAlt" inputMode="numeric" maxLength={10} {...register("phoneAlt")} />
          {errors.phoneAlt && (
            <p className="text-xs text-red-600">{errors.phoneAlt.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" rows={2} {...register("address")} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
          <p className="text-xs text-muted-foreground">
            Determines CGST/SGST vs IGST on bills
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" {...register("pincode")} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="gstin">GSTIN</Label>
          <Input id="gstin" className="uppercase" {...register("gstin")} />
          {errors.gstin && (
            <p className="text-xs text-red-600">{errors.gstin.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="panNumber">PAN Number</Label>
          <Input id="panNumber" className="uppercase" {...register("panNumber")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="aadharNumber">Aadhar Number</Label>
          <Input
            id="aadharNumber"
            inputMode="numeric"
            maxLength={12}
            placeholder="Stored masked"
            {...register("aadharNumber")}
          />
          {errors.aadharNumber && (
            <p className="text-xs text-red-600">{errors.aadharNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
          <Input
            id="creditLimit"
            type="number"
            step="0.01"
            min="0"
            {...register("creditLimit")}
          />
          {errors.creditLimit && (
            <p className="text-xs text-red-600">{errors.creditLimit.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="openingBalance">Opening Balance (₹)</Label>
          <Input
            id="openingBalance"
            type="number"
            step="0.01"
            {...register("openingBalance")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} {...register("notes")} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Customer"}
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
