import { StarIcon } from "@/components/Icons";
import { SOURCE_LABEL, displayName, type Review } from "@/lib/reviews";

/**
 * One row of reviews that scrolls sideways on its own, forever.
 *
 * Pure CSS, no JavaScript: the list is rendered twice back to back and the
 * track slides left by exactly one copy, so the loop is seamless. Hovering
 * the row, or tabbing into it, pauses it — someone reading a review should
 * never have it slide out from under them.
 *
 * Reduced motion: the site-wide rule in globals.css shortens every animation
 * to near zero, which on an infinite loop would flicker. So the strip opts
 * out explicitly — no animation, and the row becomes a normal swipeable
 * scroller instead.
 *
 * With only a review or two, one copy wouldn't fill a wide screen and the
 * seam would show, so short lists are repeated until each copy has at least
 * six cards. Only the first real copy is exposed to screen readers.
 */

const MIN_PER_COPY = 6;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-brand" aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className={`h-5 w-5 ${i < rating ? "" : "opacity-20"}`} />
      ))}
    </span>
  );
}

function Card({ r, hidden }: { r: Review; hidden?: boolean }) {
  const when = r.review_date
    ? new Date(`${r.review_date}T12:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;
  return (
    <li
      aria-hidden={hidden || undefined}
      className="flex w-[19rem] shrink-0 snap-start flex-col rounded-3xl border border-cream-deep bg-white p-6 shadow-sm sm:w-[23rem]"
    >
      <Stars rating={r.rating} />
      <blockquote className="mt-4 line-clamp-6 flex-1 text-base leading-relaxed text-ink">
        &ldquo;{r.body}&rdquo;
      </blockquote>
      <div className="mt-5 flex items-end justify-between gap-3 text-sm">
        <div>
          <p className="font-bold text-ink">{displayName(r.author_name)}</p>
          <p className="text-muted">
            {SOURCE_LABEL[r.source]}
            {when && ` · ${when}`}
          </p>
        </div>
        {r.source_url && (
          <a
            href={r.source_url}
            tabIndex={hidden ? -1 : undefined}
            className="shrink-0 font-semibold text-brand-ink underline"
          >
            Read on {r.source === "google" ? "Google" : "source"}
          </a>
        )}
      </div>
    </li>
  );
}

export function ReviewMarquee({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  const copy: Review[] = [];
  while (copy.length < Math.max(MIN_PER_COPY, reviews.length)) copy.push(...reviews);

  // Pace by card count so a long list doesn't race and a short one doesn't crawl.
  const seconds = Math.max(30, copy.length * 7);

  return (
    <div
      className="ll-marquee group relative -mx-5 overflow-hidden sm:-mx-8"
      style={{ ["--ll-marquee-duration" as string]: `${seconds}s` }}
    >
      {/* Soft fade at both edges so cards slide in and out rather than being cut. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-cream to-transparent sm:w-20" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-cream to-transparent sm:w-20" />

      <ul className="ll-marquee-track flex w-max gap-5 px-5 py-2 sm:px-8">
        {copy.map((r, i) => (
          <Card key={`a-${r.id}-${i}`} r={r} hidden={i >= reviews.length} />
        ))}
        {copy.map((r, i) => (
          <Card key={`b-${r.id}-${i}`} r={r} hidden />
        ))}
      </ul>
    </div>
  );
}
