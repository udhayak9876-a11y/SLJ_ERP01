"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import {
  Customer,
  Item,
  SalesBill,
  SalesBillItem,
  ShopSettings,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { amountInWords } from "@/lib/utils/amountInWords";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

type BillWithRelations = SalesBill & {
  customer: Customer | null;
  items: (SalesBillItem & { item: Item })[];
};

interface BillPrintViewProps {
  bill: BillWithRelations;
  settings: ShopSettings;
}

export function BillPrintView({ bill, settings }: BillPrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const customerName =
    bill.customer?.name ?? bill.walkInName ?? "Walk-in Customer";
  const isTamilNadu =
    (bill.customer?.state ?? "Tamil Nadu") === "Tamil Nadu";

  return (
    <div>
      <div className="no-print mb-4 flex gap-2">
        <Button onClick={() => handlePrint()}>🖨 Print</Button>
        <Link href="/bills">
          <Button variant="outline">← Back to Bills</Button>
        </Link>
      </div>

      <div
        ref={printRef}
        className="mx-auto bg-white p-8 text-black"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase">
            {settings.shopName}
          </h1>
          <p className="text-sm">
            {settings.address}
            {settings.address && " | "}
            {settings.city}, {settings.state} — {settings.pincode}
          </p>
          <p className="text-sm">
            Phone: {settings.phone}
            {settings.gstin && ` | GSTIN: ${settings.gstin}`}
          </p>
          <p className="mt-2 text-lg font-semibold">TAX INVOICE</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-b py-3 text-sm">
          <div>
            <p className="font-semibold">Bill To:</p>
            <p>{customerName}</p>
            {bill.customer && (
              <>
                <p>
                  {bill.customer.address}, {bill.customer.city}
                </p>
                <p>Phone: {bill.customer.phone}</p>
                {bill.customer.gstin && <p>GSTIN: {bill.customer.gstin}</p>}
              </>
            )}
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Bill No:</span>{" "}
              {bill.billNumber || "DRAFT"}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {formatDateDDMMYYYY(bill.billDate)}
            </p>
            <p>
              <span className="font-semibold">Bill Type:</span> {bill.billType}
            </p>
            <p>
              <span className="font-semibold">Payment:</span> {bill.paymentMode}
            </p>
          </div>
        </div>

        <table className="mt-4 w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-1 text-left">S.No</th>
              <th className="p-1 text-left">Description</th>
              <th className="p-1">Tag</th>
              <th className="p-1">Gross</th>
              <th className="p-1">Stone</th>
              <th className="p-1">Net</th>
              <th className="p-1">Wastage</th>
              <th className="p-1">Total Wt</th>
              <th className="p-1">Rate</th>
              <th className="p-1">Gold Val</th>
              <th className="p-1">Making</th>
              <th className="p-1">Stone</th>
              <th className="p-1">Taxable</th>
              <th className="p-1">GST%</th>
              <th className="p-1">GST</th>
              <th className="p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={item.id} className="border-b">
                <td className="p-1">{idx + 1}</td>
                <td className="p-1">{item.description}</td>
                <td className="p-1 text-center">{item.tagNumber || "—"}</td>
                <td className="p-1 text-right">
                  {Number(item.grossWeight).toFixed(3)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.stoneWeight).toFixed(3)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.netWeight).toFixed(3)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.wastageWeight).toFixed(3)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.totalWeight).toFixed(3)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.ratePerGram).toFixed(2)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.goldValue).toFixed(2)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.makingChargeAmount).toFixed(2)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.stoneCharge).toFixed(2)}
                </td>
                <td className="p-1 text-right">
                  {Number(item.taxableAmount).toFixed(2)}
                </td>
                <td className="p-1 text-center">
                  {Number(item.gstRate).toFixed(1)}%
                </td>
                <td className="p-1 text-right">
                  {Number(item.gstAmount).toFixed(2)}
                </td>
                <td className="p-1 text-right font-semibold">
                  {Number(item.lineTotal).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-72 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <IndianCurrency amount={Number(bill.subtotal)} />
            </div>
            {isTamilNadu ? (
              <>
                <div className="flex justify-between">
                  <span>CGST 1.5%:</span>
                  <IndianCurrency amount={Number(bill.cgstAmount)} />
                </div>
                <div className="flex justify-between">
                  <span>SGST 1.5%:</span>
                  <IndianCurrency amount={Number(bill.sgstAmount)} />
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>IGST 3%:</span>
                <IndianCurrency amount={Number(bill.igstAmount)} />
              </div>
            )}
            {Number(bill.discountAmount) > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>
                  -<IndianCurrency amount={Number(bill.discountAmount)} />
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Round Off:</span>
              <span>
                {Number(bill.roundOff) >= 0 ? "+" : ""}
                <IndianCurrency amount={Number(bill.roundOff)} />
              </span>
            </div>
            <div className="flex justify-between border-t pt-1 text-base font-bold">
              <span>TOTAL:</span>
              <IndianCurrency amount={Number(bill.totalAmount)} />
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm">
          Amount in words: {amountInWords(Number(bill.totalAmount))}
        </p>
        <p className="text-sm">
          Paid: <IndianCurrency amount={Number(bill.amountPaid)} /> | Balance:{" "}
          <IndianCurrency amount={Number(bill.balanceDue)} />
        </p>

        {settings.bankDetails && (
          <p className="mt-2 text-xs">Bank: {settings.bankDetails}</p>
        )}

        <div className="mt-8 border-t pt-4 text-center text-xs">
          <p>Thank you for shopping at {settings.shopName}.</p>
          <p>All disputes subject to Tiruppur jurisdiction.</p>
          <p className="mt-8 text-right">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}
