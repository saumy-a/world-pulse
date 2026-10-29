import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

interface Coin { id: string; symbol: string; name: string; current_price: number; price_change_percentage_24h: number | null; market_cap: number | null; last_updated: string }

export async function collect(): Promise<WorldEvent[]> {
  const url = process.env.COINGECKO_API_URL ?? "https://api.coingecko.com/api/v3/coins/markets";
  const headers = process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : undefined;
  const { data } = await axios.get<Coin[]>(url, { headers, params: { vs_currency: "usd", order: "market_cap_desc", per_page: 100, page: 1, price_change_percentage: "24h" }, timeout: 10_000 });
  if (!Array.isArray(data)) throw new Error("[coingecko-collector] Unexpected markets response");

  return data.filter((coin) => Math.abs(coin.price_change_percentage_24h ?? 0) >= 2).map((coin) => {
    const change = coin.price_change_percentage_24h ?? 0;
    return normalizeEvent({
      id: `coingecko-${coin.id}-${new Date(coin.last_updated).toISOString().slice(0, 13)}`,
      source: EventSource.CoinGecko, sourceEventId: coin.id, type: "price_movement", category: EventCategory.Finance,
      title: `${coin.name} ${change >= 0 ? "gained" : "lost"} ${Math.abs(change).toFixed(2)}% in 24h`,
      description: `${coin.symbol.toUpperCase()} is trading at $${coin.current_price.toLocaleString("en-US")}.`,
      url: `https://www.coingecko.com/en/coins/${coin.id}`, tags: ["crypto", coin.symbol.toLowerCase(), change >= 0 ? "gain" : "loss"],
      timestamp: coin.last_updated, importance: Math.min(10, 2 + Math.abs(change) / 2), metadata: { priceUsd: coin.current_price, change24h: change, marketCap: coin.market_cap },
    });
  });
}
