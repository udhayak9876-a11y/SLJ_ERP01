"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  async function load() {
    const res = await fetch("/api/items");
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "ALL" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  async function toggle(item: any) {
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Item Master</h1>
        <Link href="/items/new"><Button>Add New Item</Button></Link>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Input placeholder="Search by name or code" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="ALL">All categories</option>
          <option value="GOLD">Gold</option>
          <option value="SILVER">Silver</option>
          <option value="DIAMOND">Diamond</option>
          <option value="STONE">Stone</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="px-2 py-2">Item Code</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Category</th><th className="px-2 py-2">Karat</th><th className="px-2 py-2">Making Charge</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id}>
              <td className="border-b px-2 py-2">{item.itemCode}</td>
              <td className="border-b px-2 py-2">{item.itemName}</td>
              <td className="border-b px-2 py-2">{item.category}</td>
              <td className="border-b px-2 py-2">{item.karat ?? "-"}</td>
              <td className="border-b px-2 py-2">{item.makingChargeType} - {Number(item.makingChargeValue).toFixed(2)}</td>
              <td className="border-b px-2 py-2">{item.isActive ? "Active" : "Inactive"}</td>
              <td className="border-b px-2 py-2">
                <div className="flex gap-2">
                  <Link href={`/items/${item.id}/edit`}><Button variant="outline">Edit</Button></Link>
                  <Button variant="outline" onClick={() => toggle(item)}>{item.isActive ? "Deactivate" : "Activate"}</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
