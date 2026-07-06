"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CustomerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GSTIN_REGEX, PHONE_REGEX } from "@/lib/utils/validation";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(PHONE_REGEX, "Phone must be exactly 10 digits"),
  phoneAlt: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstin: z
    .string()
    .optional()
    .refine((v) => !v || GSTIN_REGEX.test(v), "Invalid GSTIN format"),
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  customerType: z.nativeEnum(CustomerType).default("RETAIL"),
  creditLimit: z.number().min(0).default(0),
  openingBalance: z.number().default(0),
  notes: z.string().optional(),
});

/** Masks an Aadhar number, keeping only the last 4 digits: XXXX-XXXX-1234 */
function maskAadhar(aadhar: string | undefined): string | null {
  if (!aadhar) return null;
  const digits = aadhar.replace(/\D/g, "");
  if (digits.length < 4) return null;
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

async function nextCustomerCode(): Promise<string> {
  const last = await prisma.customer.findFirst({
    orderBy: { customerCode: "desc" },
    select: { customerCode: true },
  });
  const lastNum = last ? parseInt(last.customerCode.split("-")[1], 10) : 0;
  return `CUS-${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createCustomer(input: z.infer<typeof customerSchema>) {
  const data = customerSchema.parse(input);

  const existing = await prisma.customer.findUnique({
    where: { phone: data.phone },
  });
  if (existing) {
    return {
      success: false as const,
      error: `Phone number already registered to ${existing.name} (${existing.customerCode})`,
    };
  }

  const customerCode = await nextCustomerCode();

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      name: data.name,
      phone: data.phone,
      phoneAlt: data.phoneAlt || null,
      address: data.address ?? "",
      city: data.city || "Tiruppur",
      state: data.state || "Tamil Nadu",
      pincode: data.pincode ?? "",
      gstin: data.gstin || null,
      panNumber: data.panNumber || null,
      aadharNumber: maskAadhar(data.aadharNumber),
      customerType: data.customerType,
      creditLimit: data.creditLimit,
      openingBalance: data.openingBalance,
      notes: data.notes || null,
    },
  });

  revalidatePath("/customers");
  return {
    success: true as const,
    customerId: customer.id,
    customerCode: customer.customerCode,
    name: customer.name,
  };
}

/** Quick-add from the billing screen: name + phone only. */
export async function quickAddCustomer(input: { name: string; phone: string }) {
  const parsed = z
    .object({
      name: z.string().min(1, "Name is required"),
      phone: z.string().regex(PHONE_REGEX, "Phone must be exactly 10 digits"),
    })
    .parse(input);

  return createCustomer({
    ...parsed,
    customerType: "RETAIL",
    creditLimit: 0,
    openingBalance: 0,
  });
}
