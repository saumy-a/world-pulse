# 🗺️ Development Roadmap & Milestones

## Overview

The development of **World Pulse (Internet Pulse Engine)** is structured into a 6-week development timeline, followed by post-release future enhancements.

---

## 🗓️ 6-Week Development Timeline

```
Week 1  [Phase 1] Project Setup, Database Schema & JWT Auth
   │
Week 2  [Phase 2] Core REST APIs & Initial Data Collectors (GitHub, Wikipedia, USGS)
   │
Week 3  [Phase 3] WebSocket Ingestion Pipeline & Interactive 3D Globe
   │
Week 4  [Phase 4] Analytics Engine, Universal Search & Additional Collectors
   │
Week 5  [Phase 5] Event Replay Timeline, AI Insights & Notification Service
   │
Week 6  [Phase 6] System Testing, Docker Containerization & Production Deployment
```

---

## 📋 Phase Breakdown

### Phase 1: Foundation, Database & Auth (Week 1)
- [x] Repository setup (npm monorepo structure with `apps/` and `packages/`).
- [x] Initial documentation (`README.md`, `architecture.md`, `database.md`, `api.md`, `roles.md`, `roadmap.md`).
- [x] Configure PostgreSQL schema with Prisma ORM (`users`, `events`, `sources`, `notifications`, etc.).
- [x] Implement JWT authentication endpoints (`/auth/register`, `/auth/login`, `/auth/me`).
- [x] Setup basic React frontend scaffold with Tailwind CSS & Zustand state management.

### Phase 2: Core Collectors & Backend APIs (Week 2)
- [x] Build event normalization engine adhering to the Unified Event Model.
- [x] Implement **GitHub Events API** collector worker.
- [x] Implement **Wikimedia EventStreams** SSE collector worker.
- [x] Implement **USGS Earthquake** GeoJSON polling worker.
- [x] Implement backend REST endpoints (`GET /events`, `GET /events/live`, `GET /events/:id`).
- [x] Integrate Redis caching for latest events stream.

### Phase 3: WebSockets & 3D Globe Visualization (Week 3)
- [x] Configure Socket.IO WebSocket server with Redis Pub/Sub integration.
- [x] Connect Socket.IO client in React application.
- [x] Develop interactive **3D Globe** component using **React Three Fiber (Three.js)**.
- [x] Implement real-time marker rendering, latitude/longitude mapping, and event arcs.
- [x] Build live streaming event ticker sidebar on frontend dashboard.

### Phase 4: Analytics, Search & Expanded Ingestion (Week 4)
- [x] Implement **Open-Meteo Weather**, **CoinGecko Crypto**, and **NASA Open APIs** collectors.
- [x] Build universal search engine (`GET /search`) with multi-attribute filtering.
- [x] Develop analytics dashboard tab featuring D3.js interactive charts.
- [x] Create Admin Dashboard panel for tracking collector health and system metrics.

### Phase 5: Replay Timeline, AI Summaries & Alerts (Week 5)
- [x] Implement **Event Replay Timeline** engine for scrubbing historical activity.
- [x] Build AI event clustering & summary endpoint (`GET /ai/summaries`).
- [x] Create real-time notification engine & alert preferences.
- [x] Implement dark mode toggle & user preference persistence.

### Phase 6: Testing, CI/CD, Deployment & Docs (Week 6)
- [x] Write automated unit & integration tests (Jest/Vitest, Supertest).
- [x] Configure Docker containerization (`docker/Dockerfile`, `docker-compose.yml`).
- [x] Setup GitHub Actions CI/CD workflow pipeline.
- [x] Deploy Frontend to Vercel, Backend to Railway/Render, PostgreSQL to Neon, and Redis to Upstash.
- [x] Final documentation polish and project demonstration preparation.

---

## 🚀 Future Enhancements

Post-semester roadmap for expanding World Pulse beyond the initial release:

1. 🧠 **Anomaly Detection**: Machine learning model analyzing event spikes to automatically identify global digital outages or natural disasters in real time.
2. 📈 **Trend Prediction**: Predictive analytics forecasting digital activity surges based on historical patterns.
3. 🌡️ **Internet Health Score**: Global index score synthesizing internet latency, BGP routing anomalies, and news sentiment into a single real-time metric.
4. 🔔 **Custom Alerts & Webhooks**: User-configured webhook triggers for specific magnitude earthquakes, high-volume GitHub projects, or crypto volatility.
5. 📱 **Mobile Native App**: React Native mobile app with push notifications for critical global alerts.
6. 🔌 **Plugin System**: Modular SDK allowing third-party developers to register custom event collector sources.
7. 📽️ **Historical Playback Studio**: Advanced video export capabilities of 3D globe event animations for media and research reporting.
