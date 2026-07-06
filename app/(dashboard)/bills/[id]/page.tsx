import { redirect } from "next/navigation";

export default function BillDetailPage({ params }: { params: { id: string } }) {
  redirect(`/bills/${params.id}/print`);
}
