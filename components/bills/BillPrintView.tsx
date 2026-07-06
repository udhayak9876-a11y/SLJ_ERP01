"use client";

import { useRef } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, formatWeight } from "@/lib/utils/currency";
import { amountInWords } from "@/lib/utils/amountInWords";

export interface PrintBillItem {
  description: string;
  tagNumber: string | null;
  hsnCode: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  wastageWeight: number;
  totalWeight: number;
  ratePerGram: number;
  goldValue: number;
  makingChargeAmount: number;
  stoneCharge: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  lineTotal: number;
}

export interface PrintBill {
  billNumber: string;
  billDate: string;
  billType: string;
  paymentMode: string;
  status: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerGstin: string | null;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountAmount: number;
  roundOff: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  items: PrintBillItem[];
}

export interface PrintShop {
  shopName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  bankDetails: string;
}

const TH = "border border-gray-400 px-1 py-0.5 text-[9px] font-semibold uppercase";
const TD = "border border-gray-400 px-1 py-0.5 text-[9px] tabular-nums";

export function BillPrintView({ bill, shop }: { bill: PrintBill; shop: PrintShop }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: bill.billNumber.replace(/\//g, "-"),
  });

  const intraState = bill.igstAmount === 0;

  return (
    <div>
      <div className="no-print mb-4 flex items-center gap-2">
        <Button onClick={() => handlePrint()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bills">
            <ArrowLeft className="h-4 w-4" />
            Back to Bills
          </Link>
        </Button>
        {bill.status === "CANCELLED" && (
          <span className="rounded bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
            CANCELLED BILL
          </span>
        )}
        {bill.status === "DRAFT" && (
          <span className="rounded bg-gray-200 px-3 py-1 text-sm font-bold text-gray-700">
            DRAFT — not a tax invoice
          </span>
        )}
      </div>

      {/* A4 invoice */}
      <div
        ref={printRef}
        className="mx-auto w-[210mm] border bg-white p-[8mm] text-black shadow print:border-0 print:shadow-none"
      >
        {/* Header */}
        <div className="border-b-2 border-black pb-2 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {shop.shopName}
          </h1>
          <p className="text-[10px]">
            {[shop.address, `${shop.city} - ${shop.pincode}`, shop.state]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="text-[10px]">
            {shop.phone && <>Phone: {shop.phone} &nbsp;|&nbsp; </>}
            {shop.email && <>{shop.email} &nbsp;|&nbsp; </>}
            {shop.gstin && <>GSTIN: {shop.gstin}</>}
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-widest">
            Tax Invoice
          </p>
        </div>

        {/* Bill To / Bill meta */}
        <div className="flex border-b border-black text-[10px]">
          <div className="w-1/2 border-r border-black p-2">
            <p className="font-semibold uppercase">Bill To:</p>
            <p className="text-xs font-bold">{bill.customerName}</p>
            {bill.customerAddress && <p>{bill.customerAddress}</p>}
            {bill.customerPhone && <p>Phone: {bill.customerPhone}</p>}
            {bill.customerGstin && <p>GSTIN: {bill.customerGstin}</p>}
          </div>
          <div className="w-1/2 p-2">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-semibold">Bill No:</td>
                  <td className="text-right font-bold">{bill.billNumber}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Date:</td>
                  <td className="text-right">{bill.billDate}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Bill Type:</td>
                  <td className="text-right capitalize">
                    {bill.billType.toLowerCase()}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold">Payment:</td>
                  <td className="text-right capitalize">
                    {bill.paymentMode.toLowerCase()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items table */}
        <table className="mt-2 w-full border-collapse">
          <thead>
            <tr>
              <th className={TH}>S.No</th>
              <th className={`${TH} text-left`}>Description</th>
              <th className={TH}>HSN</th>
              <th className={TH}>Tag</th>
              <th className={TH}>Gross (g)</th>
              <th className={TH}>Stone (g)</th>
              <th className={TH}>Net (g)</th>
              <th className={TH}>Wastage (g)</th>
              <th className={TH}>Total Wt (g)</th>
              <th className={TH}>Rate/g</th>
              <th className={TH}>Gold Value</th>
              <th className={TH}>Making</th>
              <th className={TH}>Stone Chg</th>
              <th className={TH}>Taxable</th>
              <th className={TH}>GST%</th>
              <th className={TH}>GST</th>
              <th className={TH}>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={index}>
                <td className={`${TD} text-center`}>{index + 1}</td>
                <td className={`${TD} text-left`}>{item.description}</td>
                <td className={`${TD} text-center`}>{item.hsnCode}</td>
                <td className={`${TD} text-center`}>{item.tagNumber ?? "—"}</td>
                <td className={`${TD} text-right`}>{formatWeight(item.grossWeight)}</td>
                <td className={`${TD} text-right`}>{formatWeight(item.stoneWeight)}</td>
                <td className={`${TD} text-right`}>{formatWeight(item.netWeight)}</td>
                <td className={`${TD} text-right`}>{formatWeight(item.wastageWeight)}</td>
                <td className={`${TD} text-right`}>{formatWeight(item.totalWeight)}</td>
                <td className={`${TD} text-right`}>{formatINR(item.ratePerGram, 2)}</td>
                <td className={`${TD} text-right`}>{formatINR(item.goldValue, 2)}</td>
                <td className={`${TD} text-right`}>{formatINR(item.makingChargeAmount, 2)}</td>
                <td className={`${TD} text-right`}>{formatINR(item.stoneCharge, 2)}</td>
                <td className={`${TD} text-right`}>{formatINR(item.taxableAmount, 2)}</td>
                <td className={`${TD} text-right`}>{item.gstRate}%</td>
                <td className={`${TD} text-right`}>{formatINR(item.gstAmount, 2)}</td>
                <td className={`${TD} text-right font-semibold`}>
                  {formatINR(item.lineTotal, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-2 flex justify-end">
          <table className="w-64 text-[11px]">
            <tbody>
              <tr>
                <td className="py-0.5">Subtotal</td>
                <td className="py-0.5 text-right tabular-nums">
                  {formatINR(bill.subtotal, 2)}
                </td>
              </tr>
              {intraState ? (
                <>
                  <tr>
                    <td className="py-0.5">CGST 1.5%</td>
                    <td className="py-0.5 text-right tabular-nums">
                      {formatINR(bill.cgstAmount, 2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5">SGST 1.5%</td>
                    <td className="py-0.5 text-right tabular-nums">
                      {formatINR(bill.sgstAmount, 2)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="py-0.5">IGST 3%</td>
                  <td className="py-0.5 text-right tabular-nums">
                    {formatINR(bill.igstAmount, 2)}
                  </td>
                </tr>
              )}
              {bill.discountAmount > 0 && (
                <tr>
                  <td className="py-0.5">Discount</td>
                  <td className="py-0.5 text-right tabular-nums">
                    -{formatINR(bill.discountAmount, 2)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-0.5">Round Off</td>
                <td className="py-0.5 text-right tabular-nums">
                  {bill.roundOff >= 0 ? "+" : ""}
                  {formatINR(bill.roundOff, 2)}
                </td>
              </tr>
              <tr className="border-t-2 border-black text-sm font-bold">
                <td className="py-1">TOTAL</td>
                <td className="py-1 text-right tabular-nums">
                  {formatINR(bill.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-1 border-t border-black pt-1 text-[10px] italic">
          Amount in words: <strong>{amountInWords(bill.totalAmount)}</strong>
        </p>

        <div className="mt-1 flex justify-between text-[11px]">
          <span>
            Paid: <strong className="tabular-nums">{formatINR(bill.amountPaid, 2)}</strong>
          </span>
          <span>
            Balance:{" "}
            <strong className="tabular-nums">{formatINR(bill.balanceDue, 2)}</strong>
          </span>
        </div>

        {shop.bankDetails && (
          <div className="mt-2 border-t border-gray-400 pt-1 text-[9px] whitespace-pre-line">
            <span className="font-semibold">Bank Details: </span>
            {shop.bankDetails}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 border-t-2 border-black pt-2 text-[10px]">
          <div className="flex items-end justify-between">
            <p className="max-w-[60%]">
              Thank you for shopping at {shop.shopName}. All disputes subject to
              Tiruppur jurisdiction.
            </p>
            <div className="text-center">
              <div className="h-12" />
              <p className="border-t border-black px-6 pt-1 font-semibold">
                Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
