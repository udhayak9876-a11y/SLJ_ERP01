import Link from "next/link";
import { getNonMovingStockReport } from "@/lib/actions/stockReports";
import { PrintButton } from "@/components/shared/PrintButton";
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
import { formatDateDDMMYYYY } from "@/lib/utils/date";

export default async function NonMovingStockPage() {
  const items = await getNonMovingStockReport(90);

  const totalWeight = items.reduce((s, i) => s + Number(i.tag.netWeight), 0);
  const totalValue = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link href="/stock" className="text-sm text-muted-foreground hover:underline">
            ← Stock
          </Link>
          <h2 className="text-xl font-semibold mt-1">Non-Moving Stock</h2>
          <p className="text-sm text-muted-foreground">
            Items unsold for more than 90 days
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded border p-3">
          <p className="text-muted-foreground">Pieces</p>
          <p className="text-xl font-bold">{items.length}</p>
        </div>
        <div className="rounded border p-3">
          <p className="text-muted-foreground">Weight</p>
          <WeightDisplay weight={totalWeight} className="text-xl font-bold" />
        </div>
        <div className="rounded border p-3">
          <p className="text-muted-foreground">Value</p>
          <IndianCurrency amount={totalValue} className="text-xl font-bold" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tag ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Counter</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Days Unsold</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ tag, daysUnsold, value }) => (
            <TableRow key={tag.id} className={daysUnsold > 180 ? "bg-red-50" : ""}>
              <TableCell className="font-mono text-xs">{tag.tagId}</TableCell>
              <TableCell>{tag.product.itemName}</TableCell>
              <TableCell>{tag.counter?.counterName ?? "—"}</TableCell>
              <TableCell>{formatDateDDMMYYYY(tag.receivedDate)}</TableCell>
              <TableCell className={daysUnsold > 180 ? "text-red-600 font-semibold" : ""}>
                {daysUnsold}
              </TableCell>
              <TableCell>
                <WeightDisplay weight={Number(tag.netWeight)} />
              </TableCell>
              <TableCell>
                <IndianCurrency amount={value} />
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No non-moving stock — all items sold within 90 days
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
