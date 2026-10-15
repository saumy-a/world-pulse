import "dotenv/config";
import cron from "node-cron";

import { collect as collectGitHub } from "./collectors/github";
import { collect as collectUSGS } from "./collectors/usgs";
import { collect as collectNASA } from "./collectors/nasa";
import { collect as collectNews } from "./collectors/news";
import { collect as collectCoinGecko } from "./collectors/coingecko";
import { collect as collectWikimedia } from "./collectors/wikimedia";

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
];

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
  for (const result of results) {
    if (result.status === "fulfilled") {
      totalEvents += result.value.events.length;
    } else {
      log.error("Collector failed", result.reason);
    }
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
