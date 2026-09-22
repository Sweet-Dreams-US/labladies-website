import { listLabs } from "@/lib/tracking";
import { adminGate } from "../gate";
import ReferenceEditor, { type FieldSpec, type RefRow } from "../ReferenceEditor";
import { Panel } from "../ui";

export const dynamic = "force-dynamic";

const fields: FieldSpec[] = [
  { key: "name", label: "Laboratory name", type: "text", placeholder: "e.g. My Clinical" },
  { key: "short_code", label: "Short code", type: "text", hint: "How it appears on a worksheet." },
  {
    key: "is_reference_lab",
    label: "Local reference lab — we have chart access",
    type: "checkbox",
    hint: "Turn this on when Lab Ladies can see the chart and is responsible for sending results to the ordering practitioner. This is what makes the results follow-up steps and the overdue alerts apply.",
    wide: true,
  },
  {
    key: "requires_provider_account",
    label: "Needs the ordering provider's own account",
    type: "checkbox",
    hint: "Quest and Labcorp. Once the specimen is delivered Lab Ladies has no further access, so there is nothing to follow up.",
    wide: true,
  },
  { key: "sort_order", label: "Order in the list", type: "number", hint: "Lower shows first." },
  { key: "notes", label: "Notes", type: "textarea", wide: true },
  { key: "active", label: "Currently in use", type: "checkbox", wide: true },
];

export default async function LabsPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const labs = await listLabs(true);

  // Computed server-side — see the note in practices/page.tsx.
  const rows: RefRow[] = labs.map((l) => ({
    ...l,
    badges: l.is_reference_lab
      ? [{ tone: "good" as const, text: "Reference lab — we follow up" }]
      : l.requires_provider_account
        ? [{ tone: "info" as const, text: "Provider's own account" }]
        : [],
    subtitle: [l.short_code, l.notes].filter(Boolean).join(" · "),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Laboratories
        </h1>
        <p className="mt-1 max-w-3xl text-muted">
          Where specimens go, and which of them you are responsible for following up.
        </p>
      </div>

      <Panel title="Why the difference matters">
        <div className="space-y-3 p-5 text-sm leading-relaxed text-muted">
          <p>
            <strong className="text-ink">Reference labs</strong> — My Clinical and GSB. You have
            access to the patient chart, you review results, and it is on you to send them to the
            ordering practitioner. The tracking board shows the results columns for these visits
            and will flag one that has been sitting too long.
          </p>
          <p>
            <strong className="text-ink">Quest and Labcorp</strong> — the ordering doctor has to
            have their own account. Once the specimen is drawn and delivered you have no further
            access, so the board hides the results columns for these visits and never flags them as
            overdue. There is nothing there for you to chase.
          </p>
        </div>
      </Panel>

      <ReferenceEditor
        endpoint="/api/admin/labs"
        noun="laboratory"
        rows={rows}
        fields={fields}
        defaults={{ sort_order: 100 }}
      />
    </div>
  );
}
