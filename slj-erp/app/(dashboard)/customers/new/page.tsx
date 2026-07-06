import { CustomerForm } from "@/components/customers/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Add New Customer</h2>
      <CustomerForm />
    </div>
  );
}
