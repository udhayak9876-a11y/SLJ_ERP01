import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import type { DailySalesSummary } from "@/lib/actions/complianceReports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DailySalesSummaryViewProps {
  summary: DailySalesSummary;
  shopName?: string;
}

const paymentLabels: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  CHEQUE: "Cheque",
  MULTIPLE: "Multiple / Mixed",
};

export function DailySalesSummaryView({
  summary,
  shopName = "Sri Lakshmi Jewellery",
}: DailySalesSummaryViewProps) {
  return (
    <div className="space-y-6 print:text-sm">
      <div className="border-b pb-4 text-center print:border-black">
        <h1 className="text-lg font-bold uppercase tracking-wide">{shopName}</h1>
        <p className="text-sm text-muted-foreground print:text-black">
          Tiruppur, Tamil Nadu
        </p>
        <h2 className="mt-2 text-base font-semibold">
          Daily Sales Summary — {summary.date}
        </h2>
      </div>

      <section>
        <h3 className="mb-2 font-semibold uppercase tracking-wide text-sm">
          Sales Register
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Gold Wt</TableHead>
              <TableHead>Silver Wt</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No sales for this date
                </TableCell>
              </TableRow>
            ) : (
              summary.sales.map((row) => (
                <TableRow key={row.billNumber}>
                  <TableCell className="font-mono text-xs">{row.billNumber}</TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{row.itemCount}</TableCell>
                  <TableCell>
                    {row.goldWeight > 0 ? (
                      <WeightDisplay weight={row.goldWeight} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {row.silverWeight > 0 ? (
                      <WeightDisplay weight={row.silverWeight} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.totalAmount} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.amountPaid} />
                  </TableCell>
                  <TableCell>{paymentLabels[row.paymentMode] ?? row.paymentMode}</TableCell>
                </TableRow>
              ))
            )}
            {summary.sales.length > 0 && (
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell colSpan={3}>Total ({summary.totals.salesCount} bills)</TableCell>
                <TableCell>
                  <WeightDisplay weight={summary.totals.goldWeight} />
                </TableCell>
                <TableCell>
                  <WeightDisplay weight={summary.totals.silverWeight} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={summary.totals.salesAmount} />
                </TableCell>
                <TableCell colSpan={2}>
                  <IndianCurrency amount={summary.totals.totalCollected - summary.totals.chitCollection} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="mb-2 font-semibold uppercase tracking-wide text-sm">
          Metal Weight Breakdown
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Gross Wt</TableHead>
              <TableHead>Net Wt</TableHead>
              <TableHead>Pieces</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.metalSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  —
                </TableCell>
              </TableRow>
            ) : (
              summary.metalSummary.map((row) => (
                <TableRow key={row.category}>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    <WeightDisplay weight={row.grossWeight} />
                  </TableCell>
                  <TableCell>
                    <WeightDisplay weight={row.netWeight} />
                  </TableCell>
                  <TableCell>{row.pieces}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="mb-2 font-semibold uppercase tracking-wide text-sm">
          Payment Summary (Card / Cash / UPI / Cheque)
        </h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {(Object.entries(summary.paymentSummary) as [string, number][]).map(
            ([mode, amount]) => (
              <div
                key={mode}
                className="rounded border p-3 text-center print:border-black"
              >
                <p className="text-xs text-muted-foreground print:text-black">
                  {paymentLabels[mode] ?? mode}
                </p>
                <p className="font-semibold">
                  <IndianCurrency amount={amount} />
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-semibold uppercase tracking-wide text-sm">
          Old Gold Purchase
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Metal</TableHead>
              <TableHead>Karat</TableHead>
              <TableHead>Net Wt</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.oldGoldPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No old gold purchases
                </TableCell>
              </TableRow>
            ) : (
              <>
                {summary.oldGoldPurchases.map((row) => (
                  <TableRow key={row.voucherNumber}>
                    <TableCell className="font-mono text-xs">{row.voucherNumber}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.metalType}</TableCell>
                    <TableCell>{row.karat}</TableCell>
                    <TableCell>
                      <WeightDisplay weight={row.netWeight} />
                    </TableCell>
                    <TableCell>
                      <IndianCurrency amount={row.amount} />
                    </TableCell>
                    <TableCell>{paymentLabels[row.paymentMode] ?? row.paymentMode}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell>
                    <WeightDisplay weight={summary.totals.oldGoldWeight} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={summary.totals.oldGoldAmount} />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="mb-2 font-semibold uppercase tracking-wide text-sm">
          Chit / Gold Saving Scheme Collection
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Scheme</TableHead>
              <TableHead>Inst.</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.chitCollections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No chit collections
                </TableCell>
              </TableRow>
            ) : (
              <>
                {summary.chitCollections.map((row) => (
                  <TableRow key={row.receiptNumber}>
                    <TableCell className="font-mono text-xs">{row.receiptNumber}</TableCell>
                    <TableCell>{row.memberName}</TableCell>
                    <TableCell>{row.schemeName}</TableCell>
                    <TableCell>{row.instalmentNumber}</TableCell>
                    <TableCell>
                      <IndianCurrency amount={row.amount} />
                    </TableCell>
                    <TableCell>{paymentLabels[row.paymentMode] ?? row.paymentMode}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell>
                    <IndianCurrency amount={summary.totals.chitCollection} />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="mb-2 font-semibold uppercase tracking-wide text-sm">
          Add / Less Adjustments
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No adjustments
                </TableCell>
              </TableRow>
            ) : (
              summary.adjustments.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.amount} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded border bg-gray-50 p-4 print:border-black print:bg-white">
        <div className="grid gap-2 md:grid-cols-2">
          <p>
            <span className="text-muted-foreground print:text-black">Sales Total: </span>
            <IndianCurrency amount={summary.totals.salesAmount} />
          </p>
          <p>
            <span className="text-muted-foreground print:text-black">Chit Collection: </span>
            <IndianCurrency amount={summary.totals.chitCollection} />
          </p>
          <p>
            <span className="text-muted-foreground print:text-black">Old Gold Paid Out: </span>
            <IndianCurrency amount={summary.totals.oldGoldAmount} />
          </p>
          <p className="font-semibold">
            <span className="text-muted-foreground print:text-black">Total Collected (Sales + Chit): </span>
            <IndianCurrency amount={summary.totals.totalCollected} />
          </p>
        </div>
      </section>
    </div>
  );
}
