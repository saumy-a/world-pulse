import type { WorldEvent } from "@world-pulse/shared-types";

/**
 * News Collector — placeholder
 *
 * Fetches top news headlines from NewsAPI and normalizes them
 * into WorldEvent objects.
 * Requires NEWS_API_KEY in environment.
 */
export async function collect(): Promise<WorldEvent[]> {
  // TODO: Implement — fetch https://newsapi.org/v2/top-headlines
  console.log("[news-collector] placeholder — not yet implemented");
  return [];
}
