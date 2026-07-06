import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CustomersTable } from "@/components/customers/CustomersTable";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { customerCode: "asc" },
    include: {
      bills: {
        where: { status: "CONFIRMED" },
        select: { balanceDue: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy">Customer Master</h1>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="h-4 w-4" />
            Add New Customer
          </Link>
        </Button>
      </div>
      <CustomersTable
        customers={customers.map((c) => ({
          id: c.id,
          customerCode: c.customerCode,
          name: c.name,
          phone: c.phone,
          city: c.city,
          customerType: c.customerType,
          balance:
            Number(c.openingBalance) +
            c.bills.reduce((sum, b) => sum + Number(b.balanceDue), 0),
          isActive: c.isActive,
        }))}
      />
    </div>
  );
}
