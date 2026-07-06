"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatINR } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  useEffect(() => {
    fetch("/api/customers").then(async (r) => setCustomers(await r.json()));
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search);
      const matchesType = type === "ALL" || customer.customerType === type;
      return matchesSearch && matchesType;
    });
  }, [customers, search, type]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Customer Master</h1>
        <Link href="/customers/new"><Button>Add Customer</Button></Link>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Input placeholder="Search by name or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="ALL">All types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="VIP">VIP</option>
        </Select>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="px-2 py-2">Code</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Phone</th><th className="px-2 py-2">City</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((customer) => (
            <tr key={customer.id}>
              <td className="border-b px-2 py-2">{customer.customerCode}</td>
              <td className="border-b px-2 py-2">{customer.name}</td>
              <td className="border-b px-2 py-2">{customer.phone}</td>
              <td className="border-b px-2 py-2">{customer.city}</td>
              <td className="border-b px-2 py-2">{customer.customerType}</td>
              <td className="border-b px-2 py-2">{formatINR(Number(customer.openingBalance || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
