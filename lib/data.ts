import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/utils/date";

/** Fetches the singleton shop settings row, creating it with defaults if missing. */
export async function getShopSettings() {
  return prisma.shopSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

/** Today's daily rate, or null if not entered yet. */
export async function getTodayRate() {
  return prisma.dailyRate.findUnique({
    where: { date: todayDateOnly() },
  });
}
