# World Pulse API
Backend for World Pulse (Express + TypeScript + MongoDB with Mongoose).

## Setup

1. Install dependencies from the repository root: `npm install`
2. Copy `apps/api/.env.example` to `apps/api/.env` and fill in the values.
3. Start the API: `npm run dev --workspace=@world-pulse/api`

## Environment variables

| Name | Purpose |
|---|---|
| `PORT` | Port the API listens on (default 5000) |
| `DATABASE_URL` | MongoDB connection string (MongoDB Atlas) |
| `WORLD_PULSE_INGEST_KEY` | Shared secret required by the collector event-ingest route |
| `REDIS_URL` | Planned for later, not used yet |
| `JWT_SECRET` | Planned for authentication, not used yet |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev --workspace=@world-pulse/api` | Start the API with ts-node |
| `npm run seed --workspace=@world-pulse/api` | Insert 15 sample events into the database |
| `npm run build --workspace=@world-pulse/api` | Compile TypeScript to `dist/` |
| `npm run lint --workspace=@world-pulse/api` | Type-check without building |

## Endpoints

- `GET /health` returns `{ "status": "ok" }`
- `GET /api/v1/health` returns service status and a timestamp
- `GET /api/v1/events` returns the paginated event feed
- `POST /api/v1/events/ingest` accepts authenticated collector batches
- `POST /api/v1/diagnostics/client` stores rate-limited layer activations and World Pulse API outcomes
- `POST /api/v1/diagnostics/collectors` stores authenticated collector source outcomes
- `GET /api/v1/analytics/overview` returns 24-hour event metrics

Diagnostic records are stored separately in MongoDB's `api_logs` collection and
expire after 30 days. They include layer/source IDs, action, timing, status, and
sanitized error codes; they do not store request URLs, headers, credentials, or
raw error messages. Browser session IDs are random and scoped to one tab session.
Collector source outcomes are recorded per run; client records cover layer
activations and World Pulse event/analytics requests.

## Database note

The original plan used PostgreSQL with Prisma. The backend uses MongoDB with Mongoose instead, because events from different sources have different shapes and fit a document database well.
