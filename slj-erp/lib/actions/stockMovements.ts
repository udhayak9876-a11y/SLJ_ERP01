"use server";

import { prisma } from "@/lib/prisma";
import { StockMovementType } from "@prisma/client";

export interface MovementFilters {
  search?: string;
  movementType?: StockMovementType | "ALL";
  fromDate?: Date;
  toDate?: Date;
}

export async function getStockMovements(filters: MovementFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.movementType && filters.movementType !== "ALL") {
    where.movementType = filters.movementType;
  }
  if (filters.fromDate || filters.toDate) {
    where.date = {};
    if (filters.fromDate) {
      (where.date as Record<string, Date>).gte = filters.fromDate;
    }
    if (filters.toDate) {
      (where.date as Record<string, Date>).lte = filters.toDate;
    }
  }
  if (filters.search) {
    where.tag = {
      tagId: { contains: filters.search, mode: "insensitive" },
    };
  }

  return prisma.stockMovement.findMany({
    where,
    include: {
      tag: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}
