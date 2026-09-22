import { listEncounterRows } from "@/lib/tracking";
import { adminGate } from "../gate";
import TrackingBoard from "./TrackingBoard";

export const dynamic = "force-dynamic";

export default async function TrackingPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const { rows, reference } = await listEncounterRows();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Collection tracking
        </h1>
        <p className="mt-1 text-muted">
          Every visit, what was collected, where it went, and whether you have been paid.
        </p>
      </div>
      <TrackingBoard rows={rows} reference={reference} />
    </div>
  );
}
