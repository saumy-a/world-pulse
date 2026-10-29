# World Pulse

World Pulse collects public events, stores them in MongoDB, and displays them on an interactive globe. The repository contains the globe web app, a REST API, and scheduled data collectors.

In The globe you can find aircraft, satellite, weather, and camera layers remain available alongside World Pulse events.

## What works today

- An interactive Cesium globe with a World Pulse event feed.
- Feed search, category and importance filters, event details, source links, and browser-saved bookmarks.
- Scheduled collectors for GitHub, Wikimedia, USGS, Open-Meteo, CoinGecko, NASA, Launch Library 2, news, and Hacker News.
- An Express API backed by MongoDB/Mongoose for reading events, ingesting collector batches, and a basic analytics overview.
- A 24-hour, 7-day, and 30-day event timeline in the globe app.

Authentication, user accounts, Redis caching, AI summaries, notifications, event-history APIs, and Socket.IO are not implemented yet. See [API documentation](docs/api.md) for the current endpoints and planned work.

## How the pieces fit

```text
Public data sources
        ↓
Scheduled collectors → normalize events → authenticated batch ingest
                                               ↓
                                          Express API ↔ MongoDB
                                               ↓
                                     Globe app polls event feed
```

## Repository layout

```text
apps/
  web/          Vite and Cesium globe application
  api/          Express, TypeScript, and MongoDB API
  collectors/   Scheduled source collectors
packages/
  shared-types/ Shared event types
  shared-utils/ Shared normalization utilities
docs/           Architecture, API, database, and development notes
docker-compose.yml
```

## Prerequisites

- Node.js 24.14+ or 26.x (the web workspace requirement)
- npm
- A MongoDB database (local or hosted)

Docker is optional. Some collectors need provider credentials; sources that do not need credentials can run without them. Review the corresponding `.env.example` files.

## Run locally

From the repository root:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment files from `apps/api/.env.example`, `apps/collectors/.env.example`, and `apps/web/.env.example`.

3. Set `DATABASE_URL` in `apps/api/.env` to your MongoDB connection string. Set the same long random `WORLD_PULSE_INGEST_KEY` in `apps/api/.env` and `apps/collectors/.env`. The collector uses this key to authenticate batch ingestion.

4. Start each service in a separate terminal:

   ```bash
   npm run dev:api
   npm run dev:collectors
   npm run dev:web
   ```

5. Open the local URL printed by the web dev server. The web API URL defaults to `http://localhost:5000` in its environment example.

To populate a development database with sample events, run `npm run seed`. Never commit `.env` files or real credentials.

## API at a glance

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Basic process health check |
| `GET` | `/api/v1/health` | API health and timestamp |
| `GET` | `/api/v1/events` | Paginated, filterable event feed |
| `POST` | `/api/v1/events/ingest` | Authenticated collector batch upsert |
| `GET` | `/api/v1/analytics/overview` | 24-hour event metrics |

See [API documentation](docs/api.md) for query parameters, authentication details, response shapes, and planned endpoints.

## Documentation

- [API](docs/api.md)
- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [Roadmap](docs/roadmap.md)
- [Web app guide](apps/web/README.md)
- [Git workflow](docs/GIT_WORKFLOW.md)
