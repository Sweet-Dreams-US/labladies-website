import { listActivity } from "@/lib/tracking";
import { adminGate } from "../gate";
import { Empty, Panel } from "../ui";

export const dynamic = "force-dynamic";

/**
 * A plain record of what changed and when.
 *
 * Summaries name the fields that were touched, never their values — so this
 * page is safe to leave open and contains no patient detail beyond a name on
 * creation.
 */
export default async function ActivityPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const entries = await listActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Activity</h1>
        <p className="mt-1 max-w-3xl text-muted">
          The last 60 changes made from this admin, newest first.
        </p>
      </div>

      <Panel>
        {entries.length === 0 ? (
          <Empty>Nothing recorded yet.</Empty>
        ) : (
          <ul className="divide-y divide-cream-deep">
            {entries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3">
                <span className="text-sm text-ink">{e.summary}</span>
                <time
                  dateTime={e.created_at}
                  className="text-xs whitespace-nowrap text-muted tabular-nums"
                >
                  {new Date(e.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
