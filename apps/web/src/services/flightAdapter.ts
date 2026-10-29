import { EventCategory, type WorldEvent } from '../types';

interface AdsbAircraft {
  hex?: string;
  flight?: string;
  r?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | 'ground';
  gs?: number;
  track?: number;
  seen?: number;
}

/** Fetch a bounded live ADS-B snapshot around the current World Pulse focus. */
export async function fetchNearbyFlights(latitude = 39, longitude = -98, signal?: AbortSignal): Promise<WorldEvent[]> {
  const url = `https://api.adsb.lol/v2/lat/${latitude.toFixed(2)}/lon/${longitude.toFixed(2)}/dist/250`;
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Flight feed responded with ${response.status}`);
  const payload = await response.json();
  const now = Date.now();
  return ((payload.ac ?? []) as AdsbAircraft[])
    .filter((row) => row.hex && Number.isFinite(row.lat) && Number.isFinite(row.lon))
    .slice(0, 300)
    .map((row) => {
      const callsign = (row.flight || '').trim() || row.r || row.hex!.toUpperCase();
      return {
        id: `flight-${row.hex}`,
        source: 'flight',
        sourceEventId: row.hex,
        type: 'aircraft',
        category: EventCategory.Other,
        title: callsign,
        description: `Live ADS-B aircraft${typeof row.alt_baro === 'number' ? ` at ${row.alt_baro.toLocaleString()} ft` : ''}${Number.isFinite(row.gs) ? ` · ${Math.round(row.gs!)} kt` : ''}.`,
        timestamp: new Date(now - Math.max(0, row.seen ?? 0) * 1000).toISOString(),
        importance: 1,
        location: { latitude: row.lat!, longitude: row.lon! },
        url: 'https://www.adsb.lol/',
        metadata: { heading: row.track ?? 0, altitude: row.alt_baro, speed: row.gs, live: true },
      };
    });
}
