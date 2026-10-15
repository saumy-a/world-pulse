import type { WorldEvent } from "@world-pulse/shared-types";

/**
 * CoinGecko Collector — placeholder
 *
 * Fetches significant cryptocurrency price movements and trending coins
 * from the CoinGecko API and normalizes them into WorldEvent objects.
 * Works without an API key on the free tier.
 */
export async function collect(): Promise<WorldEvent[]> {
  // TODO: Implement — fetch https://api.coingecko.com/api/v3/events and trending
  console.log("[coingecko-collector] placeholder — not yet implemented");
  return [];
}
