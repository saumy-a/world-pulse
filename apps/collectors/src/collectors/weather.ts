import axios from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource, type WorldEvent } from "@world-pulse/shared-types";

const WATCH_LOCATIONS = [
  { name: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { name: "London", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
];

interface Forecast { current?: { time: string; temperature_2m: number; apparent_temperature: number; precipitation: number; wind_speed_10m: number; weather_code: number } }

const isNotable = (weather: Forecast["current"]): boolean => Boolean(weather && (weather.temperature_2m >= 35 || weather.temperature_2m <= -10 || weather.wind_speed_10m >= 50 || weather.precipitation >= 10 || weather.weather_code >= 80));

export async function collect(): Promise<WorldEvent[]> {
  const url = process.env.OPEN_METEO_API_URL ?? "https://api.open-meteo.com/v1/forecast";
  const results = await Promise.all(WATCH_LOCATIONS.map(async (place) => {
    const { data } = await axios.get<Forecast>(url, { params: { latitude: place.latitude, longitude: place.longitude, current: "temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code", timezone: "UTC" }, timeout: 10_000 });
    return { place, weather: data.current };
  }));
  return results.filter(({ weather }) => isNotable(weather)).map(({ place, weather }) => normalizeEvent({
    id: `open-meteo-${place.name.toLowerCase().replace(/ /g, "-")}-${weather!.time}`,
    source: EventSource.OpenMeteo, type: "weather_anomaly", category: EventCategory.Weather,
    title: `Notable weather conditions in ${place.name}`, description: `${weather!.temperature_2m}°C, wind ${weather!.wind_speed_10m} km/h, precipitation ${weather!.precipitation} mm.`,
    tags: ["weather", "open-meteo"], country: place.country, timestamp: weather!.time, importance: Math.min(10, 3 + (weather!.wind_speed_10m / 20) + (weather!.precipitation / 10)),
    location: { latitude: place.latitude, longitude: place.longitude }, metadata: weather,
  }));
}
