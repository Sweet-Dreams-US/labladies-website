import { listAllReviews } from "@/lib/reviews";
import { adminGate } from "../gate";
import ReviewsManager from "./ReviewsManager";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const reviews = await listAllReviews();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Reviews</h1>
        <p className="mt-1 text-muted">
          The reviews that scroll across the homepage. Copy good ones in from Google — saving
          publishes straight to the website.
        </p>
      </div>
      <ReviewsManager reviews={reviews} />
    </div>
  );
}
