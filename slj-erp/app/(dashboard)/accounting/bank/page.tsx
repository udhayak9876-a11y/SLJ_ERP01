import Link from "next/link";
import { getBankAccounts } from "@/lib/actions/bankBook";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function BankPage() {
  const banks = await getBankAccounts();

  return (
    <div>
      <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Bank Accounts</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bank</TableHead>
            <TableHead>Account No.</TableHead>
            <TableHead>IFSC</TableHead>
            <TableHead>Opening</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banks.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.bankName}</TableCell>
              <TableCell className="font-mono text-xs">{b.accountNumber}</TableCell>
              <TableCell>{b.ifsc || "—"}</TableCell>
              <TableCell><IndianCurrency amount={Number(b.openingBalance)} /></TableCell>
              <TableCell>
                <Link href={`/accounting/bank/${b.id}`}>
                  <Button variant="ghost" size="sm">Book / BRS</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {banks.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No bank accounts configured
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
