"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils/date";
import { formatINR } from "@/lib/utils/currency";

type DailyRate = {
  id: string;
  date: string;
  gold24kRate: number;
  gold22kRate: number;
  gold18kRate: number;
  silverRate: number;
  enteredBy: string;
  notes?: string;
};

export default function RatesPage() {
  const [todayRate, setTodayRate] = useState({
    gold24kRate: "",
    gold22kRate: "",
    gold18kRate: "",
    silverRate: "",
    notes: "",
  });
  const [history, setHistory] = useState<DailyRate[]>([]);
  const [userEmail, setUserEmail] = useState("admin@slj.local");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/rates");
    const data = await res.json();
    if (data.todayRate) {
      setTodayRate({
        gold24kRate: String(data.todayRate.gold24kRate),
        gold22kRate: String(data.todayRate.gold22kRate),
        gold18kRate: String(data.todayRate.gold18kRate),
        silverRate: String(data.todayRate.silverRate),
        notes: data.todayRate.notes ?? "",
      });
    }
    setHistory(data.history || []);
  }

  useEffect(() => {
    load();
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((u) => setUserEmail(u?.email || "admin@slj.local"))
      .catch(() => undefined);
  }, []);

  async function save() {
    await fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...todayRate, enteredBy: userEmail }),
    });
    setMsg("Rate saved successfully.");
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Daily Gold/Silver Rate</h1>
      <div className="rounded-md border p-3">
        <h2 className="mb-2 text-sm font-semibold">Today’s rate entry</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div><label className="text-xs">24K per gram (₹)</label><Input type="number" value={todayRate.gold24kRate} onChange={(e) => setTodayRate((p) => ({ ...p, gold24kRate: e.target.value }))} /></div>
          <div><label className="text-xs">22K per gram (₹)</label><Input type="number" value={todayRate.gold22kRate} onChange={(e) => setTodayRate((p) => ({ ...p, gold22kRate: e.target.value }))} /></div>
          <div><label className="text-xs">18K per gram (₹)</label><Input type="number" value={todayRate.gold18kRate} onChange={(e) => setTodayRate((p) => ({ ...p, gold18kRate: e.target.value }))} /></div>
          <div><label className="text-xs">Silver per gram (₹)</label><Input type="number" value={todayRate.silverRate} onChange={(e) => setTodayRate((p) => ({ ...p, silverRate: e.target.value }))} /></div>
          <div><label className="text-xs">Notes</label><Input value={todayRate.notes} onChange={(e) => setTodayRate((p) => ({ ...p, notes: e.target.value }))} /></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button onClick={save}>Save</Button>
          {msg ? <span className="text-sm text-green-600">{msg}</span> : null}
        </div>
      </div>

      <div className="rounded-md border p-3">
        <h2 className="mb-2 text-sm font-semibold">Rate history (last 30 days)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="px-2 py-2">Date</th><th className="px-2 py-2">24K</th><th className="px-2 py-2">22K</th><th className="px-2 py-2">18K</th><th className="px-2 py-2">Silver</th><th className="px-2 py-2">Entered By</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rate) => (
              <tr key={rate.id}>
                <td className="border-b px-2 py-2">{formatDisplayDate(rate.date)}</td>
                <td className="border-b px-2 py-2">{formatINR(Number(rate.gold24kRate))}</td>
                <td className="border-b px-2 py-2">{formatINR(Number(rate.gold22kRate))}</td>
                <td className="border-b px-2 py-2">{formatINR(Number(rate.gold18kRate))}</td>
                <td className="border-b px-2 py-2">{formatINR(Number(rate.silverRate))}</td>
                <td className="border-b px-2 py-2">{rate.enteredBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
