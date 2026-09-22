import type { ReactNode } from "react";
import { authEnabled, isAuthed } from "@/lib/admin-auth";
import { trackingEnabled } from "@/lib/tracking";
import { Notice } from "./ui";
import LoginForm from "./LoginForm";

/**
 * Shared by every admin page. Returns a node to render *instead of* the page
 * when access isn't possible, or null when the caller may proceed.
 *
 * Fails closed: with no passcode configured the admin refuses to open rather
 * than quietly exposing a list of patient names.
 */
export async function adminGate(): Promise<ReactNode | null> {
  if (!authEnabled()) {
    return (
      <Notice title="Admin panel not configured">
        <p>
          Set <code className="font-mono text-ink">ADMIN_EMAIL</code> and{" "}
          <code className="font-mono text-ink">ADMIN_PASSCODE</code> in the Vercel project
          environment variables, then redeploy.
        </p>
        <p>Until it is set this page stays locked — it will not fall back to being public.</p>
      </Notice>
    );
  }

  if (!(await isAuthed())) return <LoginForm />;

  if (!trackingEnabled()) {
    return (
      <Notice title="Tracking database not connected">
        <p>
          Set <code className="font-mono text-ink">SUPABASE_URL</code>,{" "}
          <code className="font-mono text-ink">SUPABASE_PUBLISHABLE_KEY</code> and{" "}
          <code className="font-mono text-ink">SUPABASE_ADMIN_TOKEN</code> in the Vercel project
          environment variables, then redeploy.
        </p>
      </Notice>
    );
  }

  return null;
}
