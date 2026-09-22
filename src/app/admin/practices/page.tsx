import { listPractices } from "@/lib/tracking";
import { PRACTICE_KIND_LABEL } from "@/lib/tracking-types";
import { adminGate } from "../gate";
import ReferenceEditor, { type FieldSpec, type RefRow } from "../ReferenceEditor";

export const dynamic = "force-dynamic";

const fields: FieldSpec[] = [
  { key: "name", label: "Name", type: "text", placeholder: "e.g. Christina Rowe, NP" },
  { key: "organization", label: "Practice / organisation", type: "text", placeholder: "e.g. Florida Elder Care" },
  {
    key: "kind",
    label: "Type",
    type: "select",
    options: Object.entries(PRACTICE_KIND_LABEL).map(([value, label]) => ({ value, label })),
  },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "email", label: "Email", type: "email" },
  { key: "fax", label: "Fax", type: "tel", hint: "Where results get sent, if they go by fax." },
  { key: "sort_order", label: "Order in the list", type: "number", hint: "Lower shows first." },
  { key: "notes", label: "Notes", type: "textarea", wide: true },
  { key: "active", label: "Currently sending us work", type: "checkbox", wide: true },
];

export default async function PracticesPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const practices = await listPractices(true);

  // Display extras are worked out here, server-side: the editor is a Client
  // Component and a render function cannot be passed across that boundary.
  const rows: RefRow[] = practices.map((p) => ({
    ...p,
    badges: [{ tone: "neutral", text: PRACTICE_KIND_LABEL[p.kind] ?? "Practice" }],
    subtitle: [p.organization, p.phone, p.email, p.notes].filter(Boolean).join(" · "),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Ordering practitioners
        </h1>
        <p className="mt-1 max-w-3xl text-muted">
          The doctors, nurse practitioners and practices that send Lab Ladies work. These are the
          options in the &ldquo;ordering practitioner&rdquo; box on a collection, and who results
          get forwarded to.
        </p>
      </div>

      <ReferenceEditor
        endpoint="/api/admin/practices"
        noun="practitioner"
        rows={rows}
        fields={fields}
        defaults={{ kind: "practice", sort_order: 100 }}
      />
    </div>
  );
}
