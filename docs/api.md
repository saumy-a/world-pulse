# API reference

This page documents the API that currently exists. The service is an Express REST API backed by MongoDB/Mongoose. It does not currently implement user authentication, Redis caching, event history, universal search, AI summaries, or Socket.IO. Those items may be considered future work; examples of them in older planning material are not live endpoints.

## Local setup

The default API port is `5000`. Configure `DATABASE_URL` and `WORLD_PULSE_INGEST_KEY` in `apps/api/.env`; the collector must use the same ingest key in `apps/collectors/.env`. See [the API setup guide](../apps/api/README.md).

Base URL: `http://localhost:5000/api/v1`

## Health checks

### `GET /health`

Returns `{ "status": "ok" }` when the HTTP server responds.

### `GET /api/v1/health`

Returns service identity and current server time:

```json
{
  "status": "ok",
  "service": "world-pulse-api",
  "timestamp": "2026-10-30T12:00:00.000Z"
}
```

## Events feed

### `GET /api/v1/events`

Returns events ordered newest first. No user token is required.

| Query parameter | Meaning |
|---|---|
| `page` | 1-based page number; defaults to `1` |
| `limit` | Page size; defaults to `20`, clamped to `1–100` |
| `source` | Exact source match |
| `category` | Exact category match |
| `country` | Exact country match |
| `sinceHours` | Return events newer than this many hours; positive values capped at 720 |
| `before` | Return events at or before this valid date/time |
| `q` | Case-insensitive text match against title, description, or source (first 100 characters) |
| `minImportance` | Minimum importance score |

Example: `GET /api/v1/events?page=1&limit=20&category=natural&sinceHours=24`

Successful response:

```json
{
  "success": true,
  "data": [
    {
      "id": "usgs:example-event",
      "source": "usgs",
      "type": "earthquake",
      "title": "Example earthquake",
      "description": null,
      "url": null,
      "category": "natural",
      "importance": 5,
      "timestamp": "2026-10-30T11:00:00.000Z",
      "location": { "country": null, "region": null, "lat": 35.6, "lng": 139.7 },
      "tags": [],
      "metadata": {}
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

The event `location` fields and `description`/`url` may be `null` when unavailable. Database or query failures return HTTP `500` with `{ "success": false, "error": "Failed to fetch events" }`.

## Collector ingestion

### `POST /api/v1/events/ingest`

Accepts up to 500 normalized events per request. Send the shared secret in the `x-world-pulse-ingest-key` header. Records are upserted by event `id`, so repeating an ID updates its stored event.

```http
POST /api/v1/events/ingest
Content-Type: application/json
x-world-pulse-ingest-key: <shared secret>
```

```json
{
  "events": [
    {
      "id": "usgs:example-event",
      "source": "usgs",
      "type": "earthquake",
      "category": "natural",
      "title": "Example earthquake",
      "timestamp": "2026-10-30T11:00:00.000Z",
      "importance": 5,
      "location": { "latitude": 35.6, "longitude": 139.7 }
    }
  ]
}
```

Each event requires non-empty `id` and `title`, string `source`, `type`, and `category`, a parseable timestamp, and a finite `importance` from 0 to 10. Optional location coordinates must be valid latitude/longitude values. Other optional event fields follow the [`WorldEvent` type](../packages/shared-types/event.ts).

Success response: `{ "success": true, "received": 1, "upserted": 1, "modified": 0 }`. An empty batch succeeds with zero counts. Invalid input or more than 500 records returns HTTP `400`; a missing or incorrect key returns `401`; ingestion without a configured API key returns `503`.

## Analytics overview

### `GET /api/v1/analytics/overview`

Returns metrics calculated from stored events in the previous 24 hours. `activeCollectors` counts distinct sources with records updated in the last 10 minutes; it does not report collector process health.

```json
{
  "success": true,
  "data": {
    "totalEvents24h": 120,
    "eventsByCategory": { "natural": 12, "technology": 108 },
    "activeCollectors": 3,
    "averageImportance": 4.2
  }
}
```

## Planned API work

The following are not currently available routes or protocols: registration/login/profile, `/events/live`, `/events/:id`, `/events/history`, `/search`, `/ai/summaries`, and Socket.IO streaming. Update this page when those features are implemented.
