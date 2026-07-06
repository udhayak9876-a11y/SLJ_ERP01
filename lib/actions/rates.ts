"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { todayDateOnly } from "@/lib/utils/date";

const rateSchema = z.object({
  gold24kRate: z.number().positive("Rate must be positive"),
  gold22kRate: z.number().positive("Rate must be positive"),
  gold18kRate: z.number().positive("Rate must be positive"),
  silverRate: z.number().positive("Rate must be positive"),
  notes: z.string().optional(),
});

export async function saveTodayRate(input: z.infer<typeof rateSchema>) {
  const data = rateSchema.parse(input);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await prisma.dailyRate.upsert({
    where: { date: todayDateOnly() },
    update: { ...data, enteredBy: user.email ?? "unknown" },
    create: {
      date: todayDateOnly(),
      ...data,
      enteredBy: user.email ?? "unknown",
    },
  });

  revalidatePath("/", "layout");
  return { success: true as const };
}
