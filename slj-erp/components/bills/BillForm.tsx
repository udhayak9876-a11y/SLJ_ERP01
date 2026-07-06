"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BillLineItems, emptyRow, type BillItemRow } from "@/components/bills/BillLineItems";
import { formatINR } from "@/lib/utils/currency";
import { QuickAddCustomer, type QuickCustomer } from "@/components/customers/QuickAddCustomer";

export function BillForm({
  customers,
  items,
  todaysRate,
  userEmail,
}: {
  customers: any[];
  items: any[];
  todaysRate: any | null;
  userEmail: string;
}) {
  const router = useRouter();
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [billType, setBillType] = useState("CASH");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [customerId, setCustomerId] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [rows, setRows] = useState<BillItemRow[]>([emptyRow()]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [openQuickAdd, setOpenQuickAdd] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const customerState = selectedCustomer?.state || "Tamil Nadu";

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => sum + row.taxableAmount, 0);
    const gst = customerState === "Tamil Nadu"
      ? { cgst: subtotal * 0.015, sgst: subtotal * 0.015, igst: 0 }
      : { cgst: 0, sgst: 0, igst: subtotal * 0.03 };
    const preRound = subtotal + gst.cgst + gst.sgst + gst.igst - discountAmount;
    const roundedTotal = Math.round(preRound);
    const roundOff = roundedTotal - preRound;
    const balanceDue = roundedTotal - amountPaid;

    return { subtotal, ...gst, roundedTotal, roundOff, balanceDue };
  }, [rows, customerState, discountAmount, amountPaid]);

  async function save(status: "DRAFT" | "CONFIRMED") {
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billDate,
        billType,
        paymentMode,
        customerId: customerId || null,
        customerState,
        walkInName: customerId ? null : walkInName,
        discountAmount,
        amountPaid,
        createdBy: userEmail,
        status,
        items: rows,
      }),
    });

    const bill = await res.json();
    if (status === "CONFIRMED") router.push(`/bills/${bill.id}/print`);
    else router.push("/bills");
  }

  function handleQuickCustomer(customer: QuickCustomer) {
    setCustomerId(customer.customerId);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3">
        <h2 className="mb-3 text-sm font-semibold">Bill Header</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs">Bill Date</label>
            <Input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs">Bill Type</label>
            <Select value={billType} onChange={(e) => setBillType(e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="CREDIT">Credit</option>
              <option value="EXCHANGE">Exchange</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs">Customer</label>
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Walk-in</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customerCode} - {customer.name}
                </option>
              ))}
            </Select>
            <Button type="button" variant="outline" className="mt-1 h-8 px-2" onClick={() => setOpenQuickAdd(true)}>
              + Quick Add
            </Button>
          </div>
          <div>
            <label className="mb-1 block text-xs">Payment Mode</label>
            <Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
              <option value="MULTIPLE">Multiple</option>
            </Select>
          </div>
        </div>
        {!customerId ? (
          <div className="mt-3 max-w-sm">
            <label className="mb-1 block text-xs">Walk-in Name</label>
            <Input value={walkInName} onChange={(e) => setWalkInName(e.target.value)} />
          </div>
        ) : null}
      </div>

      <BillLineItems rows={rows} setRows={setRows} items={items} defaultRates={todaysRate} />

      <div className="ml-auto w-full max-w-md rounded-md border p-3">
        <h3 className="mb-2 text-sm font-semibold">Totals</h3>
        <div className="space-y-1 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatINR(totals.subtotal)}</span></p>
          {customerState === "Tamil Nadu" ? (
            <>
              <p className="flex justify-between"><span>CGST (1.5%)</span><span>{formatINR(totals.cgst)}</span></p>
              <p className="flex justify-between"><span>SGST (1.5%)</span><span>{formatINR(totals.sgst)}</span></p>
            </>
          ) : (
            <p className="flex justify-between"><span>IGST (3%)</span><span>{formatINR(totals.igst)}</span></p>
          )}
          <div className="grid grid-cols-2 items-center gap-2">
            <span>Discount</span>
            <Input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} />
          </div>
          <p className="flex justify-between"><span>Round Off</span><span>{formatINR(totals.roundOff)}</span></p>
          <p className="flex justify-between text-lg font-bold"><span>TOTAL</span><span>{formatINR(totals.roundedTotal)}</span></p>
          <div className="grid grid-cols-2 items-center gap-2">
            <span>Amount Paid</span>
            <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} />
          </div>
          <p className="flex justify-between font-semibold"><span>Balance Due</span><span>{formatINR(totals.balanceDue)}</span></p>
        </div>

        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" onClick={() => save("DRAFT")}>Save as Draft</Button>
          <Button type="button" onClick={() => save("CONFIRMED")}>Confirm & Print</Button>
        </div>
      </div>

      <QuickAddCustomer open={openQuickAdd} onClose={() => setOpenQuickAdd(false)} onAdded={handleQuickCustomer} />
    </div>
  );
}
