"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  phoneAlt: z.string().optional(),
  address: z.string().optional(),
  city: z.string().default("Tiruppur"),
  state: z.string().default("Tamil Nadu"),
  pincode: z.string().optional(),
  gstin: z.string().optional().refine((v) => !v || gstinRegex.test(v), "Invalid GSTIN"),
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "VIP"]).default("RETAIL"),
  creditLimit: z.coerce.number().default(0),
  openingBalance: z.coerce.number().default(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
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

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) router.push("/customers");
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">Add New Customer</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md border p-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div><label className="mb-1 block text-sm">Name</label><Input {...register("name")} />{errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}</div>
          <div><label className="mb-1 block text-sm">Phone</label><Input {...register("phone")} />{errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}</div>
          <div><label className="mb-1 block text-sm">Alternate Phone</label><Input {...register("phoneAlt")} /></div>
          <div><label className="mb-1 block text-sm">Address</label><Input {...register("address")} /></div>
          <div><label className="mb-1 block text-sm">City</label><Input {...register("city")} /></div>
          <div><label className="mb-1 block text-sm">State</label><Input {...register("state")} /></div>
          <div><label className="mb-1 block text-sm">Pincode</label><Input {...register("pincode")} /></div>
          <div><label className="mb-1 block text-sm">GSTIN</label><Input {...register("gstin")} />{errors.gstin ? <p className="text-xs text-red-600">{errors.gstin.message}</p> : null}</div>
          <div><label className="mb-1 block text-sm">PAN Number</label><Input {...register("panNumber")} /></div>
          <div><label className="mb-1 block text-sm">Aadhar Number</label><Input {...register("aadharNumber")} /></div>
          <div><label className="mb-1 block text-sm">Customer Type</label><Select {...register("customerType")}><option value="RETAIL">Retail</option><option value="WHOLESALE">Wholesale</option><option value="VIP">VIP</option></Select></div>
          <div><label className="mb-1 block text-sm">Credit Limit</label><Input type="number" {...register("creditLimit")} /></div>
          <div><label className="mb-1 block text-sm">Opening Balance</label><Input type="number" {...register("openingBalance")} /></div>
          <div className="md:col-span-2"><label className="mb-1 block text-sm">Notes</label><Input {...register("notes")} /></div>
        </div>
        <Button type="submit">Save Customer</Button>
      </form>
    </div>
  );
}
