"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type BillItemRow = {
  itemId: string;
  description: string;
  tagNumber: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  wastagePercent: number;
  wastageWeight: number;
  totalWeight: number;
  ratePerGram: number;
  goldValue: number;
  makingChargeType: "PER_GRAM" | "PERCENTAGE" | "FIXED";
  makingChargeValue: number;
  makingChargeAmount: number;
  stoneCharge: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  lineTotal: number;
};

export function emptyRow(): BillItemRow {
  return {
    itemId: "",
    description: "",
    tagNumber: "",
    grossWeight: 0,
    stoneWeight: 0,
    netWeight: 0,
    wastagePercent: 0,
    wastageWeight: 0,
    totalWeight: 0,
    ratePerGram: 0,
    goldValue: 0,
    makingChargeType: "PER_GRAM",
    makingChargeValue: 0,
    makingChargeAmount: 0,
    stoneCharge: 0,
    taxableAmount: 0,
    gstRate: 3,
    gstAmount: 0,
    lineTotal: 0,
  };
}

export function calculateRow(row: BillItemRow): BillItemRow {
  const netWeight = row.grossWeight - row.stoneWeight;
  const wastageWeight = netWeight * (row.wastagePercent / 100);
  const totalWeight = netWeight + wastageWeight;
  const goldValue = totalWeight * row.ratePerGram;

  let makingChargeAmount = 0;
  if (row.makingChargeType === "PER_GRAM") makingChargeAmount = netWeight * row.makingChargeValue;
  if (row.makingChargeType === "PERCENTAGE") makingChargeAmount = goldValue * (row.makingChargeValue / 100);
  if (row.makingChargeType === "FIXED") makingChargeAmount = row.makingChargeValue;

  const taxableAmount = goldValue + makingChargeAmount + row.stoneCharge;
  const gstAmount = taxableAmount * (row.gstRate / 100);
  const lineTotal = taxableAmount + gstAmount;

  return {
    ...row,
    netWeight,
    wastageWeight,
    totalWeight,
    goldValue,
    makingChargeAmount,
    taxableAmount,
    gstAmount,
    lineTotal,
  };
}

export function BillLineItems({
  rows,
  setRows,
  items,
  defaultRates,
}: {
  rows: BillItemRow[];
  setRows: (rows: BillItemRow[]) => void;
  items: any[];
  defaultRates: { gold24kRate: number; gold22kRate: number; gold18kRate: number; silverRate: number } | null;
}) {
  function updateRow(index: number, patch: Partial<BillItemRow>) {
    const current = rows[index];
    const merged = { ...current, ...patch };

    if (patch.itemId) {
      const selectedItem = items.find((it) => it.id === patch.itemId);
      if (selectedItem) {
        const karat = selectedItem.karat || "22K";
        let ratePerGram = 0;
        if (defaultRates) {
          if (karat.includes("24")) ratePerGram = Number(defaultRates.gold24kRate);
          else if (karat.includes("18")) ratePerGram = Number(defaultRates.gold18kRate);
          else if (karat.toLowerCase().includes("silver")) ratePerGram = Number(defaultRates.silverRate);
          else ratePerGram = Number(defaultRates.gold22kRate);
        }

        merged.ratePerGram = ratePerGram;
        merged.makingChargeType = selectedItem.makingChargeType;
        merged.makingChargeValue = Number(selectedItem.makingChargeValue || 0);
        merged.description = selectedItem.itemName;
      }
    }

    const next = [...rows];
    next[index] = calculateRow(merged);
    setRows(next);
  }

  return (
    <div className="overflow-auto rounded-md border">
      <table className="min-w-[1400px] text-sm">
        <thead className="bg-slate-100">
          <tr>
            {[
              "#",
              "Item",
              "Tag No",
              "Gross Wt(g)",
              "Stone Wt(g)",
              "Net Wt(g)",
              "Wastage%",
              "Total Wt(g)",
              "Rate/g",
              "Gold Value",
              "Making Charge",
              "Stone Charge",
              "Taxable",
              "GST",
              "Line Total",
              "",
            ].map((h) => (
              <th key={h} className="border-b px-2 py-2 text-left text-xs font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border-b px-2 py-2">{i + 1}</td>
              <td className="border-b px-2 py-2">
                <Select value={row.itemId} onChange={(e) => updateRow(i, { itemId: e.target.value })}>
                  <option value="">Select</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode} - {item.itemName}
                    </option>
                  ))}
                </Select>
              </td>
              <td className="border-b px-2 py-2"><Input value={row.tagNumber} onChange={(e) => updateRow(i, { tagNumber: e.target.value })} /></td>
              <td className="border-b px-2 py-2"><Input type="number" value={row.grossWeight} onChange={(e) => updateRow(i, { grossWeight: Number(e.target.value) })} /></td>
              <td className="border-b px-2 py-2"><Input type="number" value={row.stoneWeight} onChange={(e) => updateRow(i, { stoneWeight: Number(e.target.value) })} /></td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.netWeight.toFixed(3)}</td>
              <td className="border-b px-2 py-2"><Input type="number" value={row.wastagePercent} onChange={(e) => updateRow(i, { wastagePercent: Number(e.target.value) })} /></td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.totalWeight.toFixed(3)}</td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.ratePerGram.toFixed(2)}</td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.goldValue.toFixed(2)}</td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.makingChargeAmount.toFixed(2)}</td>
              <td className="border-b px-2 py-2"><Input type="number" value={row.stoneCharge} onChange={(e) => updateRow(i, { stoneCharge: Number(e.target.value) })} /></td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.taxableAmount.toFixed(2)}</td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.gstAmount.toFixed(2)}</td>
              <td className="border-b bg-sky-50 px-2 py-2">{row.lineTotal.toFixed(2)}</td>
              <td className="border-b px-2 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => rows.length > 1 && setRows(rows.filter((_, idx) => idx !== i))}
                >
                  ✕
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2">
        <Button type="button" variant="outline" onClick={() => setRows([...rows, emptyRow()])}>
          Add Row
        </Button>
      </div>
    </div>
  );
}
