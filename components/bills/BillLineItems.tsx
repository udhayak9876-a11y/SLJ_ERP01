"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatINR, formatWeight } from "@/lib/utils/currency";
import {
  computeLine,
  emptyLine,
  type ItemOption,
  type LineInput,
  type TodayRates,
} from "@/lib/billing";

interface BillLineItemsProps {
  lines: LineInput[];
  items: ItemOption[];
  rates: TodayRates | null;
  onChange: (lines: LineInput[]) => void;
}

const CELL = "px-1 py-1";
const CALC = "calc-cell rounded px-1.5 py-1 text-right text-xs tabular-nums";

export function BillLineItems({ lines, items, rates, onChange }: BillLineItemsProps) {
  const itemById = new Map(items.map((i) => [i.id, i]));

  function updateLine(index: number, patch: Partial<LineInput>) {
    const next = [...lines];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function handleItemSelect(index: number, itemId: string) {
    const item = itemById.get(itemId);
    updateLine(index, {
      itemId,
      description: item
        ? `${item.itemName}${item.karat ? ` ${item.karat}` : ""}`
        : "",
    });
  }

  function addRow() {
    onChange([...lines, emptyLine()]);
  }

  function removeRow(index: number) {
    if (lines.length <= 1) return;
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[1250px] text-sm">
          <thead>
            <tr className="border-b bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <th className={cn(CELL, "w-8 text-left")}>#</th>
              <th className={cn(CELL, "w-44 text-left")}>Item</th>
              <th className={cn(CELL, "w-20 text-left")}>Tag No</th>
              <th className={cn(CELL, "w-24 text-right")}>Gross Wt(g)</th>
              <th className={cn(CELL, "w-24 text-right")}>Stone Wt(g)</th>
              <th className={cn(CELL, "w-24 text-right")}>Net Wt(g)</th>
              <th className={cn(CELL, "w-20 text-right")}>Wastage%</th>
              <th className={cn(CELL, "w-24 text-right")}>Total Wt(g)</th>
              <th className={cn(CELL, "w-24 text-right")}>Rate/g</th>
              <th className={cn(CELL, "w-28 text-right")}>Gold Value</th>
              <th className={cn(CELL, "w-24 text-right")}>Making</th>
              <th className={cn(CELL, "w-24 text-right")}>Stone Chg</th>
              <th className={cn(CELL, "w-28 text-right")}>Taxable</th>
              <th className={cn(CELL, "w-20 text-right")}>GST</th>
              <th className={cn(CELL, "w-28 text-right")}>Line Total</th>
              <th className={cn(CELL, "w-8")}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const item = itemById.get(line.itemId);
              const calc = computeLine(line, item, rates);
              return (
                <tr key={line.key} className="border-b align-middle">
                  <td className={cn(CELL, "text-muted-foreground")}>{index + 1}</td>
                  <td className={CELL}>
                    <Select
                      value={line.itemId}
                      onValueChange={(v) => handleItemSelect(index, v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select item…" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.itemCode} — {i.itemName}
                            {i.karat ? ` (${i.karat})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className={CELL}>
                    <Input
                      className="h-8 text-xs"
                      value={line.tagNumber}
                      onChange={(e) => updateLine(index, { tagNumber: e.target.value })}
                    />
                  </td>
                  <td className={CELL}>
                    <Input
                      className="h-8 text-right text-xs tabular-nums"
                      type="number"
                      step="0.001"
                      min="0"
                      value={line.grossWeight}
                      onChange={(e) => updateLine(index, { grossWeight: e.target.value })}
                    />
                  </td>
                  <td className={CELL}>
                    <Input
                      className="h-8 text-right text-xs tabular-nums"
                      type="number"
                      step="0.001"
                      min="0"
                      value={line.stoneWeight}
                      onChange={(e) => updateLine(index, { stoneWeight: e.target.value })}
                    />
                  </td>
                  <td className={CELL}>
                    <div className={CALC}>{formatWeight(calc.netWeight)}</div>
                  </td>
                  <td className={CELL}>
                    <Input
                      className="h-8 text-right text-xs tabular-nums"
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.wastagePercent}
                      onChange={(e) => updateLine(index, { wastagePercent: e.target.value })}
                    />
                  </td>
                  <td className={CELL}>
                    <div className={CALC}>{formatWeight(calc.totalWeight)}</div>
                  </td>
                  <td className={CELL}>
                    <div className={CALC}>{formatINR(calc.ratePerGram, 2)}</div>
                  </td>
                  <td className={CELL}>
                    <div className={CALC}>{formatINR(calc.goldValue, 2)}</div>
                  </td>
                  <td className={CELL}>
                    <div className={CALC}>{formatINR(calc.makingChargeAmount, 2)}</div>
                  </td>
                  <td className={CELL}>
                    <Input
                      className="h-8 text-right text-xs tabular-nums"
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.stoneCharge}
                      onChange={(e) => updateLine(index, { stoneCharge: e.target.value })}
                    />
                  </td>
                  <td className={CELL}>
                    <div className={CALC}>{formatINR(calc.taxableAmount, 2)}</div>
                  </td>
                  <td className={CELL}>
                    <div className={CALC}>{formatINR(calc.gstAmount, 2)}</div>
                  </td>
                  <td className={CELL}>
                    <div className={cn(CALC, "font-semibold")}>
                      {formatINR(calc.lineTotal, 2)}
                    </div>
                  </td>
                  <td className={CELL}>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={lines.length <= 1}
                      className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      title="Remove row"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={addRow}
      >
        <Plus className="h-4 w-4" />
        Add Row
      </Button>
    </div>
  );
}
