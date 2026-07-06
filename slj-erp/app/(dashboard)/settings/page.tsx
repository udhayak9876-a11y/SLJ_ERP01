"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial = {
  shopName: "Sri Lakshmi Jewellery",
  address: "",
  city: "Tiruppur",
  state: "Tamil Nadu",
  pincode: "",
  phone: "",
  email: "",
  gstin: "",
  bankDetails: "",
  logoUrl: "",
};

export default function SettingsPage() {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(async (res) => setForm({ ...initial, ...(await res.json()) }));
  }, []);

  async function save() {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMessage("Settings saved successfully.");
  }

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-xl font-semibold">Shop Settings</h1>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <label className="mb-1 block text-sm capitalize">{key}</label>
            <Input value={value} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}
      </div>
      {message ? <p className="text-sm text-green-600">{message}</p> : null}
      <Button onClick={save}>Save Settings</Button>
    </div>
  );
}
