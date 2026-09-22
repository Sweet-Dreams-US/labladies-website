import { listInquiries } from "@/lib/inquiries";
import { adminGate } from "../gate";
import InquiryBoard from "./InquiryBoard";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const rows = await listInquiries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Website inquiries
        </h1>
        <p className="mt-1 max-w-3xl text-muted">
          People who asked for a callback through the form on the website. Call them, then tap
          where they have got to — the time is filled in for you.
        </p>
      </div>

      <InquiryBoard rows={rows} />
    </div>
  );
}
