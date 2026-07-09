"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCounter, toggleCounterActive } from "@/lib/actions/counters";
import { Counter, MetalType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = z.object({
  counterName: z.string().min(1, "Name required"),
  location: z.string().min(1, "Location required"),
  metalType: z.enum(["GOLD", "SILVER", "DIAMOND"]),
});

type FormData = z.infer<typeof schema>;

interface CountersTableProps {
  counters: Counter[];
}

export function CountersTable({ counters }: CountersTableProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { counterName: "", location: "", metalType: "GOLD" },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await createCounter(data);
      toast.success("Counter created");
      reset();
      setOpen(false);
      window.location.reload();
    } catch {
      toast.error("Failed to create counter");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    try {
      await toggleCounterActive(id, !current);
      toast.success(current ? "Counter deactivated" : "Counter activated");
      window.location.reload();
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Counter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Counter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Counter Name</Label>
                <Input {...register("counterName")} placeholder="Gold Counter A" />
                {errors.counterName && (
                  <p className="text-sm text-red-500">{errors.counterName.message}</p>
                )}
              </div>
              <div>
                <Label>Location</Label>
                <Input {...register("location")} placeholder="Front Display" />
              </div>
              <div>
                <Label>Metal Type</Label>
                <Select
                  value={watch("metalType")}
                  onValueChange={(v) => setValue("metalType", v as MetalType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="DIAMOND">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Metal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {counters.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs">{c.counterCode}</TableCell>
              <TableCell>{c.counterName}</TableCell>
              <TableCell>{c.location}</TableCell>
              <TableCell>
                <Badge variant="secondary">{c.metalType}</Badge>
              </TableCell>
              <TableCell>{c.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(c.id, c.isActive)}
                >
                  {c.isActive ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {counters.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No counters yet. Add your first display counter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
