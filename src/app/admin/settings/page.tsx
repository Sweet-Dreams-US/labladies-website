import { getSiteSettings } from "@/lib/settings";
import { adminGate } from "../gate";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Website settings
        </h1>
        <p className="mt-1 text-muted">
          Your Google links. Saving publishes straight to the website — nothing else to do.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
