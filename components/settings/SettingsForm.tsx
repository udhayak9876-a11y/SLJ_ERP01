"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateShopSettings } from "@/lib/actions/settings";
import { ShopSettings } from "@prisma/client";

interface SettingsFormProps {
  settings: ShopSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      shopName: settings.shopName,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      pincode: settings.pincode,
      phone: settings.phone,
      email: settings.email,
      gstin: settings.gstin,
      bankDetails: settings.bankDetails,
      logoUrl: settings.logoUrl,
    },
  });

  async function onSubmit(data: {
    shopName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    gstin: string;
    bankDetails: string;
    logoUrl: string;
  }) {
    setLoading(true);
    try {
      await updateShopSettings(data);
      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Shop Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Shop Name</Label>
            <Input {...register("shopName")} />
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
              <Input {...register("state")} />
            </div>
            <div className="space-y-1">
              <Label>Pincode</Label>
              <Input {...register("pincode")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input {...register("email")} type="email" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>GSTIN</Label>
            <Input {...register("gstin")} />
          </div>
          <div className="space-y-1">
            <Label>Bank Details</Label>
            <Textarea {...register("bankDetails")} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Logo URL</Label>
            <Input {...register("logoUrl")} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
