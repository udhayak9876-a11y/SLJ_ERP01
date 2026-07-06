import { getShopSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const settings = await getShopSettings();
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Settings</h2>
      <SettingsForm settings={settings} />
    </div>
  );
}
