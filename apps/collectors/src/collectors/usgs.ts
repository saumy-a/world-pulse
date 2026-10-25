import type { WorldEvent } from "@world-pulse/shared-types";

/**
 * USGS Earthquake Collector — placeholder
 *
 * Fetches recent earthquake events from the USGS GeoJSON feed
 * and normalizes them into WorldEvent objects.
 * No API key required.
 */
export async function collect(): Promise<WorldEvent[]> {
  // TODO: Implement — fetch https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
  console.log("[usgs-collector] placeholder — not yet implemented");
  return [];
}
