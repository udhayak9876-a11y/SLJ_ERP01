"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getShopSettings() {
  let settings = await prisma.shopSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: { id: "singleton" },
    });
  }

  return settings;
}

export async function updateShopSettings(data: {
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
  const settings = await prisma.shopSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return settings;
}
