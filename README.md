# 🌍 World Pulse (Internet Pulse Engine)

> **Tagline:** Watch the world's digital and real-world events in real time.

**World Pulse** is a real-time global event aggregation and visualization platform. It collects public data, normalizes records into a shared event schema, stores them in MongoDB, and displays geolocated events on the interactive globe in `apps/web`. The globe app is based on the MIT-licensed God's Eye View project; its license is retained in `apps/web/LICENSE`.

---

## 🎯 Core Features

- 🌐 **Interactive 3D Globe**: Explore event markers alongside God's Eye View's existing globe and geospatial layers.
- ⚡ **Live Event Feed**: Search, filter by category and importance, bookmark events, and fly the globe to a selected event.
- 🛰️ **Multiple Collectors**: GitHub, Wikimedia, USGS, NASA, CoinGecko, news, weather, launches, and Hacker News sources.
- 🎯 **Geolocated Event Markers**: Category-colored, importance-scaled records on the inherited 3D globe.
- 🔍 **Live Feed Controls**: Search, category and importance filters, browser-saved bookmarks, and source links.
- 🧭 **Globe + Live Layers**: World Pulse events work alongside God's Eye View's aircraft, satellite, weather, and camera layers.
- 📊 **Basic Analytics + Replay**: 24-hour source/category metrics and a 24-hour/7-day/30-day event timeline scrubber.
- 🧪 **In Progress**: Advanced analytics, AI briefs, notifications, authentication, and admin workflows remain planned; prototype React components are not yet wired into the active globe app.

---

## 🏗️ Architecture Overview

```
External feeds
     │
     ▼
Collectors → Normalize → Authenticated REST ingest
                               │
                               ▼
                    Express Events API ───► MongoDB
                               ▲
                               │ REST feed + analytics
                               │
                 World Pulse / God's Eye View globe
```

---

## 🛠️ Recommended Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vite, JavaScript, CesiumJS (God's Eye View base) |
| **Styling & UI** | Existing God's Eye View UI and CSS system |
| **3D & Visualization** | CesiumJS |
| **Data Fetching** | REST polling |
| **Backend API** | Node.js, Express.js, TypeScript |
| **Database & ORM** | MongoDB, Mongoose |
| **Scheduling** | node-cron |
| **Cache & Auth** | Planned |
| **Deployment** | Vercel (Frontend), Railway/Render (Backend), MongoDB |
| **DevOps & CI/CD** | Docker, GitHub Actions |

---

## 📂 Project Structure

```text
world-pulse/
├── apps/
│   ├── web/               # Vite/Cesium globe app with World Pulse event feed
│   ├── api/               # Express REST API backed by MongoDB/Mongoose
│   └── collectors/        # Microservices for fetching and normalizing external APIs
├── packages/
│   ├── shared-types/      # Common TypeScript interfaces & event schemas
│   └── shared-utils/      # Shared normalization and event utilities
├── docs/                  # Project documentation
│   ├── api.md             # REST & Socket.IO API specification
│   ├── architecture.md    # System architecture & processing pipeline
│   ├── database.md        # Current MongoDB implementation and future design
│   ├── roadmap.md         # 6-Week development timeline & phase milestones
│   └── roles.md           # Team member roles & GitHub workflow
├── docker-compose.yml     # Local service orchestration
└── .github/               # GitHub Actions CI/CD workflows
```

---

## 🌐 Public Data Sources & APIs

1. **GitHub Events API** – Public repositories, commits, pushes, and issues.
2. **Wikimedia EventStreams** – Real-time Wikipedia page edit streams.
3. **USGS Earthquake Feed** – Real-time seismic event GeoJSON feeds.
4. **Open-Meteo API** – Global weather and atmospheric metrics.
5. **CoinGecko API** – Cryptocurrency market prices and volatility.
6. **NASA Open APIs** – Astronomical picture of the day, NEOs, and natural events.
7. **Launch Library 2** – Global rocket launches and space mission events.
8. **NewsAPI / GNews / RSS Feeds** – Live breaking news coverage.
9. **Hacker News Firebase API** – Tech discussions, stories, and trending links.

---

## 👥 Team Roles & Responsibilities

- **Saumya (`saumy-a`) – Team Lead**: Repository owner, project coordination, issue prioritization, integration approval, and release sign-off.
- **Member 1 – Frontend Lead**: Interactive Dashboard, Authentication UI, 3D Globe visualization, D3 charts, Search UI, Socket.IO Client.
- **Member 2 – Backend Lead**: JWT Authentication, REST API Gateway, Prisma ORM, PostgreSQL queries, Redis caching, Socket.IO Server.
- **Member 3 – Data Collectors Lead**: Ingestion workers (GitHub, Wikimedia, USGS, NASA, CoinGecko, News), Data Normalization & Geolocation enrichment pipeline.
- **Member 4 – Analytics & DevOps Lead**: Analytics APIs, Event Replay timeline engine, Notification service, Docker, GitHub Actions CI/CD, Production Deployment.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 24.14+ or 26.x for the web workspace, `npm`, and a MongoDB database
- Docker is optional

### Setup Instructions

1. Install the workspace dependencies with `npm install`.
2. Copy `apps/api/.env.example`, `apps/collectors/.env.example`, and `apps/web/.env.example` to matching `.env` files.
3. Set `DATABASE_URL` in `apps/api/.env`. Set the same long random `WORLD_PULSE_INGEST_KEY` in the API and collector `.env` files.
4. Start the API, collectors, and globe in separate terminals:
   ```bash
   npm run dev:api
   npm run dev:collectors
   npm run dev:web
   ```
5. Open the Vite URL shown in the web terminal. The World Pulse Events panel can load stored events; `npm run seed` inserts sample records for a first look.

---

## 📚 Detailed Documentation

- 📐 [Architecture Documentation](docs/architecture.md) – Detailed system flow & event pipeline.
- 🗄️ [Database Design](docs/database.md) – Table schemas, relationships & caching layout.
- 🔌 [API Specification](docs/api.md) – REST endpoints & WebSocket protocol details.
- 👥 [Team Roles & Workflow](docs/roles.md) – Member work distribution & GitHub branch strategy.
- 🗺️ [Development Roadmap](docs/roadmap.md) – 6-Week milestones & future features.
