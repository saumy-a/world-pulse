import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

interface Launch { id: string; name: string; window_start: string; status: { name: string }; image?: string | null; pad?: { location?: { name: string; map_url?: string | null; latitude?: string | number | null; longitude?: string | number | null } | null } | null; mission?: { description?: string | null; type?: string | null } | null; webcast_live?: boolean }
interface LaunchResponse { results: Launch[] }

export async function collect(): Promise<WorldEvent[]> {
  const url = process.env.LAUNCH_LIBRARY_API_URL ?? "https://ll.thespacedevs.com/2.2.0/launch/upcoming/";
  const { data } = await axios.get<LaunchResponse>(url, { params: { limit: 30, ordering: "window_start" }, timeout: 10_000 });
  if (!Array.isArray(data.results)) throw new Error("[launch-library-collector] Unexpected response");
  return data.results.map((launch) => {
    const location = launch.pad?.location;
    const latitude = Number(location?.latitude);
    const longitude = Number(location?.longitude);
    return normalizeEvent({
      id: `launch-${launch.id}`, source: EventSource.LaunchLibrary, sourceEventId: launch.id, type: "rocket_launch", category: EventCategory.Space,
      title: launch.name, description: launch.mission?.description ?? undefined, url: location?.map_url ?? undefined, tags: ["space", "launch", launch.status.name],
      timestamp: launch.window_start, importance: launch.webcast_live ? 8 : 6, location: Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : undefined,
      metadata: { status: launch.status.name, missionType: launch.mission?.type, pad: location?.name, image: launch.image, webcastLive: launch.webcast_live },
    });
  });
}
