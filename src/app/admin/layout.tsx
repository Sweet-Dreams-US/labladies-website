import type { Metadata } from "next";
import { isAuthed } from "@/lib/admin-auth";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: "Tracking board",
  // Belt and braces alongside the robots.ts disallow: the admin must never be
  // indexed, and it carries patient names.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The nav is only drawn once past the gate; an unauthenticated visitor gets
  // the bare login card with nothing to click.
  const authed = await isAuthed();

  return (
    <div className="min-h-screen bg-cream">
      {authed && <AdminNav />}
      <div className={authed ? "mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8" : ""}>
        {children}
      </div>
    </div>
  );
}
