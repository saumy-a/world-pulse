const DEFAULT_API_URL = 'http://localhost:5000';
const MAX_EVENTS = 100;

function normalizeEvent(raw) {
  const id = String(raw?.id ?? '').trim();
  const title = String(raw?.title ?? '').trim();
  const timestamp = Date.parse(raw?.timestamp);
  const importance = Number(raw?.importance);
  const location = raw?.location;
  const latitudeValue = location?.lat ?? location?.latitude;
  const longitudeValue = location?.lng ?? location?.longitude;
  const latitude = latitudeValue == null || latitudeValue === '' ? NaN : Number(latitudeValue);
  const longitude = longitudeValue == null || longitudeValue === '' ? NaN : Number(longitudeValue);
  if (
    !id ||
    !title ||
    !Number.isFinite(timestamp) ||
    !Number.isFinite(importance) ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    return null;
  return {
    id,
    title: title.slice(0, 240),
    source: String(raw?.source ?? 'unknown').slice(0, 80),
    type: String(raw?.type ?? 'event').slice(0, 80),
    category: String(raw?.category ?? 'other').slice(0, 80),
    timestamp,
    importance: Math.max(0, Math.min(10, importance)),
    latitude,
    longitude,
    country: String(raw?.location?.country ?? raw?.country ?? '').slice(0, 100),
    url: safeHttpUrl(raw?.url),
  };
}

function safeHttpUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

/** Read the bounded, location-bearing event feed exposed by the World Pulse API. */
export function createWorldPulseEventsSource({
  apiUrl = import.meta.env?.VITE_WORLD_PULSE_API_URL || DEFAULT_API_URL,
  fetchImpl = (...args) => globalThis.fetch(...args),
} = {}) {
  const endpoint = new URL('/api/v1/events', apiUrl);
  const analyticsEndpoint = new URL('/api/v1/analytics/overview', apiUrl);
  return Object.freeze({
    label: 'World Pulse API',
    async getSnapshot({ signal, sinceHours = 24, before = null } = {}) {
      const url = new URL(endpoint);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', String(MAX_EVENTS));
      url.searchParams.set('sinceHours', String(sinceHours));
      if (before) url.searchParams.set('before', new Date(before).toISOString());
      const response = await fetchImpl(url, {
        signal,
        headers: { Accept: 'application/json' },
        redirect: 'error',
      });
      if (!response.ok)
        throw new Error(`World Pulse API unavailable (${response.status})`);
      const payload = await response.json();
      if (payload?.success !== true || !Array.isArray(payload.data))
        throw new Error('World Pulse API returned an invalid event feed');
      return payload.data
        .slice(0, MAX_EVENTS)
        .map(normalizeEvent)
        .filter(Boolean);
    },
    async getOverview({ signal } = {}) {
      const response = await fetchImpl(analyticsEndpoint, {
        signal,
        headers: { Accept: 'application/json' },
        redirect: 'error',
      });
      if (!response.ok) throw new Error(`World Pulse analytics unavailable (${response.status})`);
      const payload = await response.json();
      if (payload?.success !== true || !payload.data || typeof payload.data !== 'object')
        throw new Error('World Pulse API returned invalid analytics');
      return payload.data;
    },
  });
}
