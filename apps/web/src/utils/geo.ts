import { EventCategory, EventSource } from '../types';

/**
 * Converts Latitude and Longitude (degrees) to 3D Cartesian coordinates (x, y, z) on a sphere of radius R.
 */
export function latLongToVector3(
  latitude: number,
  longitude: number,
  radius: number
): { x: number; y: number; z: number } {
  // Clamp latitude to [-90, 90] and normalize longitude to [-180, 180]
  const lat = Math.max(-90, Math.min(90, latitude));
  const lon = ((longitude + 180) % 360) - 180;

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return { x, y, z };
}

/**
 * Clean, consistent category color palette for World Pulse:
 * - Earthquakes: Red-Orange (#f97316)
 * - Code: Emerald Green (#10b981)
 * - Knowledge / Wikipedia: Blue/Cyan (#38bdf8)
 * - Markets: Gold (#eab308)
 * - Weather: Cyan (#06b6d4)
 */
export const CATEGORY_ACCENTS: Record<string, string> = {
  all: '#94a3b8',
  earthquakes: '#f97316',
  natural: '#f97316',
  code: '#10b981',
  technology: '#10b981',
  knowledge: '#38bdf8',
  geopolitics: '#38bdf8',
  markets: '#eab308',
  finance: '#eab308',
  weather: '#06b6d4',
  other: '#94a3b8',
};

export const SOURCE_COLORS: Record<string, string> = {
  flight: '#e7f2ff',
  [EventSource.USGS]: '#f97316',       // Earthquakes: Red-Orange
  [EventSource.GitHub]: '#10b981',     // Code: Green
  [EventSource.Wikimedia]: '#38bdf8',  // Wikipedia: Blue
  [EventSource.CoinGecko]: '#eab308',  // Markets: Gold
  [EventSource.OpenMeteo]: '#06b6d4',  // Weather: Cyan
  [EventSource.NASA]: '#38bdf8',
  [EventSource.LaunchLibrary]: '#eab308',
  [EventSource.News]: '#ec4899',
  [EventSource.HackerNews]: '#10b981',
};

export function getEventColor(category?: string, source?: string): string {
  if (source && SOURCE_COLORS[source]) return SOURCE_COLORS[source];
  if (category) {
    const key = category.toLowerCase();
    if (CATEGORY_ACCENTS[key]) return CATEGORY_ACCENTS[key];
  }
  return '#f97316';
}
