"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { updateShopSettings } from "@/lib/actions/settings";
import { GSTIN_REGEX } from "@/lib/utils/validation";

const schema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email").or(z.literal("")),
  gstin: z
    .string()
    .refine((v) => !v || GSTIN_REGEX.test(v), "Invalid GSTIN format"),
  bankDetails: z.string(),
  logoUrl: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function SettingsForm({ settings }: { settings: FormValues }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: settings,
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      await updateShopSettings(values);
      toast({ title: "Settings saved", variant: "success" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="shopName">Shop Name *</Label>
        <Input id="shopName" {...register("shopName")} />
        {errors.shopName && (
          <p className="text-xs text-red-600">{errors.shopName.message}</p>
        )}
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
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" {...register("pincode")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="gstin">GSTIN</Label>
        <Input
          id="gstin"
          placeholder="33XXXXX0000X1Z0"
          className="uppercase"
          {...register("gstin")}
        />
        {errors.gstin && (
          <p className="text-xs text-red-600">{errors.gstin.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bankDetails">Bank Details (printed on invoice)</Label>
        <Textarea id="bankDetails" rows={3} {...register("bankDetails")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" {...register("logoUrl")} />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
