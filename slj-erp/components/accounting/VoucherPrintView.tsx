"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Voucher, JournalEntry, JournalEntryLine, LedgerAccount, ShopSettings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { amountInWords } from "@/lib/utils/amountInWords";

type VoucherDetail = Voucher & {
  journalEntry: (JournalEntry & {
    lines: (JournalEntryLine & { account: LedgerAccount })[];
  }) | null;
};

interface VoucherPrintViewProps {
  voucher: VoucherDetail;
  settings: ShopSettings;
}

export function VoucherPrintView({ voucher, settings }: VoucherPrintViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: ref });

  return (
    <div>
      <div className="mb-4 print:hidden">
        <Button onClick={() => handlePrint()}>Print Voucher</Button>
      </div>
      <div ref={ref} className="max-w-lg mx-auto border p-8 print:border-0">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold">{settings.shopName}</h1>
          <p className="text-sm text-muted-foreground">{settings.address}, {settings.city}</p>
          <h2 className="text-base font-semibold mt-4 uppercase">{voucher.type} VOUCHER</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-6">
          <div><span className="text-muted-foreground">No:</span> {voucher.voucherNumber}</div>
          <div><span className="text-muted-foreground">Date:</span> {formatDateDDMMYYYY(voucher.date)}</div>
          <div className="col-span-2"><span className="text-muted-foreground">Party:</span> {voucher.partyName}</div>
          <div><span className="text-muted-foreground">Mode:</span> {voucher.paymentMode}</div>
        </div>

        <div className="border-t border-b py-4 my-4 text-center">
          <p className="text-2xl font-bold"><IndianCurrency amount={Number(voucher.amount)} /></p>
          <p className="text-sm mt-1">{amountInWords(Number(voucher.amount))}</p>
        </div>

        {voucher.narration && (
          <p className="text-sm mb-4"><strong>Narration:</strong> {voucher.narration}</p>
        )}

        {voucher.journalEntry && (
          <table className="w-full text-xs mt-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Account</th>
                <th className="text-right py-1">Debit</th>
                <th className="text-right py-1">Credit</th>
              </tr>
            </thead>
            <tbody>
              {voucher.journalEntry.lines.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="py-1">{l.account.accountName}</td>
                  <td className="text-right">{Number(l.debitAmount) > 0 ? Number(l.debitAmount).toFixed(2) : ""}</td>
                  <td className="text-right">{Number(l.creditAmount) > 0 ? Number(l.creditAmount).toFixed(2) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-12 flex justify-between text-sm">
          <div>Prepared by</div>
          <div>Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
}
