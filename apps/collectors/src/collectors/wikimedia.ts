import type { WorldEvent } from "@world-pulse/shared-types";

/**
 * Wikimedia / Wikipedia Collector — placeholder
 *
 * Fetches recent Wikipedia edits and "In the news" entries,
 * normalizing them into WorldEvent objects.
 * No API key required.
 */
export async function collect(): Promise<WorldEvent[]> {
  // TODO: Implement — fetch https://en.wikipedia.org/w/api.php (recent changes / ITN)
  console.log("[wikimedia-collector] placeholder — not yet implemented");
  return [];
}
