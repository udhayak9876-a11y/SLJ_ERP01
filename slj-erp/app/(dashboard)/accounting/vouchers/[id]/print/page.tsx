import { notFound } from "next/navigation";
import { getVoucher } from "@/lib/actions/vouchers";
import { getShopSettings } from "@/lib/actions/settings";
import { VoucherPrintView } from "@/components/accounting/VoucherPrintView";

export default async function VoucherPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const [voucher, settings] = await Promise.all([
    getVoucher(params.id),
    getShopSettings(),
  ]);
  if (!voucher) notFound();

  return <VoucherPrintView voucher={voucher} settings={settings} />;
}
