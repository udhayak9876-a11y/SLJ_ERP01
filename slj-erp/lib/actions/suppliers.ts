"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserEmail } from "@/lib/auth";
import { generateSupplierCode } from "@/lib/utils/documentNumber";
import { revalidatePath } from "next/cache";

async function nextSupplierCode(): Promise<string> {
  const last = await prisma.supplier.findFirst({
    orderBy: { supplierCode: "desc" },
  });
  let seq = 0;
  if (last) {
    const parts = last.supplierCode.split("-");
    seq = parseInt(parts[1], 10) || 0;
  }
  return generateSupplierCode(seq + 1);
}

export async function getSuppliers() {
  return prisma.supplier.findMany({ orderBy: { supplierCode: "asc" } });
}

export async function getActiveSuppliers() {
  return prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { supplierCode: "asc" },
  });
}

export async function createSupplier(data: {
  companyName: string;
  contactPerson?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  panNumber?: string;
  metalTypes?: string[];
  openingBalance?: number;
  notes?: string;
}) {
  const userEmail = await getCurrentUserEmail();
  const supplierCode = await nextSupplierCode();
  const supplier = await prisma.supplier.create({
    data: {
      supplierCode,
      companyName: data.companyName,
      contactPerson: data.contactPerson || null,
      phone: data.phone,
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      gstin: data.gstin || null,
      panNumber: data.panNumber || null,
      metalTypes: data.metalTypes || [],
      openingBalance: data.openingBalance ?? 0,
      notes: data.notes || null,
      createdBy: userEmail,
      updatedBy: userEmail,
    },
  });
  revalidatePath("/stock/suppliers");
  return supplier;
}

export async function toggleSupplierActive(id: string, isActive: boolean) {
  const userEmail = await getCurrentUserEmail();
  await prisma.supplier.update({
    where: { id },
    data: { isActive, updatedBy: userEmail },
  });
  revalidatePath("/stock/suppliers");
}
