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

## Database note

The original plan used PostgreSQL with Prisma. The backend uses MongoDB with Mongoose instead, because events from different sources have different shapes and fit a document database well.
