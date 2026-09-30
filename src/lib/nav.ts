import "server-only";
import { hasListedPosts, hasReleasedPosts } from "./blog";
import { nav } from "./site";

/**
 * The site navigation. The Blog link appears only once a post is released.
 * `includeUnreleased` also counts the unreleased posts a preview deployment
 * lists, so a reviewer can reach them; the sitemap and llms.txt never pass it.
 */
export function getNav({ includeUnreleased = false } = {}) {
  const show = includeUnreleased ? hasListedPosts() : hasReleasedPosts();
  return show ? nav : nav.filter((item) => item.href !== "/blog");
}
