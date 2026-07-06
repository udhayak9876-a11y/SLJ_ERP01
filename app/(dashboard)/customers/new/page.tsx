import { CustomerForm } from "@/components/customers/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-navy">Add New Customer</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Customer code will be auto-generated on save (CUS-0001, CUS-0002, …).
      </p>
      <CustomerForm />
    </div>
  );
}
