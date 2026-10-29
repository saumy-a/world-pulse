import type { WorldEvent } from '../types';
import { EventCategory, EventSource } from '../types';

export interface UsgsFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    type: string;
    title: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
}

export interface UsgsGeoJsonResponse {
  type: 'FeatureCollection';
  features: UsgsFeature[];
}

/**
 * Normalizes a raw USGS Feature into the World Pulse common event shape.
 */
export function normalizeUsgsFeature(feature: UsgsFeature): WorldEvent {
  const { properties, geometry, id } = feature;
  const [lon, lat, depthKm] = geometry.coordinates;
  const mag = properties.mag ?? 0;

  // Derive country or region from place string (e.g., "12 km SSW of Hualien City, Taiwan")
  const placeParts = (properties.place || '').split(',');
  const region = placeParts.length > 1 ? placeParts[placeParts.length - 1].trim() : 'Global Region';

  return {
    id: `usgs-${id}`,
    source: EventSource.USGS,
    sourceEventId: id,
    type: 'earthquake',
    category: EventCategory.Natural,
    title: properties.title || `M ${mag.toFixed(1)} - ${properties.place}`,
    description: `Magnitude ${mag.toFixed(1)} earthquake recorded at depth of ${depthKm.toFixed(1)} km. Seismic intensity index: ${properties.sig}.`,
    country: region,
    region,
    timestamp: new Date(properties.time).toISOString(),
    importance: Math.min(10, Math.max(1, mag * 1.5)),
    location: {
      latitude: lat,
      longitude: lon,
    },
    url: properties.url,
    metadata: {
      magnitude: mag,
      depthKm,
      place: properties.place,
      tsunamiAlert: properties.tsunami === 1,
      alertLevel: properties.alert || 'green',
      significance: properties.sig,
    },
  };
}

/**
 * Fetches recent earthquakes from the USGS public feed (past hour or past day for significant quakes)
 */
export async function fetchLiveEarthquakes(signal?: AbortSignal): Promise<WorldEvent[]> {
  try {
    // We fetch significant/all earthquakes from the past hour; fallback to 4.5+ past day if quiet
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson', {
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) {
      throw new Error(`USGS HTTP Error ${res.status}`);
    }

    const data: UsgsGeoJsonResponse = await res.json();
    let events = (data.features || []).map(normalizeUsgsFeature);

    // If past hour has fewer than 3 quakes, augment with significant quakes from past day
    if (events.length < 3) {
      try {
        const fallbackRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', { signal });
        if (fallbackRes.ok) {
          const fallbackData: UsgsGeoJsonResponse = await fallbackRes.json();
          const moreEvents = (fallbackData.features || []).slice(0, 15).map(normalizeUsgsFeature);
          const seen = new Set(events.map((e) => e.id));
          for (const ev of moreEvents) {
            if (!seen.has(ev.id)) {
              events.push(ev);
              seen.add(ev.id);
            }
          }
        }
      } catch {
        // Ignore fallback failure
      }
    }

    return events;
  } catch (err) {
    if (signal?.aborted) return [];
    console.warn('[USGS Adapter] Failed to fetch live feed:', err);
    return [];
  }
}
