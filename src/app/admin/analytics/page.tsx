import Link from "next/link";
import { getAnalyticsSummary, type Bucket } from "@/lib/analytics";
import { listInquiries } from "@/lib/inquiries";
import { adminGate } from "../gate";
import { Empty, Panel } from "../ui";
import DailyChart from "./DailyChart";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/services": "Services",
  "/pcr-testing": "PCR Testing",
  "/pricing": "Pricing",
  "/about": "About Us",
  "/contact": "Contact",
  "/blog": "Blog",
  "/areas": "Service Areas",
  "/privacy": "Privacy Policy",
};
const pageName = (p: string) => PAGE_NAMES[p] ?? p;

/** Real callback requests (not spam) in the same window as the visit counts. */
function requestsInLast<T extends { created_at: string; status: string }>(rows: T[], days: number) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return rows.filter((r) => Date.parse(r.created_at) >= since && r.status !== "spam");
}

const DEVICE_NAMES: Record<string, string> = { mobile: "Phone", tablet: "Tablet", desktop: "Computer" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const { days: raw } = await searchParams;
  const days = RANGES.includes(Number(raw) as (typeof RANGES)[number]) ? Number(raw) : 30;

  const [summary, inquiries] = await Promise.all([getAnalyticsSummary(days), listInquiries()]);
  const requests = requestsInLast(inquiries, days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Website visits
          </h1>
          <p className="mt-1 text-muted">
            Who&rsquo;s finding the site, and how. Counted without cookies; your own visits to the
            admin aren&rsquo;t included.
          </p>
        </div>
        {/* Range filter, one row above the charts. */}
        <nav aria-label="Time range" className="flex gap-1 rounded-lg bg-white p-1 ring-1 ring-cream-deep">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              aria-current={r === days ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm font-bold ${
                r === days ? "bg-brand text-white" : "text-muted hover:bg-cream hover:text-ink"
              }`}
            >
              {r} days
            </Link>
          ))}
        </nav>
      </div>

      {!summary ? (
        <Panel>
          <Empty>Couldn&rsquo;t load the numbers just now. Refresh to try again.</Empty>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Tile label="Visitors" value={summary.visitors} prev={summary.prev_visitors} days={days} />
            <Tile label="Page views" value={summary.views} prev={summary.prev_views} days={days} />
            <Tile
              label="Callback requests"
              value={requests.length}
              note={
                summary.visitors > 0
                  ? `${((requests.length / summary.visitors) * 100).toFixed(1)}% of visitors`
                  : undefined
              }
            />
          </div>

          <Panel title={`Page views per day — last ${days} days`}>
            {summary.views === 0 ? (
              <Empty>
                No visits counted yet. Counting started when the site moved to labladies.com —
                check back in a day or two.
              </Empty>
            ) : (
              <DailyChart daily={summary.daily} />
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <BarList
              title="Most-viewed pages"
              rows={summary.pages.map((r) => ({ ...r, label: pageName(r.label) }))}
            />
            <BarList
              title="Where visitors came from"
              rows={summary.referrers}
              hint="“Direct” means they typed the address or used a bookmark."
            />
            <BarList
              title="Device"
              rows={summary.devices.map((r) => ({ ...r, label: DEVICE_NAMES[r.label] ?? r.label }))}
            />
            <BarList title="Country" rows={summary.countries} />
          </div>
        </>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  prev,
  days,
  note,
}: {
  label: string;
  value: number;
  prev?: number;
  days?: number;
  note?: string;
}) {
  let change: string | null = null;
  if (prev !== undefined && days) {
    if (prev === 0) change = value > 0 ? `New — none in the ${days} days before` : null;
    else {
      const pct = Math.round(((value - prev) / prev) * 100);
      change = `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs the ${days} days before`;
    }
  }
  return (
    <div className="rounded-2xl border border-cream-deep bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink tabular-nums">
        {value.toLocaleString()}
      </p>
      {(change || note) && <p className="mt-1 text-sm text-muted">{change ?? note}</p>}
    </div>
  );
}

/** A ranked list with a proportional bar behind each count. Text stays in ink. */
function BarList({ title, rows, hint }: { title: string; rows: Bucket[]; hint?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <Panel title={title} description={hint}>
      {rows.length === 0 ? (
        <Empty>Nothing yet.</Empty>
      ) : (
        <ul className="space-y-1.5 p-4">
          {rows.map((r) => (
            <li key={r.label} className="relative overflow-hidden rounded-md">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-md bg-brand/12"
                style={{ width: `${(r.views / max) * 100}%` }}
              />
              <span className="relative flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="truncate font-medium text-ink">{r.label}</span>
                <span className="font-semibold text-ink tabular-nums">{r.views.toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
