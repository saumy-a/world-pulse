import type { WorldEvent } from "@world-pulse/shared-types";

/**
 * NASA Collector — placeholder
 *
 * Fetches space-related events from NASA APIs (APOD, EONET, etc.)
 * and normalizes them into WorldEvent objects.
 * Requires NASA_API_KEY in environment (defaults to "DEMO_KEY").
 */
export async function collect(): Promise<WorldEvent[]> {
  // TODO: Implement — fetch NASA EONET natural events and/or APOD
  console.log("[nasa-collector] placeholder — not yet implemented");
  return [];
}
