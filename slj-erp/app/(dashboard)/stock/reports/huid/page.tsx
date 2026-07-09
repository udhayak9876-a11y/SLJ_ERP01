import Link from "next/link";
import { getHuidReport } from "@/lib/actions/tags";
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
import { formatDateDDMMYYYY } from "@/lib/utils/date";

export default async function HuidReportPage() {
  const { withHuid, withoutHuid, total } = await getHuidReport();

  return (
    <div className="space-y-8 print:p-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link href="/stock" className="text-sm text-muted-foreground hover:underline">
            ← Stock
          </Link>
          <h2 className="text-xl font-semibold mt-1">HUID Report</h2>
          <p className="text-sm text-muted-foreground">
            BIS Hallmark Unique Identification — gold pieces only
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded border p-4">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total Gold (active)</p>
        </div>
        <div className="rounded border p-4 border-green-200 bg-green-50">
          <p className="text-2xl font-bold text-green-700">{withHuid.length}</p>
          <p className="text-sm text-muted-foreground">With HUID</p>
        </div>
        <div className="rounded border p-4 border-red-200 bg-red-50">
          <p className="text-2xl font-bold text-red-700">{withoutHuid.length}</p>
          <p className="text-sm text-muted-foreground">Missing HUID</p>
        </div>
      </div>

      {withoutHuid.length > 0 && (
        <div>
          <h3 className="font-medium text-red-700 mb-2">
            ⚠ Missing HUID ({withoutHuid.length})
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Counter</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withoutHuid.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.tagId}</TableCell>
                  <TableCell>{t.product.itemName}</TableCell>
                  <TableCell>
                    <WeightDisplay weight={Number(t.netWeight)} />
                  </TableCell>
                  <TableCell>{t.lot?.lotNumber ?? "—"}</TableCell>
                  <TableCell>{t.counter?.counterName ?? "—"}</TableCell>
                  <TableCell>{formatDateDDMMYYYY(t.receivedDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">With HUID ({withHuid.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag ID</TableHead>
              <TableHead>HUID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Lot</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withHuid.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.tagId}</TableCell>
                <TableCell className="font-mono">{t.huidNumber}</TableCell>
                <TableCell>{t.product.itemName}</TableCell>
                <TableCell>
                  <WeightDisplay weight={Number(t.netWeight)} />
                </TableCell>
                <TableCell>{t.lot?.lotNumber ?? "—"}</TableCell>
              </TableRow>
            ))}
            {withHuid.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No gold tags with HUID
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
