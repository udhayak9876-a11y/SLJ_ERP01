"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import { formatDisplayDate } from "@/lib/utils/date";
import { formatINR } from "@/lib/utils/currency";
import { amountInWords } from "@/lib/utils/amountInWords";
import { Button } from "@/components/ui/button";

export function BillPrintView({ bill, settings }: { bill: any; settings: any }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <div className="space-y-4">
      <div className="no-print flex gap-2">
        <Button onClick={handlePrint}>🖨 Print</Button>
        <Link href="/bills">
          <Button variant="outline">← Back to Bills</Button>
        </Link>
      </div>

      <div ref={printRef} className="print-area mx-auto w-[210mm] min-h-[297mm] border bg-white p-6 text-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase">{settings.shopName}</h1>
          <p>{settings.address} | {settings.phone} | GSTIN: {settings.gstin}</p>
          <h2 className="mt-1 text-lg font-semibold">TAX INVOICE</h2>
        </div>

        <div className="mt-4 grid grid-cols-2 border">
          <div className="border-r p-3">
            <p className="font-semibold">Bill To:</p>
            <p>{bill.customer?.name ?? bill.walkInName ?? "Walk-in Customer"}</p>
            <p>{bill.customer?.address ?? ""}</p>
            <p>{bill.customer?.phone ?? ""}</p>
            {bill.customer?.gstin ? <p>GSTIN: {bill.customer.gstin}</p> : null}
          </div>
          <div className="p-3">
            <p>Bill No: {bill.billNumber}</p>
            <p>Date: {formatDisplayDate(bill.billDate)}</p>
            <p>Bill Type: {bill.billType}</p>
            <p>Payment: {bill.paymentMode}</p>
          </div>
        </div>

        <table className="mt-4 w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              {[
                "S.No","Description","Tag","Gross","Stone","Net","Wastage","Total Wt","Rate","Gold Val","Making","Stone","Taxable","GST%","GST","Total",
              ].map((h) => (
                <th key={h} className="border px-1 py-1 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item: any, idx: number) => (
              <tr key={item.id}>
                <td className="border px-1 py-1">{idx + 1}</td>
                <td className="border px-1 py-1">{item.description}</td>
                <td className="border px-1 py-1">{item.tagNumber ?? ""}</td>
                <td className="border px-1 py-1">{Number(item.grossWeight).toFixed(3)}</td>
                <td className="border px-1 py-1">{Number(item.stoneWeight).toFixed(3)}</td>
                <td className="border px-1 py-1">{Number(item.netWeight).toFixed(3)}</td>
                <td className="border px-1 py-1">{Number(item.wastagePercent).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.totalWeight).toFixed(3)}</td>
                <td className="border px-1 py-1">{Number(item.ratePerGram).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.goldValue).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.makingChargeAmount).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.stoneCharge).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.taxableAmount).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.gstRate).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.gstAmount).toFixed(2)}</td>
                <td className="border px-1 py-1">{Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 ml-auto w-[320px] space-y-1 text-sm">
          <p className="flex justify-between"><span>Subtotal:</span><span>{formatINR(Number(bill.subtotal))}</span></p>
          {Number(bill.igstAmount) > 0 ? (
            <p className="flex justify-between"><span>IGST 3%:</span><span>{formatINR(Number(bill.igstAmount))}</span></p>
          ) : (
            <>
              <p className="flex justify-between"><span>CGST 1.5%:</span><span>{formatINR(Number(bill.cgstAmount))}</span></p>
              <p className="flex justify-between"><span>SGST 1.5%:</span><span>{formatINR(Number(bill.sgstAmount))}</span></p>
            </>
          )}
          <p className="flex justify-between"><span>Discount:</span><span>-{formatINR(Number(bill.discountAmount))}</span></p>
          <p className="flex justify-between"><span>Round Off:</span><span>{formatINR(Number(bill.roundOff))}</span></p>
          <p className="flex justify-between text-lg font-bold"><span>TOTAL:</span><span>{formatINR(Number(bill.totalAmount))}</span></p>
        </div>

        <p className="mt-4">Amount in words: {amountInWords(Number(bill.totalAmount))}</p>
        <p>Paid: {formatINR(Number(bill.amountPaid))} | Balance: {formatINR(Number(bill.balanceDue))}</p>

        <div className="mt-10 flex justify-between">
          <p>
            Thank you for shopping at Sri Lakshmi Jewellery. All disputes subject to Tiruppur jurisdiction.
          </p>
          <p className="font-semibold">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}
