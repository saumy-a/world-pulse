export enum EventCategory {
  Technology = "technology",
  Geopolitics = "geopolitics",
  Natural = "natural",
  Weather = "weather",
  Finance = "finance",
  Space = "space",
  News = "news",
  Other = "other",
}

export enum EventSource {
  GitHub = "github",
  Wikimedia = "wikimedia",
  USGS = "usgs",
  OpenMeteo = "open-meteo",
  CoinGecko = "coingecko",
  NASA = "nasa",
  LaunchLibrary = "launch-library",
  News = "news",
  HackerNews = "hacker-news",
  Other = "other",
}

export interface EventLocation {
  latitude: number;
  longitude: number;
}

export interface WorldEvent {
  id: string;
  source: EventSource | string;
  sourceEventId?: string;

  type: string;
  category: EventCategory | string;

  title: string;
  description?: string;
  url?: string;
  tags?: string[];
  country?: string;
  region?: string;

  timestamp: string;
  importance: number;

  location?: EventLocation;

  metadata?: Record<string, unknown>;
}
