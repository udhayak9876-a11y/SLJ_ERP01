"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BillStatus, BillType, MakingType, PaymentMode, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { billNumberPrefix, parseBillSequence, formatBillNumber } from "@/lib/utils/billNumber";
import { dateOnlyFromISO } from "@/lib/utils/date";

const lineItemSchema = z.object({
  itemId: z.string().min(1, "Select an item"),
  tagNumber: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  grossWeight: z.number().positive("Gross weight must be positive"),
  stoneWeight: z.number().min(0).default(0),
  netWeight: z.number().min(0),
  wastagePercent: z.number().min(0).default(0),
  wastageWeight: z.number().min(0).default(0),
  totalWeight: z.number().positive(),
  ratePerGram: z.number().positive("Rate must be positive"),
  goldValue: z.number().min(0),
  makingChargeType: z.nativeEnum(MakingType),
  makingChargeValue: z.number().min(0),
  makingChargeAmount: z.number().min(0),
  stoneCharge: z.number().min(0).default(0),
  taxableAmount: z.number().min(0),
  gstRate: z.number().min(0).default(3.0),
  gstAmount: z.number().min(0),
  lineTotal: z.number().min(0),
});

const billSchema = z.object({
  billDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  billType: z.nativeEnum(BillType),
  customerId: z.string().nullable(),
  walkInName: z.string().nullable(),
  paymentMode: z.nativeEnum(PaymentMode),
  subtotal: z.number().min(0),
  cgstAmount: z.number().min(0),
  sgstAmount: z.number().min(0),
  igstAmount: z.number().min(0),
  discountAmount: z.number().min(0),
  roundOff: z.number(),
  totalAmount: z.number().min(0),
  amountPaid: z.number().min(0),
  balanceDue: z.number(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

export type BillInput = z.infer<typeof billSchema>;

/**
 * Generates the next confirmed bill number for the current financial year,
 * inside the given transaction to avoid duplicate numbers.
 */
async function nextBillNumber(
  tx: Prisma.TransactionClient,
  billDate: Date
): Promise<string> {
  const prefix = billNumberPrefix(billDate);
  const last = await tx.salesBill.findFirst({
    where: { billNumber: { startsWith: prefix } },
    orderBy: { billNumber: "desc" },
    select: { billNumber: true },
  });
  const lastSeq = last ? parseBillSequence(last.billNumber) : 0;
  return formatBillNumber(lastSeq + 1, billDate);
}

export async function createBill(input: BillInput, confirm: boolean) {
  const data = billSchema.parse(input);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const billDate = dateOnlyFromISO(data.billDate);

  const bill = await prisma.$transaction(async (tx) => {
    const billNumber = confirm
      ? await nextBillNumber(tx, billDate)
      : `DRAFT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return tx.salesBill.create({
      data: {
        billNumber,
        billDate,
        billType: data.billType,
        customerId: data.customerId,
        walkInName: data.walkInName,
        subtotal: data.subtotal,
        cgstAmount: data.cgstAmount,
        sgstAmount: data.sgstAmount,
        igstAmount: data.igstAmount,
        discountAmount: data.discountAmount,
        roundOff: data.roundOff,
        totalAmount: data.totalAmount,
        amountPaid: data.amountPaid,
        balanceDue: data.balanceDue,
        paymentMode: data.paymentMode,
        status: confirm ? BillStatus.CONFIRMED : BillStatus.DRAFT,
        createdBy: user.email ?? "unknown",
        notes: data.notes || null,
        items: {
          create: data.items.map((item, index) => ({
            ...item,
            tagNumber: item.tagNumber || null,
            sortOrder: index,
          })),
        },
      },
    });
  });

  revalidatePath("/bills");
  revalidatePath("/");
  return { success: true as const, billId: bill.id, billNumber: bill.billNumber };
}

/** Confirms an existing draft bill: assigns a real bill number. */
export async function confirmBill(billId: string) {
  const bill = await prisma.salesBill.findUnique({ where: { id: billId } });
  if (!bill) throw new Error("Bill not found");
  if (bill.status !== BillStatus.DRAFT) {
    return { success: false as const, error: "Only draft bills can be confirmed" };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const billNumber = await nextBillNumber(tx, bill.billDate);
    return tx.salesBill.update({
      where: { id: billId },
      data: { billNumber, status: BillStatus.CONFIRMED },
    });
  });

  revalidatePath("/bills");
  revalidatePath("/");
  return { success: true as const, billNumber: updated.billNumber };
}

/** Cancels a bill (confirmed → cancelled, or discards a draft). */
export async function cancelBill(billId: string) {
  const bill = await prisma.salesBill.findUnique({ where: { id: billId } });
  if (!bill) throw new Error("Bill not found");
  if (bill.status === BillStatus.CANCELLED) {
    return { success: false as const, error: "Bill is already cancelled" };
  }

  await prisma.salesBill.update({
    where: { id: billId },
    data: { status: BillStatus.CANCELLED },
  });

  revalidatePath("/bills");
  revalidatePath("/");
  return { success: true as const };
}
