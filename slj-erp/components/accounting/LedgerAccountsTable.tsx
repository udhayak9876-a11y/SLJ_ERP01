"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LedgerAccount, AccountGroup } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { createLedgerAccount, toggleLedgerAccountActive } from "@/lib/actions/ledger";

const schema = z.object({
  accountCode: z.string().min(1),
  accountName: z.string().min(1),
  accountGroup: z.enum(["ASSET", "LIABILITY", "INCOME", "EXPENSE", "EQUITY"]),
  openingBalance: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

interface LedgerAccountsTableProps {
  accounts: LedgerAccount[];
}

export function LedgerAccountsTable({ accounts }: LedgerAccountsTableProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accountGroup: "ASSET" },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await createLedgerAccount(data);
      toast.success("Account created");
      reset();
      setOpen(false);
      window.location.reload();
    } catch {
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Ledger Account</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label>Account Code</Label>
                <Input {...register("accountCode")} placeholder="6001" />
              </div>
              <div>
                <Label>Account Name</Label>
                <Input {...register("accountName")} />
              </div>
              <div>
                <Label>Group</Label>
                <Select value={watch("accountGroup")} onValueChange={(v) => setValue("accountGroup", v as AccountGroup)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["ASSET", "LIABILITY", "INCOME", "EXPENSE", "EQUITY"] as AccountGroup[]).map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Opening Balance</Label>
                <Input type="number" step="0.01" {...register("openingBalance")} />
              </div>
              <Button type="submit" disabled={loading}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Opening</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-mono">{a.accountCode}</TableCell>
              <TableCell>{a.accountName}</TableCell>
              <TableCell><Badge variant="secondary">{a.accountGroup}</Badge></TableCell>
              <TableCell><IndianCurrency amount={Number(a.openingBalance)} /></TableCell>
              <TableCell>{a.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => toggleLedgerAccountActive(a.id, !a.isActive).then(() => window.location.reload())}>
                  {a.isActive ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
