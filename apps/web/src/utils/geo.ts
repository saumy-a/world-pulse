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
 * Visual styling configuration for various event sources and categories.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  [EventCategory.Technology]: '#38bdf8', // Cyan
  [EventCategory.Geopolitics]: '#f97316', // Orange
  [EventCategory.Natural]: '#ef4444',     // Crimson
  [EventCategory.Weather]: '#06b6d4',     // Aqua
  [EventCategory.Finance]: '#10b981',     // Emerald
  [EventCategory.Space]: '#f59e0b',       // Amber
  [EventCategory.News]: '#ec4899',        // Rose
  [EventCategory.Other]: '#94a3b8',       // Slate
};

export const SOURCE_COLORS: Record<string, string> = {
  [EventSource.GitHub]: '#38bdf8',
  [EventSource.Wikimedia]: '#a855f7',
  [EventSource.USGS]: '#ef4444',
  [EventSource.OpenMeteo]: '#06b6d4',
  [EventSource.CoinGecko]: '#10b981',
  [EventSource.NASA]: '#f59e0b',
  [EventSource.LaunchLibrary]: '#eab308',
  [EventSource.News]: '#ec4899',
  [EventSource.HackerNews]: '#f97316',
};

export function getEventColor(category?: string, source?: string): string {
  if (source && SOURCE_COLORS[source]) return SOURCE_COLORS[source];
  if (category && CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  return '#38bdf8';
}
