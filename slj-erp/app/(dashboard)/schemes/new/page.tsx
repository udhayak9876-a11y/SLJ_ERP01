import Link from "next/link";
import { SchemeForm } from "@/components/schemes/SchemeForm";

export default function NewSchemePage() {
  return (
    <div>
      <Link href="/schemes/list" className="text-sm text-muted-foreground hover:underline">← Schemes</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">New Gold Saving Scheme</h2>
      <SchemeForm />
    </div>
  );
}
