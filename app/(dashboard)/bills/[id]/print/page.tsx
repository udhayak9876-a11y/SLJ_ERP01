import { notFound } from "next/navigation";
import { getBill } from "@/lib/actions/bills";
import { getShopSettings } from "@/lib/actions/settings";
import { BillPrintView } from "@/components/bills/BillPrintView";

export default async function BillPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const [bill, settings] = await Promise.all([
    getBill(params.id),
    getShopSettings(),
  ]);

  if (!bill) notFound();

  return <BillPrintView bill={bill} settings={settings} />;
}
