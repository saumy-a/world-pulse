import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

interface Article { title: string; description?: string | null; url: string; publishedAt: string; source: { id?: string | null; name: string } }
interface NewsResponse { status: string; articles?: Article[] }

export async function collect(): Promise<WorldEvent[]> {
  if (!process.env.NEWS_API_KEY) {
    console.warn("[news-collector] NEWS_API_KEY is not configured; skipping");
    return [];
  }
  const url = process.env.NEWS_API_URL ?? "https://newsapi.org/v2/top-headlines";
  const { data } = await axios.get<NewsResponse>(url, { params: { language: "en", pageSize: 50, apiKey: process.env.NEWS_API_KEY }, timeout: 10_000 });
  if (data.status !== "ok" || !Array.isArray(data.articles)) throw new Error("[news-collector] Unexpected NewsAPI response");
  return data.articles.filter((article) => article.title && article.url).map((article) => normalizeEvent({
    id: `news-${Buffer.from(article.url).toString("base64url")}`, source: EventSource.News, type: "headline", category: EventCategory.News,
    title: article.title, description: article.description ?? undefined, url: article.url, tags: ["news", article.source.name], timestamp: article.publishedAt,
    importance: 5, metadata: { publisher: article.source.name, publisherId: article.source.id },
  }));
}
