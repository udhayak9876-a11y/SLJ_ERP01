import { getShopSettings } from "@/lib/data";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getShopSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-navy">Shop Settings</h1>
      <SettingsForm
        settings={{
          shopName: settings.shopName,
          address: settings.address,
          city: settings.city,
          state: settings.state,
          pincode: settings.pincode,
          phone: settings.phone,
          email: settings.email,
          gstin: settings.gstin,
          bankDetails: settings.bankDetails,
          logoUrl: settings.logoUrl,
        }}
      />
    </div>
  );
}
