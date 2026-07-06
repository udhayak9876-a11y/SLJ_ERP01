import { getCustomers } from "@/lib/actions/customers";
import { CustomersTable } from "@/components/customers/CustomersTable";

export default async function CustomersPage() {
  const customers = await getCustomers();
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Customer Master</h2>
      <CustomersTable customers={customers} />
    </div>
  );
}
