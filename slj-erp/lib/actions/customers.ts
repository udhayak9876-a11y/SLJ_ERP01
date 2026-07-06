"use server";

import { prisma } from "@/lib/prisma";
import { CustomerType } from "@prisma/client";
import { maskAadhar, validateGSTIN } from "@/lib/utils/customer";
import { revalidatePath } from "next/cache";

async function generateCustomerCode(): Promise<string> {
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { customerCode: "desc" },
  });

  let nextNum = 1;
  if (lastCustomer) {
    const parts = lastCustomer.customerCode.split("-");
    nextNum = (parseInt(parts[1], 10) || 0) + 1;
  }

  return `CUS-${nextNum.toString().padStart(4, "0")}`;
}

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { customerCode: "asc" },
  });
}

export async function getActiveCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { customerCode: "asc" },
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  phoneAlt?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  panNumber?: string;
  aadharNumber?: string;
  customerType?: CustomerType;
  creditLimit?: number;
  openingBalance?: number;
  notes?: string;
}) {
  if (data.gstin && !validateGSTIN(data.gstin)) {
    throw new Error("Invalid GSTIN format");
  }

  const existing = await prisma.customer.findUnique({
    where: { phone: data.phone },
  });
  if (existing) {
    throw new Error("Phone number already exists");
  }

  const customerCode = await generateCustomerCode();
  const customer = await prisma.customer.create({
    data: {
      customerCode,
      name: data.name,
      phone: data.phone,
      phoneAlt: data.phoneAlt || null,
      address: data.address || "",
      city: data.city || "Tiruppur",
      state: data.state || "Tamil Nadu",
      pincode: data.pincode || "",
      gstin: data.gstin?.toUpperCase() || null,
      panNumber: data.panNumber?.toUpperCase() || null,
      aadharNumber: data.aadharNumber
        ? maskAadhar(data.aadharNumber)
        : null,
      customerType: data.customerType || "RETAIL",
      creditLimit: data.creditLimit || 0,
      openingBalance: data.openingBalance || 0,
      notes: data.notes || null,
    },
  });

  revalidatePath("/customers");
  return customer;
}

export async function quickAddCustomer(data: { name: string; phone: string }) {
  return createCustomer(data);
}

export async function toggleCustomerActive(id: string, isActive: boolean) {
  await prisma.customer.update({ where: { id }, data: { isActive } });
  revalidatePath("/customers");
}
