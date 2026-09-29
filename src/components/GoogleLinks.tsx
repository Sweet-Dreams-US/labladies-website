import { Button } from "@/components/ui";
import type { SiteSettings } from "@/lib/settings";

/**
 * The Google Business Profile buttons, driven by /admin/settings.
 *
 * Each button renders only when Michelle has saved its link. Until then it is
 * simply absent — never a placeholder, and never a Google search dressed up as
 * a review link. Opens in the same tab on purpose: this audience is largely
 * older adults, and a new tab is where people lose their way back.
 */
export function GoogleLinks({
  settings,
  reviewLabel = "Leave a Google Review",
  profileLabel = "See Our Google Reviews",
  className = "",
  fullWidth = false,
}: {
  settings: SiteSettings;
  reviewLabel?: string;
  profileLabel?: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const { google_review_url: review, google_business_url: profile } = settings;
  if (!review && !profile) return null;

  const w = fullWidth ? "w-full" : "";
  return (
    <div className={`flex flex-wrap gap-3 ${fullWidth ? "flex-col" : "justify-center"} ${className}`}>
      {review && (
        <Button href={review} variant="primary" className={w}>
          {reviewLabel}
        </Button>
      )}
      {profile && (
        <Button href={profile} variant={review ? "secondary" : "primary"} className={w}>
          {profileLabel}
        </Button>
      )}
    </div>
  );
}

export const hasGoogleLinks = (s: SiteSettings) =>
  Boolean(s.google_review_url || s.google_business_url);
