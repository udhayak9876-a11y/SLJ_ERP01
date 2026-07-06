"use client";

import { useCallback, useMemo } from "react";
import { Item, MakingType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { calculateLineItem, getRateForKarat, calculateRoundOff } from "@/lib/utils/billCalc";
import { calculateGST } from "@/lib/utils/gst";
import { cn } from "@/lib/utils";

export interface LineItemRow {
  id: string;
  itemId: string;
  tagNumber: string;
  description: string;
  grossWeight: number;
  stoneWeight: number;
  wastagePercent: number;
  stoneCharge: number;
  makingChargeType: MakingType;
  makingChargeValue: number;
  gstRate: number;
  netWeight: number;
  wastageWeight: number;
  totalWeight: number;
  ratePerGram: number;
  goldValue: number;
  makingChargeAmount: number;
  taxableAmount: number;
  gstAmount: number;
  lineTotal: number;
}

interface BillLineItemsProps {
  items: Item[];
  rates: {
    gold24kRate: number;
    gold22kRate: number;
    gold18kRate: number;
    silverRate: number;
  } | null;
  lines: LineItemRow[];
  onChange: (lines: LineItemRow[]) => void;
}

function createEmptyLine(): LineItemRow {
  return {
    id: crypto.randomUUID(),
    itemId: "",
    tagNumber: "",
    description: "",
    grossWeight: 0,
    stoneWeight: 0,
    wastagePercent: 0,
    stoneCharge: 0,
    makingChargeType: "PER_GRAM",
    makingChargeValue: 0,
    gstRate: 3,
    netWeight: 0,
    wastageWeight: 0,
    totalWeight: 0,
    ratePerGram: 0,
    goldValue: 0,
    makingChargeAmount: 0,
    taxableAmount: 0,
    gstAmount: 0,
    lineTotal: 0,
  };
}

function recalcLine(
  line: LineItemRow,
  item: Item | undefined,
  rates: BillLineItemsProps["rates"]
): LineItemRow {
  const makingChargeType = item?.makingChargeType ?? line.makingChargeType;
  const makingChargeValue = item
    ? Number(item.makingChargeValue)
    : line.makingChargeValue;

  let ratePerGram = line.ratePerGram;
  if (rates && item) {
    ratePerGram = getRateForKarat(item.karat, rates);
  }

  const calc = calculateLineItem({
    grossWeight: line.grossWeight,
    stoneWeight: line.stoneWeight,
    wastagePercent: line.wastagePercent,
    ratePerGram,
    makingChargeType,
    makingChargeValue,
    stoneCharge: line.stoneCharge,
    gstRate: line.gstRate,
  });

  return {
    ...line,
    makingChargeType,
    makingChargeValue,
    ratePerGram,
    description: item?.itemName ?? line.description,
    ...calc,
  };
}

export function BillLineItems({
  items,
  rates,
  lines,
  onChange,
}: BillLineItemsProps) {
  const updateLine = useCallback(
    (id: string, updates: Partial<LineItemRow>) => {
      onChange(
        lines.map((line) => {
          if (line.id !== id) return line;
          const updated = { ...line, ...updates };
          const item = items.find((i) => i.id === updated.itemId);
          return recalcLine(updated, item, rates);
        })
      );
    },
    [lines, items, rates, onChange]
  );

  const addRow = () => onChange([...lines, createEmptyLine()]);

  const removeRow = (id: string) => {
    if (lines.length <= 1) return;
    onChange(lines.filter((l) => l.id !== id));
  };

  const calcCell = "bg-blue-50 text-xs";

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-1">#</th>
              <th className="min-w-[140px] p-1">Item</th>
              <th className="p-1">Tag No</th>
              <th className="p-1">Gross Wt</th>
              <th className="p-1">Stone Wt</th>
              <th className={cn("p-1", calcCell)}>Net Wt</th>
              <th className="p-1">Wastage%</th>
              <th className={cn("p-1", calcCell)}>Total Wt</th>
              <th className={cn("p-1", calcCell)}>Rate/g</th>
              <th className={cn("p-1", calcCell)}>Gold Val</th>
              <th className={cn("p-1", calcCell)}>Making</th>
              <th className="p-1">Stone Chg</th>
              <th className={cn("p-1", calcCell)}>Taxable</th>
              <th className={cn("p-1", calcCell)}>GST</th>
              <th className={cn("p-1", calcCell)}>Total</th>
              <th className="p-1"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line.id} className="border-b">
                <td className="p-1">{idx + 1}</td>
                <td className="p-1">
                  <Select
                    value={line.itemId || undefined}
                    onValueChange={(v) => updateLine(line.id, { itemId: v })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.itemCode} — {item.itemName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-1">
                  <Input
                    className="h-7 w-20 text-xs"
                    value={line.tagNumber}
                    onChange={(e) =>
                      updateLine(line.id, { tagNumber: e.target.value })
                    }
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    step="0.001"
                    className="h-7 w-20 text-xs"
                    value={line.grossWeight || ""}
                    onChange={(e) =>
                      updateLine(line.id, {
                        grossWeight: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    step="0.001"
                    className="h-7 w-20 text-xs"
                    value={line.stoneWeight || ""}
                    onChange={(e) =>
                      updateLine(line.id, {
                        stoneWeight: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </td>
                <td className={cn("p-1", calcCell)}>
                  {line.netWeight.toFixed(3)}
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    step="0.01"
                    className="h-7 w-16 text-xs"
                    value={line.wastagePercent || ""}
                    onChange={(e) =>
                      updateLine(line.id, {
                        wastagePercent: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </td>
                <td className={cn("p-1", calcCell)}>
                  {line.totalWeight.toFixed(3)}
                </td>
                <td className={cn("p-1", calcCell)}>
                  {line.ratePerGram.toFixed(2)}
                </td>
                <td className={cn("p-1", calcCell)}>
                  <IndianCurrency amount={line.goldValue} />
                </td>
                <td className={cn("p-1", calcCell)}>
                  <IndianCurrency amount={line.makingChargeAmount} />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    step="0.01"
                    className="h-7 w-20 text-xs"
                    value={line.stoneCharge || ""}
                    onChange={(e) =>
                      updateLine(line.id, {
                        stoneCharge: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </td>
                <td className={cn("p-1", calcCell)}>
                  <IndianCurrency amount={line.taxableAmount} />
                </td>
                <td className={cn("p-1", calcCell)}>
                  <IndianCurrency amount={line.gstAmount} />
                </td>
                <td className={cn("p-1 font-semibold", calcCell)}>
                  <IndianCurrency amount={line.lineTotal} />
                </td>
                <td className="p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => removeRow(line.id)}
                    disabled={lines.length <= 1}
                  >
                    ✕
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        + Add Row
      </Button>
      {!rates && (
        <p className="text-sm text-red-600">
          ⚠ Today&apos;s gold rate not entered.{" "}
          <a href="/rates" className="underline">
            Enter now
          </a>
        </p>
      )}
    </div>
  );
}

export function createInitialLines(): LineItemRow[] {
  return [createEmptyLine()];
}

export function useBillTotals(
  lines: LineItemRow[],
  customerState: string,
  discountAmount: number,
  amountPaid: number
) {
  return useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.taxableAmount, 0);
    const gst = calculateGST(subtotal, customerState);
    const preRound =
      subtotal + gst.cgst + gst.sgst + gst.igst - discountAmount;
    const roundOff = calculateRoundOff(preRound);
    const totalAmount = Math.round((preRound + roundOff) * 100) / 100;
    const balanceDue = totalAmount - amountPaid;

    return {
      subtotal,
      cgstAmount: gst.cgst,
      sgstAmount: gst.sgst,
      igstAmount: gst.igst,
      roundOff,
      totalAmount,
      balanceDue,
    };
  }, [lines, customerState, discountAmount, amountPaid]);
}
