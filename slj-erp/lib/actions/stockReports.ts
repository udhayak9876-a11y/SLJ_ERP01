"use server";

import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

const ACTIVE_STATUSES = ["RECEIVED", "COUNTER_ASSIGNED"] as const;

export async function getBalanceStockReport() {
  const tags = await prisma.tag.findMany({
    where: { status: { in: [...ACTIVE_STATUSES] } },
    include: { product: true },
  });

  const byCategory = new Map<
    Category,
    { pieces: number; weight: number; value: number }
  >();

  for (const tag of tags) {
    const cat = tag.product.category;
    const existing = byCategory.get(cat) ?? { pieces: 0, weight: 0, value: 0 };
    const rate = Number(tag.purchaseRate ?? tag.mrp ?? 0);
    existing.pieces += 1;
    existing.weight += Number(tag.netWeight);
    existing.value += Number(tag.netWeight) * rate;
    byCategory.set(cat, existing);
  }

  const rows = Array.from(byCategory.entries()).map(([category, stats]) => ({
    category,
    ...stats,
  }));

  const totals = rows.reduce(
    (acc, r) => ({
      pieces: acc.pieces + r.pieces,
      weight: acc.weight + r.weight,
      value: acc.value + r.value,
    }),
    { pieces: 0, weight: 0, value: 0 }
  );

  return { rows, totals };
}

export async function getNonMovingStockReport(daysThreshold = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysThreshold);

  const tags = await prisma.tag.findMany({
    where: {
      status: { in: [...ACTIVE_STATUSES] },
      receivedDate: { lte: cutoff },
    },
    include: { product: true, counter: true, lot: true },
    orderBy: { receivedDate: "asc" },
  });

  const today = new Date();
  return tags.map((tag) => {
    const daysUnsold = Math.floor(
      (today.getTime() - new Date(tag.receivedDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const rate = Number(tag.purchaseRate ?? tag.mrp ?? 0);
    return {
      tag,
      daysUnsold,
      value: Number(tag.netWeight) * rate,
    };
  });
}

export async function getWeightSummaryByCategory() {
  const tags = await prisma.tag.findMany({
    where: { status: { in: [...ACTIVE_STATUSES] } },
    include: { product: true },
  });

  const summary = new Map<string, { pieces: number; weight: number }>();
  for (const tag of tags) {
    const key = tag.product.itemName;
    const existing = summary.get(key) ?? { pieces: 0, weight: 0 };
    existing.pieces += 1;
    existing.weight += Number(tag.netWeight);
    summary.set(key, existing);
  }

  return Array.from(summary.entries())
    .map(([productName, stats]) => ({ productName, ...stats }))
    .sort((a, b) => b.weight - a.weight);
}

export async function getDiamondStoneReport() {
  return prisma.tag.findMany({
    where: {
      stoneCount: { gt: 0 },
      status: { in: [...ACTIVE_STATUSES] },
    },
    include: { product: true, counter: true },
    orderBy: { tagId: "asc" },
  });
}

export async function getStockDashboardStats() {
  const activeTags = await prisma.tag.findMany({
    where: { status: { in: [...ACTIVE_STATUSES] } },
    select: { netWeight: true, purchaseRate: true, mrp: true },
  });

  const pieces = activeTags.length;
  const weight = activeTags.reduce((s, t) => s + Number(t.netWeight), 0);
  const value = activeTags.reduce((s, t) => {
    const rate = Number(t.purchaseRate ?? t.mrp ?? 0);
    return s + Number(t.netWeight) * rate;
  }, 0);

  const missingHuid = await prisma.tag.count({
    where: {
      huidNumber: null,
      status: { in: [...ACTIVE_STATUSES] },
      product: { category: "GOLD" },
    },
  });

  return { pieces, weight, value, missingHuid };
}
