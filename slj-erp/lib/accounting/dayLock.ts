import { prisma } from "@/lib/prisma";

export async function isDayLocked(date: Date): Promise<boolean> {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayEnd = await prisma.dayEnd.findUnique({ where: { date: d } });
  return dayEnd?.isDayLocked ?? false;
}

export async function assertDayNotLocked(date: Date): Promise<void> {
  if (await isDayLocked(date)) {
    throw new Error(
      `Day ${date.toLocaleDateString("en-IN")} is locked — no edits allowed`
    );
  }
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
