"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { quickAddCustomer } from "@/lib/actions/customers";
import { PHONE_REGEX } from "@/lib/utils/validation";

export interface QuickAddResult {
  customerId: string;
  customerCode: string;
  name: string;
}

interface QuickAddCustomerProps {
  onAdded: (customer: QuickAddResult) => void;
}

/** Modal to add a customer (name + phone only) without leaving the billing screen. */
export function QuickAddCustomer({ onAdded }: QuickAddCustomerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      setError("Phone must be exactly 10 digits");
      return;
    }

    setSaving(true);
    try {
      const result = await quickAddCustomer({ name: name.trim(), phone });
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast({
        title: `Customer added: ${result.customerCode}`,
        variant: "success",
      });
      onAdded({
        customerId: result.customerId,
        customerCode: result.customerCode,
        name: result.name,
      });
      setOpen(false);
      setName("");
      setPhone("");
    } catch {
      setError("Failed to add customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" title="Quick add customer">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Quick Add Customer</DialogTitle>
          <DialogDescription>
            Add a customer with name and phone. Full details can be filled in
            later from the Customers page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="qa-name">Name *</Label>
            <Input
              id="qa-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qa-phone">Phone * (10 digits)</Label>
            <Input
              id="qa-phone"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Adding…" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
