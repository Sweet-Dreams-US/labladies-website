import "server-only";
import { hasReleasedPosts } from "./blog";
import { nav } from "./site";

/** The site navigation. The Blog link appears only once a post is released. */
export function getNav() {
  return hasReleasedPosts() ? nav : nav.filter((item) => item.href !== "/blog");
}
