import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

interface EonetEvent { id: string; title: string; description?: string; link?: string; categories?: Array<{ title: string }>; geometry?: Array<{ date: string; coordinates?: number[] }> }
interface EonetResponse { events: EonetEvent[] }

export async function collect(): Promise<WorldEvent[]> {
  const url = process.env.NASA_EONET_URL ?? "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50";
  const { data } = await axios.get<EonetResponse>(url, { timeout: 10_000 });
  if (!Array.isArray(data.events)) throw new Error("[nasa-collector] Unexpected EONET response");

  return data.events.map((event) => {
    const geometry = event.geometry ?? [];
    const latest = geometry[geometry.length - 1];
    const [longitude, latitude] = latest?.coordinates ?? [];
    const category = event.categories?.[0]?.title ?? "natural event";
    return normalizeEvent({
      id: `nasa-${event.id}`,
      source: EventSource.NASA,
      sourceEventId: event.id,
      type: category.toLowerCase().replace(/ /g, "_"),
      category: EventCategory.Natural,
      title: event.title,
      description: event.description,
      url: event.link,
      tags: ["nasa", "eonet", category],
      timestamp: latest?.date ?? Date.now(),
      importance: 6,
      location: typeof latitude === "number" && typeof longitude === "number" && Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : undefined,
      metadata: { categories: event.categories, geometry: latest },
    });
  });
}
