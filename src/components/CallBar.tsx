import { ChatIcon, PhoneIcon } from "@/components/Icons";
import { site } from "@/lib/site";

/** Fixed call/text bar on small screens — the site's primary goal is phone calls. */
export function CallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-cream-deep bg-white/95 p-2.5 backdrop-blur md:hidden">
      <a
        href={site.phoneHref}
        className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-lg font-extrabold text-white"
      >
        <PhoneIcon className="h-5 w-5" />
        Call Now
      </a>
      <a
        href={site.smsHref}
        className="flex min-h-14 w-32 items-center justify-center gap-2 rounded-full bg-cream text-lg font-extrabold text-brand-ink ring-2 ring-inset ring-brand/25"
      >
        <ChatIcon className="h-5 w-5" />
        Text
      </a>
    </div>
  );
}
