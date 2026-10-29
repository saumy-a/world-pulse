import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

interface Story { id: number; title: string; url?: string; time: number; score: number; descendants?: number; by?: string; type: string }

export async function collect(): Promise<WorldEvent[]> {
  const baseUrl = (process.env.HACKER_NEWS_API_URL ?? "https://hacker-news.firebaseio.com/v0").replace(/\/$/, "");
  const { data: ids } = await axios.get<number[]>(`${baseUrl}/topstories.json`, { timeout: 10_000 });
  if (!Array.isArray(ids)) throw new Error("[hacker-news-collector] Unexpected top stories response");
  const stories = await Promise.all(ids.slice(0, 30).map(async (id) => (await axios.get<Story | null>(`${baseUrl}/item/${id}.json`, { timeout: 10_000 })).data));
  return stories.filter((story): story is Story => Boolean(story?.title && story.type === "story")).map((story) => normalizeEvent({
    id: `hacker-news-${story.id}`, source: EventSource.HackerNews, sourceEventId: String(story.id), type: "trending_story", category: EventCategory.Technology,
    title: story.title, url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`, tags: ["hacker-news", "technology"], timestamp: new Date(story.time * 1000).toISOString(),
    importance: Math.min(10, 2 + Math.log10(Math.max(1, story.score)) * 2), metadata: { score: story.score, comments: story.descendants ?? 0, author: story.by },
  }));
}
