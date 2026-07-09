"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Item,
  Counter,
  Lot,
  StockMovement,
  Supplier,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import {
  assignTagToCounter,
  transferTagBetweenCounters,
  updateTag,
} from "@/lib/actions/tags";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { toast } from "sonner";

type TagDetail = Tag & {
  product: Item;
  counter: Counter | null;
  lot: (Lot & { supplier: Supplier | null }) | null;
  movements: StockMovement[];
};

interface TagDetailViewProps {
  tag: TagDetail;
  counters: Counter[];
}

export function TagDetailView({ tag, counters }: TagDetailViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transferCounterId, setTransferCounterId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [assignCounterId, setAssignCounterId] = useState("");
  const [huid, setHuid] = useState(tag.huidNumber || "");

  const canEdit = tag.status !== "SOLD";

  async function handleAssign() {
    if (!assignCounterId) return;
    setLoading(true);
    try {
      await assignTagToCounter(tag.id, assignCounterId);
      toast.success("Tag assigned to counter");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign");
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer() {
    if (!transferCounterId || !transferReason.trim()) {
      toast.error("Select counter and enter reason");
      return;
    }
    setLoading(true);
    try {
      await transferTagBetweenCounters(tag.id, transferCounterId, transferReason);
      toast.success("Tag transferred");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to transfer");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveHuid() {
    setLoading(true);
    try {
      await updateTag(tag.id, {
        grossWeight: Number(tag.grossWeight),
        stoneWeight: Number(tag.stoneWeight),
        stoneCount: tag.stoneCount,
        stoneDescription: tag.stoneDescription || undefined,
        huidNumber: huid || undefined,
        purchaseRate: tag.purchaseRate ? Number(tag.purchaseRate) : undefined,
        mrp: tag.mrp ? Number(tag.mrp) : undefined,
        notes: tag.notes || undefined,
      });
      toast.success("Tag updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold font-mono">{tag.tagId}</h2>
          <p className="text-muted-foreground">{tag.product.itemName}</p>
        </div>
        <Badge>{tag.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg border p-4">
        <div>
          <p className="text-xs text-muted-foreground">Gross Weight</p>
          <WeightDisplay weight={Number(tag.grossWeight)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Stone Weight</p>
          <WeightDisplay weight={Number(tag.stoneWeight)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Net Weight</p>
          <WeightDisplay weight={Number(tag.netWeight)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Received</p>
          <p>{formatDateDDMMYYYY(tag.receivedDate)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Counter</p>
          <p>{tag.counter?.counterName ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Lot</p>
          <p>{tag.lot?.lotNumber ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Purchase Rate</p>
          <IndianCurrency amount={Number(tag.purchaseRate ?? 0)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">MRP</p>
          <IndianCurrency amount={Number(tag.mrp ?? 0)} />
        </div>
      </div>

      {tag.product.category === "GOLD" && canEdit && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium">HUID (Hallmark ID)</h3>
          <div className="flex gap-2 max-w-xs">
            <Input
              value={huid}
              onChange={(e) => setHuid(e.target.value.toUpperCase())}
              placeholder="AA1B2C"
              className="font-mono uppercase"
              maxLength={6}
            />
            <Button onClick={handleSaveHuid} disabled={loading} size="sm">
              Save
            </Button>
          </div>
          {!tag.huidNumber && (
            <p className="text-sm text-red-500">
              ⚠ HUID required before billing gold items
            </p>
          )}
        </div>
      )}

      {canEdit && (
        <div className="grid md:grid-cols-2 gap-4">
          {!tag.counterId && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Assign to Counter</h3>
              <Select value={assignCounterId} onValueChange={setAssignCounterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select counter" />
                </SelectTrigger>
                <SelectContent>
                  {counters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.counterName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAssign} disabled={loading || !assignCounterId}>
                Assign
              </Button>
            </div>
          )}

          {tag.counterId && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Transfer Counter</h3>
              <Select value={transferCounterId} onValueChange={setTransferCounterId}>
                <SelectTrigger>
                  <SelectValue placeholder="To counter" />
                </SelectTrigger>
                <SelectContent>
                  {counters
                    .filter((c) => c.id !== tag.counterId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.counterName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div>
                <Label>Reason</Label>
                <Input
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Display rearrangement..."
                />
              </div>
              <Button onClick={handleTransfer} disabled={loading}>
                Transfer
              </Button>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Movement History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tag.movements.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{formatDateDDMMYYYY(m.date)}</TableCell>
                <TableCell className="text-xs">{m.movementType}</TableCell>
                <TableCell>{m.fromLocation ?? "—"}</TableCell>
                <TableCell>{m.toLocation ?? "—"}</TableCell>
                <TableCell>
                  <WeightDisplay weight={Number(m.weight)} />
                </TableCell>
              </TableRow>
            ))}
            {tag.movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No movements recorded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
