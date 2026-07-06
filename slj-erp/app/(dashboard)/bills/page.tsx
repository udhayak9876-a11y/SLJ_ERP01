"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDisplayDate } from "@/lib/utils/date";
import { formatINR } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [status, setStatus] = useState("ALL");
  const [paymentMode, setPaymentMode] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function load() {
    const res = await fetch("/api/bills");
    setBills(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return bills.filter((bill) => {
      const billDate = new Date(bill.billDate);
      const inFrom = !fromDate || billDate >= new Date(fromDate);
      const inTo = !toDate || billDate <= new Date(toDate + "T23:59:59");
      const statusOk = status === "ALL" || bill.status === status;
      const paymentOk = paymentMode === "ALL" || bill.paymentMode === paymentMode;
      return inFrom && inTo && statusOk && paymentOk;
    });
  }, [bills, status, paymentMode, fromDate, toDate]);

  const today = new Date().toISOString().slice(0, 10);
  const todayConfirmed = bills.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.billDate).toISOString().slice(0, 10) === today,
  );
  const summaryTotal = todayConfirmed.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
  const summaryCash = todayConfirmed
    .filter((bill) => bill.paymentMode === "CASH")
    .reduce((sum, bill) => sum + Number(bill.amountPaid), 0);

  async function cancelBill(id: string) {
    await fetch(`/api/bills/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bills List</h1>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div className="rounded-md border p-3 text-sm">Today’s total sales: <b>{formatINR(summaryTotal)}</b></div>
        <div className="rounded-md border p-3 text-sm">Count: <b>{todayConfirmed.length}</b></div>
        <div className="rounded-md border p-3 text-sm">Cash collected: <b>{formatINR(summaryCash)}</b></div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
        <input type="date" className="h-9 rounded-md border px-3" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" className="h-9 rounded-md border px-3" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All status</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
          <option value="ALL">All payment modes</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="UPI">UPI</option>
          <option value="CHEQUE">Cheque</option>
          <option value="MULTIPLE">Multiple</option>
        </Select>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="px-2 py-2">Bill No</th><th className="px-2 py-2">Date</th><th className="px-2 py-2">Customer</th><th className="px-2 py-2">Items</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Paid</th><th className="px-2 py-2">Balance</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((bill) => (
            <tr key={bill.id}>
              <td className="border-b px-2 py-2">{bill.billNumber}</td>
              <td className="border-b px-2 py-2">{formatDisplayDate(bill.billDate)}</td>
              <td className="border-b px-2 py-2">{bill.customer?.name || bill.walkInName || "Walk-in"}</td>
              <td className="border-b px-2 py-2">{bill.items.length}</td>
              <td className="border-b px-2 py-2">{formatINR(Number(bill.totalAmount))}</td>
              <td className="border-b px-2 py-2">{formatINR(Number(bill.amountPaid))}</td>
              <td className="border-b px-2 py-2">{formatINR(Number(bill.balanceDue))}</td>
              <td className="border-b px-2 py-2">
                <Badge className={bill.status === "CONFIRMED" ? "bg-green-100 text-green-700" : bill.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}>
                  {bill.status}
                </Badge>
              </td>
              <td className="border-b px-2 py-2">
                <div className="flex gap-2">
                  <Link href={`/bills/${bill.id}/print`}><Button variant="outline">View/Print</Button></Link>
                  {bill.status === "CONFIRMED" ? <Button variant="destructive" onClick={() => cancelBill(bill.id)}>Cancel</Button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
