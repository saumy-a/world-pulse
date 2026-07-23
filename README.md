# 🌍 World Pulse (Internet Pulse Engine)

> **Tagline:** Watch the world's digital and real-world events in real time.

**World Pulse** (Internet Pulse Engine / IPE) is a full-stack real-time global event aggregation and visualization platform. Built as an Advanced Web Technology (AWT) semester project, it continuously ingests live event data from multiple public web APIs (GitHub, Wikipedia, USGS earthquakes, NASA, CoinGecko, weather, news feeds, etc.), normalizes the stream into a unified data schema, enriches events with geolocation and importance metrics, and streams updates to clients via WebSockets for real-time visualization on an interactive 3D globe and analytical dashboard.

---

## 🎯 Core Features

- 🌐 **Interactive 3D Globe**: Render live global events visually on a 3D Earth model built with React Three Fiber (Three.js).
- ⚡ **Real-Time Event Feed**: High-throughput event streaming via Socket.IO for instant client updates.
- 🐙 **GitHub Activity Monitor**: Real-time tracking of public repository pushes, pull requests, and releases.
- 📝 **Wikimedia Edit Stream**: Live edit stream monitoring across Wikipedia global languages.
- 🌋 **Earthquake & Weather Alerts**: USGS seismic GeoJSON feed ingestion combined with Open-Meteo weather data.
- 📈 **Crypto & Financial Dashboard**: Ingestion of CoinGecko market ticks and economic events.
- 🤖 **AI Insights & Summaries**: Smart event clustering and automated activity summaries.
- 🔍 **Advanced Search & Filtering**: Multi-attribute filtering (source, category, country, importance, date range).
- ⏪ **Event Replay Timeline**: Historical playback mode to scrub through past digital & physical incidents.
- 🔐 **Authentication & Roles**: Secure JWT-based User Authentication and Admin Dashboard control.
- 🌗 **Dark Mode & Responsive UI**: Fluid, modern interface supporting mobile, tablet, and desktop views.

---

## 🏗️ Architecture Overview

```
                         +-----------------------------------+
                         |      React Frontend (Vite)        |
                         |  (Dashboard, 3D Globe, Analytics) |
                         +-----------------+-----------------+
                                           |
                                  REST / Socket.IO
                                           |
                         +-----------------v-----------------+
                         |       Express API Gateway         |
                         |  (Auth | Events API | Analytics)  |
                         +-----------------+-----------------+
                                           |
                         +-----------------v-----------------+
                         |      Event Processing Layer       |
                         |  (Normalize -> Geo -> Importance) |
                         +--------+-----------------+--------+
                                  |                 |
                         +--------v-------+ +-------v--------+
                         | PostgreSQL DB  | |  Redis Cache   |
                         |  (Prisma ORM)  | |  (Upstash)     |
                         +----------------+ +----------------+
                                           ^
                                           | Event Ingestion
                         +-----------------+-----------------+
                         |        Collector Services         |
                         +-----------------+-----------------+
                                           |
     +---------+----------+----------+-----+-----+-----------+----------+
     |         |          |          |           |           |          |
  GitHub   Wikimedia     USGS    CoinGecko     NASA     News/RSS    Open-Meteo
  Events  EventStreams Earthquake   Market     APIs       Feeds      Weather
```

---

## 🛠️ Recommended Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Framer Motion |
| **3D & Visualization** | React Three Fiber (Three.js), D3.js |
| **State & Data Fetching** | Zustand, TanStack Query (React Query) |
| **Real-time Client** | Socket.IO Client |
| **Backend API** | Node.js, Express.js, TypeScript |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Cache & Queue** | Redis (Upstash), BullMQ, node-cron |
| **Auth** | JSON Web Tokens (JWT) |
| **Deployment** | Vercel (Frontend), Railway/Render (Backend), Neon PostgreSQL, Upstash Redis |
| **DevOps & CI/CD** | Docker, GitHub Actions |

---

## 📂 Project Structure

```text
world-pulse/
├── apps/
│   ├── web/               # React frontend application (Dashboard, 3D Globe, Charts)
│   ├── api/               # Express REST API & Socket.IO server engine
│   └── collectors/        # Microservices for fetching and normalizing external APIs
├── packages/
│   ├── shared-types/      # Common TypeScript interfaces & event schemas
│   ├── shared-api/        # Shared API fetchers and HTTP client utilities
│   └── shared-ui/         # Shared design components & UI tokens
├── docs/                  # Project documentation
│   ├── api.md             # REST & Socket.IO API specification
│   ├── architecture.md    # System architecture & processing pipeline
│   ├── database.md        # PostgreSQL database schema & Redis strategy
│   ├── roadmap.md         # 6-Week development timeline & phase milestones
│   └── roles.md           # Team member roles & GitHub workflow
├── docker/                # Docker compose & container definitions
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

- **Member 1 – Frontend Lead**: Interactive Dashboard, Authentication UI, 3D Globe visualization, D3 charts, Search UI, Socket.IO Client.
- **Member 2 – Backend Lead**: JWT Authentication, REST API Gateway, Prisma ORM, PostgreSQL queries, Redis caching, Socket.IO Server.
- **Member 3 – Data Collectors Lead**: Ingestion workers (GitHub, Wikimedia, USGS, NASA, CoinGecko, News), Data Normalization & Geolocation enrichment pipeline.
- **Member 4 – Analytics & DevOps Lead**: Analytics APIs, Event Replay timeline engine, Notification service, Docker, GitHub Actions CI/CD, Production Deployment.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+) & `npm` / `pnpm`
- PostgreSQL & Redis (local or cloud instances like Neon & Upstash)
- Docker (optional)

### Setup Instructions

1. **Clone repository**:
   ```bash
   git clone https://github.com/your-org/world-pulse.git
   cd world-pulse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   Copy `.env.example` to `.env` in `apps/api` and `apps/web` and populate database URIs and API keys.

4. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Servers**:
   ```bash
   npm run dev
   ```

---

## 📚 Detailed Documentation

- 📐 [Architecture Documentation](docs/architecture.md) – Detailed system flow & event pipeline.
- 🗄️ [Database Design](docs/database.md) – Table schemas, relationships & caching layout.
- 🔌 [API Specification](docs/api.md) – REST endpoints & WebSocket protocol details.
- 👥 [Team Roles & Workflow](docs/roles.md) – Member work distribution & GitHub branch strategy.
- 🗺️ [Development Roadmap](docs/roadmap.md) – 6-Week milestones & future features.
