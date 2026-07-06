"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type QuickCustomer = { customerId: string; customerCode: string; name: string };

export function QuickAddCustomer({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (customer: QuickCustomer) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to add customer");
      return;
    }

    const data = await res.json();
    onAdded({ customerId: data.id, customerCode: data.customerCode, name: data.name });
    setName("");
    setPhone("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Quick Add Customer">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button onClick={submit} className="w-full">
          Save
        </Button>
      </div>
    </Dialog>
  );
}
