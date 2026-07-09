"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/accounting/dayLock";
import { formatDateDDMMYYYY, toISODate } from "@/lib/utils/date";
import { getMonthRange } from "@/lib/utils/reportPeriod";
import type { Category, PaymentMode } from "@prisma/client";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function getConfirmedSalesBills(from: Date, to: Date) {
  return prisma.salesBill.findMany({
    where: {
      status: "CONFIRMED",
      billDate: { gte: from, lte: to },
    },
    include: {
      customer: true,
      items: { include: { item: true } },
    },
    orderBy: [{ billDate: "asc" }, { billNumber: "asc" }],
  });
}

function isB2B(gstin: string | null | undefined): boolean {
  return Boolean(gstin && gstin.trim().length >= 15);
}

function placeOfSupply(state: string | null | undefined): string {
  return state?.trim() || "Tamil Nadu";
}

function customerName(
  customer: { name: string } | null,
  walkInName: string | null
): string {
  return customer?.name ?? walkInName ?? "Walk-in Customer";
}

export interface Gstr1B2BRow {
  gstin: string;
  receiverName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply: string;
  reverseCharge: string;
  invoiceType: string;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface Gstr1B2CRow {
  placeOfSupply: string;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  invoiceCount: number;
}

export interface Gstr1Report {
  periodLabel: string;
  b2b: Gstr1B2BRow[];
  b2c: Gstr1B2CRow[];
  totals: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    invoiceValue: number;
  };
}

export async function getGstr1Report(
  year: number,
  month: number
): Promise<Gstr1Report> {
  const { start, end } = getMonthRange(year, month);
  const bills = await getConfirmedSalesBills(start, end);

  const b2b: Gstr1B2BRow[] = [];
  const b2cMap = new Map<string, Gstr1B2CRow>();

  for (const bill of bills) {
    const taxable = Number(bill.subtotal) - Number(bill.discountAmount);
    const cgst = Number(bill.cgstAmount);
    const sgst = Number(bill.sgstAmount);
    const igst = Number(bill.igstAmount);
    const pos = placeOfSupply(bill.customer?.state);
    const rate = taxable > 0 ? round2(((cgst + sgst + igst) / taxable) * 100) : 3;

    if (isB2B(bill.customer?.gstin)) {
      b2b.push({
        gstin: bill.customer!.gstin!,
        receiverName: bill.customer!.name,
        invoiceNumber: bill.billNumber ?? bill.id,
        invoiceDate: formatDateDDMMYYYY(bill.billDate),
        invoiceValue: Number(bill.totalAmount),
        placeOfSupply: pos,
        reverseCharge: "N",
        invoiceType: "Regular",
        rate,
        taxableValue: round2(taxable),
        cgst,
        sgst,
        igst,
      });
    } else {
      const key = `${pos}|${rate}`;
      const existing = b2cMap.get(key) ?? {
        placeOfSupply: pos,
        rate,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        invoiceCount: 0,
      };
      existing.taxableValue = round2(existing.taxableValue + taxable);
      existing.cgst = round2(existing.cgst + cgst);
      existing.sgst = round2(existing.sgst + sgst);
      existing.igst = round2(existing.igst + igst);
      existing.invoiceCount += 1;
      b2cMap.set(key, existing);
    }
  }

  const b2c = Array.from(b2cMap.values());
  const totals = {
    taxableValue: round2(
      b2b.reduce((s, r) => s + r.taxableValue, 0) +
        b2c.reduce((s, r) => s + r.taxableValue, 0)
    ),
    cgst: round2(
      b2b.reduce((s, r) => s + r.cgst, 0) + b2c.reduce((s, r) => s + r.cgst, 0)
    ),
    sgst: round2(
      b2b.reduce((s, r) => s + r.sgst, 0) + b2c.reduce((s, r) => s + r.sgst, 0)
    ),
    igst: round2(
      b2b.reduce((s, r) => s + r.igst, 0) + b2c.reduce((s, r) => s + r.igst, 0)
    ),
    invoiceValue: round2(bills.reduce((s, b) => s + Number(b.totalAmount), 0)),
  };

  return {
    periodLabel: new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    b2b,
    b2c,
    totals,
  };
}

export interface Gstr3BReport {
  periodLabel: string;
  outwardTaxable: number;
  outwardCgst: number;
  outwardSgst: number;
  outwardIgst: number;
  totalTaxPayable: number;
  note: string;
}

export async function getGstr3BSummary(
  year: number,
  month: number
): Promise<Gstr3BReport> {
  const gstr1 = await getGstr1Report(year, month);
  const totalTax =
    gstr1.totals.cgst + gstr1.totals.sgst + gstr1.totals.igst;

  return {
    periodLabel: gstr1.periodLabel,
    outwardTaxable: gstr1.totals.taxableValue,
    outwardCgst: gstr1.totals.cgst,
    outwardSgst: gstr1.totals.sgst,
    outwardIgst: gstr1.totals.igst,
    totalTaxPayable: round2(totalTax),
    note: "Input tax credit from purchases is not tracked in this module. ITC shown as ₹0 — verify with purchase invoices manually.",
  };
}

export interface HsnSummaryRow {
  hsnCode: string;
  description: string;
  uqc: string;
  totalQuantity: number;
  totalValue: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineCount: number;
}

export async function getHsnSummary(
  year: number,
  month: number
): Promise<{ periodLabel: string; rows: HsnSummaryRow[] }> {
  const { start, end } = getMonthRange(year, month);
  const bills = await getConfirmedSalesBills(start, end);

  const map = new Map<string, HsnSummaryRow>();

  for (const bill of bills) {
    const billTaxable = Number(bill.subtotal) - Number(bill.discountAmount);
    const billGst =
      Number(bill.cgstAmount) + Number(bill.sgstAmount) + Number(bill.igstAmount);

    for (const line of bill.items) {
      const hsn = line.item.hsnCode || "7113";
      const key = hsn;
      const lineTaxable = Number(line.taxableAmount);
      const lineGst = Number(line.gstAmount);
      const share =
        billTaxable > 0 ? lineTaxable / billTaxable : 1 / bill.items.length;
      const cgst = round2(Number(bill.cgstAmount) * share);
      const sgst = round2(Number(bill.sgstAmount) * share);
      const igst = round2(Number(bill.igstAmount) * share);

      const existing = map.get(key) ?? {
        hsnCode: hsn,
        description: categoryLabel(line.item.category),
        uqc: line.item.category === "GOLD" || line.item.category === "SILVER" ? "GMS" : "PCS",
        totalQuantity: 0,
        totalValue: 0,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        lineCount: 0,
      };

      existing.totalQuantity = round2(
        existing.totalQuantity +
          (line.item.category === "GOLD" || line.item.category === "SILVER"
            ? Number(line.netWeight)
            : 1)
      );
      existing.totalValue = round2(existing.totalValue + Number(line.lineTotal));
      existing.taxableValue = round2(existing.taxableValue + lineTaxable);
      existing.cgst = round2(existing.cgst + cgst);
      existing.sgst = round2(existing.sgst + sgst);
      existing.igst = round2(existing.igst + igst);
      existing.lineCount += 1;
      map.set(key, existing);

      void billGst;
      void lineGst;
    }
  }

  return {
    periodLabel: new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    rows: Array.from(map.values()).sort((a, b) => a.hsnCode.localeCompare(b.hsnCode)),
  };
}

function categoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    GOLD: "Gold Jewellery",
    SILVER: "Silver Jewellery",
    DIAMOND: "Diamond Jewellery",
    STONE: "Stone Jewellery",
    OTHER: "Other Jewellery",
  };
  return labels[category] ?? "Jewellery";
}

export interface SalesRegisterRow {
  billNumber: string;
  billDate: string;
  customerName: string;
  gstin: string;
  type: "B2B" | "B2C";
  itemCount: number;
  goldWeight: number;
  silverWeight: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  paymentMode: PaymentMode;
}

export async function getSalesRegister(
  year: number,
  month: number,
  filter?: "ALL" | "B2B" | "B2C"
): Promise<{ periodLabel: string; rows: SalesRegisterRow[] }> {
  const { start, end } = getMonthRange(year, month);
  const bills = await getConfirmedSalesBills(start, end);

  let rows: SalesRegisterRow[] = bills.map((bill) => {
    const taxable = round2(Number(bill.subtotal) - Number(bill.discountAmount));
    let goldWeight = 0;
    let silverWeight = 0;
    for (const line of bill.items) {
      if (line.item.category === "GOLD") goldWeight += Number(line.netWeight);
      if (line.item.category === "SILVER") silverWeight += Number(line.netWeight);
    }
    const b2b = isB2B(bill.customer?.gstin);
    return {
      billNumber: bill.billNumber ?? "—",
      billDate: formatDateDDMMYYYY(bill.billDate),
      customerName: customerName(bill.customer, bill.walkInName),
      gstin: bill.customer?.gstin ?? "—",
      type: b2b ? "B2B" : "B2C",
      itemCount: bill.items.length,
      goldWeight: round2(goldWeight),
      silverWeight: round2(silverWeight),
      taxableAmount: taxable,
      cgst: Number(bill.cgstAmount),
      sgst: Number(bill.sgstAmount),
      igst: Number(bill.igstAmount),
      totalAmount: Number(bill.totalAmount),
      paymentMode: bill.paymentMode,
    };
  });

  if (filter === "B2B") rows = rows.filter((r) => r.type === "B2B");
  if (filter === "B2C") rows = rows.filter((r) => r.type === "B2C");

  return {
    periodLabel: new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    rows,
  };
}

export interface DailySalesSummary {
  date: string;
  dateISO: string;
  sales: {
    billNumber: string;
    customerName: string;
    itemCount: number;
    goldWeight: number;
    silverWeight: number;
    totalAmount: number;
    amountPaid: number;
    paymentMode: PaymentMode;
    discount: number;
    roundOff: number;
  }[];
  metalSummary: {
    category: string;
    grossWeight: number;
    netWeight: number;
    pieces: number;
  }[];
  paymentSummary: Record<PaymentMode, number>;
  oldGoldPurchases: {
    voucherNumber: string;
    customerName: string;
    metalType: string;
    karat: string;
    netWeight: number;
    amount: number;
    paymentMode: PaymentMode;
  }[];
  chitCollections: {
    receiptNumber: string;
    memberName: string;
    schemeName: string;
    instalmentNumber: number;
    amount: number;
    paymentMode: PaymentMode;
  }[];
  adjustments: {
    label: string;
    amount: number;
    type: "ADD" | "LESS";
  }[];
  totals: {
    salesCount: number;
    salesAmount: number;
    goldWeight: number;
    silverWeight: number;
    oldGoldAmount: number;
    oldGoldWeight: number;
    chitCollection: number;
    totalCollected: number;
    discountTotal: number;
    roundOffNet: number;
  };
}

export async function getDailySalesSummary(date: Date): Promise<DailySalesSummary> {
  const d = startOfDay(date);

  const [bills, oldMetal, chitPayments] = await Promise.all([
    prisma.salesBill.findMany({
      where: { billDate: d, status: "CONFIRMED" },
      include: {
        customer: true,
        items: { include: { item: true } },
      },
      orderBy: { billNumber: "asc" },
    }),
    prisma.oldMetalPurchase.findMany({
      where: { voucherDate: d },
      include: { customer: true },
      orderBy: { voucherNumber: "asc" },
    }),
    prisma.chitPayment.findMany({
      where: { paymentDate: d },
      include: {
        member: { include: { customer: true, scheme: true } },
      },
      orderBy: { receiptNumber: "asc" },
    }),
  ]);

  const metalMap = new Map<
    string,
    { category: string; grossWeight: number; netWeight: number; pieces: number }
  >();

  const paymentSummary: Record<PaymentMode, number> = {
    CASH: 0,
    CARD: 0,
    UPI: 0,
    CHEQUE: 0,
    MULTIPLE: 0,
  };

  let discountTotal = 0;
  let roundOffNet = 0;
  let totalGold = 0;
  let totalSilver = 0;

  const sales = bills.map((bill) => {
    let goldWeight = 0;
    let silverWeight = 0;
    for (const line of bill.items) {
      const cat = line.item.category;
      const key = cat;
      const existing = metalMap.get(key) ?? {
        category: categoryLabel(cat),
        grossWeight: 0,
        netWeight: 0,
        pieces: 0,
      };
      existing.grossWeight = round2(existing.grossWeight + Number(line.grossWeight));
      existing.netWeight = round2(existing.netWeight + Number(line.netWeight));
      existing.pieces += 1;
      metalMap.set(key, existing);

      if (cat === "GOLD") goldWeight += Number(line.netWeight);
      if (cat === "SILVER") silverWeight += Number(line.netWeight);
    }

    totalGold += goldWeight;
    totalSilver += silverWeight;
    paymentSummary[bill.paymentMode] = round2(
      paymentSummary[bill.paymentMode] + Number(bill.amountPaid)
    );
    discountTotal = round2(discountTotal + Number(bill.discountAmount));
    roundOffNet = round2(roundOffNet + Number(bill.roundOff));

    return {
      billNumber: bill.billNumber ?? "—",
      customerName: customerName(bill.customer, bill.walkInName),
      itemCount: bill.items.length,
      goldWeight: round2(goldWeight),
      silverWeight: round2(silverWeight),
      totalAmount: Number(bill.totalAmount),
      amountPaid: Number(bill.amountPaid),
      paymentMode: bill.paymentMode,
      discount: Number(bill.discountAmount),
      roundOff: Number(bill.roundOff),
    };
  });

  for (const p of chitPayments) {
    paymentSummary[p.paymentMode] = round2(
      paymentSummary[p.paymentMode] + Number(p.amount)
    );
  }

  const adjustments: DailySalesSummary["adjustments"] = [];
  if (discountTotal > 0) {
    adjustments.push({ label: "Bill Discount", amount: discountTotal, type: "LESS" });
  }
  if (roundOffNet !== 0) {
    adjustments.push({
      label: "Round Off",
      amount: Math.abs(roundOffNet),
      type: roundOffNet >= 0 ? "ADD" : "LESS",
    });
  }

  const oldGoldPurchases = oldMetal.map((row) => ({
    voucherNumber: row.voucherNumber ?? "—",
    customerName: row.customer?.name ?? row.customerName ?? "Walk-in",
    metalType: row.metalType,
    karat: row.karat ?? "—",
    netWeight: Number(row.netWeight),
    amount: Number(row.totalAmount),
    paymentMode: row.paymentMode,
  }));

  const chitCollections = chitPayments.map((p) => ({
    receiptNumber: p.receiptNumber,
    memberName: p.member.customer.name,
    schemeName: p.member.scheme.schemeName,
    instalmentNumber: p.instalmentNumber,
    amount: Number(p.amount),
    paymentMode: p.paymentMode,
  }));

  const salesAmount = round2(bills.reduce((s, b) => s + Number(b.totalAmount), 0));
  const oldGoldAmount = round2(oldMetal.reduce((s, r) => s + Number(r.totalAmount), 0));
  const chitCollection = round2(chitPayments.reduce((s, p) => s + Number(p.amount), 0));
  const totalCollected = round2(
    bills.reduce((s, b) => s + Number(b.amountPaid), 0) + chitCollection
  );

  return {
    date: formatDateDDMMYYYY(d),
    dateISO: toISODate(d),
    sales,
    metalSummary: Array.from(metalMap.values()),
    paymentSummary,
    oldGoldPurchases,
    chitCollections,
    adjustments,
    totals: {
      salesCount: bills.length,
      salesAmount,
      goldWeight: round2(totalGold),
      silverWeight: round2(totalSilver),
      oldGoldAmount,
      oldGoldWeight: round2(oldMetal.reduce((s, r) => s + Number(r.netWeight), 0)),
      chitCollection,
      totalCollected,
      discountTotal,
      roundOffNet,
    },
  };
}

export async function buildGstr1Csv(year: number, month: number): Promise<string> {
  const report = await getGstr1Report(year, month);
  const lines: string[] = [];

  lines.push("GSTR-1 Export — Sri Lakshmi Jewellery");
  lines.push(`Period,${report.periodLabel}`);
  lines.push("");

  lines.push("B2B Invoices");
  lines.push(
    "GSTIN,Receiver Name,Invoice Number,Invoice Date,Invoice Value,Place of Supply,Reverse Charge,Invoice Type,Rate,Taxable Value,CGST,SGST,IGST"
  );
  for (const row of report.b2b) {
    lines.push(
      [
        row.gstin,
        csvEscape(row.receiverName),
        row.invoiceNumber,
        row.invoiceDate,
        row.invoiceValue,
        csvEscape(row.placeOfSupply),
        row.reverseCharge,
        row.invoiceType,
        row.rate,
        row.taxableValue,
        row.cgst,
        row.sgst,
        row.igst,
      ].join(",")
    );
  }

  lines.push("");
  lines.push("B2C Summary (Consolidated)");
  lines.push(
    "Place of Supply,Rate,Taxable Value,CGST,SGST,IGST,Invoice Count"
  );
  for (const row of report.b2c) {
    lines.push(
      [
        csvEscape(row.placeOfSupply),
        row.rate,
        row.taxableValue,
        row.cgst,
        row.sgst,
        row.igst,
        row.invoiceCount,
      ].join(",")
    );
  }

  lines.push("");
  lines.push("Totals");
  lines.push(
    `Taxable Value,${report.totals.taxableValue},CGST,${report.totals.cgst},SGST,${report.totals.sgst},IGST,${report.totals.igst},Invoice Value,${report.totals.invoiceValue}`
  );

  return lines.join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
