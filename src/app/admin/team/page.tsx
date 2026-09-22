import { listPhlebotomists } from "@/lib/tracking";
import { adminGate } from "../gate";
import ReferenceEditor, { type FieldSpec, type RefRow } from "../ReferenceEditor";

export const dynamic = "force-dynamic";

const fields: FieldSpec[] = [
  { key: "name", label: "Name", type: "text", placeholder: "e.g. Sandra S." },
  { key: "initials", label: "Initials", type: "text", hint: "What goes in the initials column." },
  { key: "active", label: "Currently collecting", type: "checkbox", wide: true },
];

export default async function TeamPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const team = await listPhlebotomists(true);

  // Computed server-side — see the note in practices/page.tsx.
  const rows: RefRow[] = team.map((t) => ({
    ...t,
    badges: [{ tone: "neutral" as const, text: t.initials }],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Who collects
        </h1>
        <p className="mt-1 max-w-3xl text-muted">
          The phlebotomists and nurses you record against a collection.
        </p>
      </div>

      <ReferenceEditor
        endpoint="/api/admin/phlebotomists"
        noun="team member"
        rows={rows}
        fields={fields}
      />
    </div>
  );
}
