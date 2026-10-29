export interface PlaceResult {
  latitude: number;
  longitude: number;
  label: string;
}

/** Keyless Photon geocoding with a coordinate-query fast path. */
export async function geocodeLocation(query: string, signal?: AbortSignal): Promise<PlaceResult | null> {
  const coordinate = query.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordinate) {
    const latitude = Number(coordinate[1]);
    const longitude = Number(coordinate[2]);
    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      return { latitude, longitude, label: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}` };
    }
    return null;
  }

  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '1');
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Geocoder responded with ${response.status}`);
  const payload = await response.json();
  const feature = payload.features?.[0];
  const [longitude, latitude] = feature?.geometry?.coordinates ?? [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const props = feature.properties ?? {};
  const label = [props.name, props.city, props.state, props.country].filter(Boolean).filter((part, index, all) => all.indexOf(part) === index).join(', ');
  return { latitude, longitude, label: label || query };
}
