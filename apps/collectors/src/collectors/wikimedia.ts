import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

interface Change { rcid: number; title: string; user: string; timestamp: string; comment: string; type: string; oldlen: number; newlen: number }
interface WikimediaResponse { query?: { recentchanges?: Change[] } }

export async function collect(): Promise<WorldEvent[]> {
  const url = process.env.WIKIMEDIA_API_URL ?? "https://en.wikipedia.org/w/api.php";
  const { data } = await axios.get<WikimediaResponse>(url, { params: { action: "query", list: "recentchanges", rcprop: "title|ids|user|timestamp|comment|sizes|type", rclimit: 50, format: "json", origin: "*" }, timeout: 10_000 });
  const changes = data.query?.recentchanges;
  if (!Array.isArray(changes)) throw new Error("[wikimedia-collector] Unexpected recent changes response");
  return changes.map((change) => normalizeEvent({
    id: `wikimedia-${change.rcid}`, source: EventSource.Wikimedia, sourceEventId: String(change.rcid), type: `wiki_${change.type}`, category: EventCategory.News,
    title: `${change.user} edited ${change.title}`, description: change.comment || undefined, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(change.title.replace(/ /g, "_"))}`,
    tags: ["wikipedia", "edit", change.type], timestamp: change.timestamp, importance: Math.min(5, 1 + Math.abs(change.newlen - change.oldlen) / 500), metadata: { user: change.user, changeType: change.type, sizeDelta: change.newlen - change.oldlen },
  }));
}
