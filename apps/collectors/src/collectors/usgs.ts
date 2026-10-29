import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

interface UsgsFeature {
  id: string;
  properties: { mag: number | null; place: string | null; time: number; url: string; tsunami?: number; alert?: string | null };
  geometry: { coordinates: [number, number, number?] } | null;
}

interface UsgsFeed { features: UsgsFeature[] }

const feedUrl = () => process.env.USGS_FEED_URL ?? "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

export async function collect(): Promise<WorldEvent[]> {
  const { data } = await axios.get<UsgsFeed>(feedUrl(), { timeout: 10_000 });
  if (!Array.isArray(data.features)) throw new Error("[usgs-collector] Unexpected feed response");

  return data.features.map((event) => {
    const magnitude = event.properties.mag ?? 0;
    const [longitude, latitude, depthKm] = event.geometry?.coordinates ?? [];
    return normalizeEvent({
      id: `usgs-${event.id}`,
      source: EventSource.USGS,
      sourceEventId: event.id,
      type: "earthquake",
      category: EventCategory.Natural,
      title: `M ${magnitude.toFixed(1)} earthquake${event.properties.place ? ` — ${event.properties.place}` : ""}`,
      description: depthKm === undefined ? undefined : `Depth: ${depthKm} km`,
      url: event.properties.url,
      tags: ["earthquake", "usgs", event.properties.alert ?? ""],
      timestamp: new Date(event.properties.time).toISOString(),
      importance: Math.min(10, Math.max(1, magnitude * 1.5 + (event.properties.tsunami ? 2 : 0))),
      location: typeof latitude === "number" && typeof longitude === "number" && Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : undefined,
      metadata: { magnitude, depthKm, tsunami: Boolean(event.properties.tsunami), alert: event.properties.alert },
    });
  });
}
