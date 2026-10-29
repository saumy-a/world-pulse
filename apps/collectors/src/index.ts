import "dotenv/config";
import cron from "node-cron";
import axios from "axios";

import { collect as collectGitHub } from "./collectors/github";
import { collect as collectUSGS } from "./collectors/usgs";
import { collect as collectNASA } from "./collectors/nasa";
import { collect as collectNews } from "./collectors/news";
import { collect as collectCoinGecko } from "./collectors/coingecko";
import { collect as collectWikimedia } from "./collectors/wikimedia";
import { collect as collectWeather } from "./collectors/weather";
import { collect as collectLaunches } from "./collectors/launch-library";
import { collect as collectHackerNews } from "./collectors/hacker-news";

import type { WorldEvent } from "@world-pulse/shared-types";

// ─── Logger ──────────────────────────────────────────────────────────────────

const log = {
  info: (msg: string) => console.log(`[${new Date().toISOString()}] INFO  ${msg}`),
  warn: (msg: string) => console.warn(`[${new Date().toISOString()}] WARN  ${msg}`),
  error: (msg: string, err?: unknown) =>
    console.error(`[${new Date().toISOString()}] ERROR ${msg}`, err ?? ""),
};

// ─── Collector registry ───────────────────────────────────────────────────────

interface Collector {
  name: string;
  collect: () => Promise<WorldEvent[]>;
}

const collectors: Collector[] = [
  { name: "github", collect: collectGitHub },
  { name: "usgs", collect: collectUSGS },
  { name: "nasa", collect: collectNASA },
  { name: "news", collect: collectNews },
  { name: "coingecko", collect: collectCoinGecko },
  { name: "wikimedia", collect: collectWikimedia },
  { name: "weather", collect: collectWeather },
  { name: "launch-library", collect: collectLaunches },
  { name: "hacker-news", collect: collectHackerNews },
];

async function publishEvents(events: WorldEvent[]): Promise<void> {
  if (events.length === 0) return;
  const apiUrl = process.env.WORLD_PULSE_API_URL ?? "http://localhost:5000";
  const apiBaseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const ingestKey = process.env.WORLD_PULSE_INGEST_KEY;
  if (!ingestKey) {
    log.warn("WORLD_PULSE_INGEST_KEY is unset; collected events were not saved");
    return;
  }
  for (let offset = 0; offset < events.length; offset += 500) {
    const batch = events.slice(offset, offset + 500);
    const response = await axios.post(
      `${apiBaseUrl}/api/v1/events/ingest`,
      { events: batch },
      {
        headers: { "x-world-pulse-ingest-key": ingestKey },
        timeout: 15_000,
      },
    );
    log.info(`Saved ${response.data?.received ?? batch.length} event(s) to the API`);
  }
}

// ─── Run all collectors ───────────────────────────────────────────────────────

async function runAllCollectors(): Promise<void> {
  log.info("Starting collection cycle…");

  const results = await Promise.allSettled(
    collectors.map(async ({ name, collect }) => {
      const events = await collect();
      log.info(`[${name}] collected ${events.length} event(s)`);
      return { name, events };
    })
  );

  let totalEvents = 0;
  const collectedEvents: WorldEvent[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      totalEvents += result.value.events.length;
      collectedEvents.push(...result.value.events);
    } else {
      log.error("Collector failed", result.reason);
    }
  }

  try {
    await publishEvents(collectedEvents);
  } catch (error) {
    log.error("Failed to publish collected events to the API", error);
  }

  log.info(`Collection cycle complete. Total events: ${totalEvents}`);
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

const cronExpression = process.env.COLLECTOR_CRON ?? "*/5 * * * *";

log.info(`World Pulse Collector Service starting`);
log.info(`Schedule: ${cronExpression}`);

// Run immediately on startup
runAllCollectors().catch((err) => log.error("Initial collection failed", err));

// Then schedule recurring runs
cron.schedule(cronExpression, () => {
  runAllCollectors().catch((err) => log.error("Scheduled collection failed", err));
});

log.info("Scheduler active. Press Ctrl+C to stop.");
