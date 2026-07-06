"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  phone: z.string(),
  email: z.string(),
  gstin: z.string(),
  bankDetails: z.string(),
  logoUrl: z.string(),
});

export async function updateShopSettings(input: z.infer<typeof settingsSchema>) {
  const data = settingsSchema.parse(input);

  await prisma.shopSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/", "layout");
  return { success: true as const };
}
