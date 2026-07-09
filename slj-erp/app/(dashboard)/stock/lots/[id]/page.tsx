import Link from "next/link";
import { notFound } from "next/navigation";
import { getLot } from "@/lib/actions/lots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function LotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lot = await getLot(params.id);
  if (!lot) notFound();

  return (
    <div className="space-y-6">
      <Link href="/stock/lots" className="text-sm text-muted-foreground hover:underline">
        ← Lots
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold font-mono">{lot.lotNumber}</h2>
          <p className="text-muted-foreground">
            {formatDateDDMMYYYY(lot.lotDate)}
            {lot.supplier && ` · ${lot.supplier.companyName}`}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge>{lot.metalType}</Badge>
          <Badge variant={lot.status === "OPEN" ? "default" : "secondary"}>
            {lot.status}
          </Badge>
          {lot.status === "OPEN" && (
            <Link href={`/stock/tags/new?lotId=${lot.id}`}>
              <Button size="sm">+ Add Tag</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total Pieces</p>
          <p className="text-lg font-semibold">{lot.totalPieces}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Weight</p>
          <WeightDisplay weight={Number(lot.totalWeight)} className="text-lg font-semibold" />
        </div>
        <div>
          <p className="text-muted-foreground">Invoice</p>
          <p>{lot.invoiceNumber ?? "—"}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Tags in Lot ({lot.tags.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Net Wt</TableHead>
              <TableHead>HUID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lot.tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-mono text-xs">{tag.tagId}</TableCell>
                <TableCell>{tag.product.itemName}</TableCell>
                <TableCell>
                  <WeightDisplay weight={Number(tag.netWeight)} />
                </TableCell>
                <TableCell>{tag.huidNumber ?? "—"}</TableCell>
                <TableCell>{tag.status}</TableCell>
                <TableCell>
                  <Link href={`/stock/tags/${tag.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {lot.tags.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No tags in this lot yet.{" "}
                  <Link href={`/stock/tags/new?lotId=${lot.id}`} className="text-gold underline">
                    Add tag
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
