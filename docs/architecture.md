# 🏗️ System Architecture

## Overview

**World Pulse (Internet Pulse Engine)** is designed as a distributed, high-throughput, real-time event processing and visualization system. The system ingests public web events from heterogeneous data sources, normalizes them into a unified data structure, enriches them with spatial and importance metadata, and broadcasts updates live to web clients using WebSockets.

---

## 🏛️ System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           React Web Application                             |  |
|  |  +-------------------+   +--------------------+   +----------------------+  |  |
|  |  |  Home Dashboard   |   |  3D Globe (R3F)    |   |   Analytics & Charts |  |  |
|  |  +-------------------+   +--------------------+   +----------------------+  |  |
|  |  +-------------------+   +--------------------+   +----------------------+  |  |
|  |  | Event Explorer    |   | Event Replay Mode  |   | AI Insights & Admin  |  |  |
|  |  +-------------------+   +--------------------+   +----------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                 REST APIs | Socket.IO WebSockets
                                           v
+-----------------------------------------------------------------------------------+
|                              BACKEND GATEWAY LAYER                                |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           Express API Gateway                               |  |
|  |  +-------------------+   +--------------------+   +----------------------+  |  |
|  |  | Auth Middleware   |   | REST Router        |   | Socket.IO Broadcast  |  |  |
|  |  | (JWT Validation)  |   | (/events, /search) |   | Server               |  |  |
|  |  +-------------------+   +--------------------+   +----------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                            EVENT PROCESSING SERVICE                               |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 1. JSON Validation  --> 2. Schema Normalization --> 3. Geo-enrichment     |  |
|  | 4. Importance Scoring --> 5. DB Persistence     --> 6. Redis Caching & Pub |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------+-----------+----------------------------------+
                                     |           |
                     Persist Data    v           v   Cache & Stream
                      +----------------+       +----------------+
                      | PostgreSQL DB  |       |  Redis Cache   |
                      |  (Prisma ORM)  |       |   (Upstash)    |
                      +----------------+       +----------------+
                                                 ^
                                                 | Ingestion Jobs
+------------------------------------------------+----------------------------------+
|                            DATA COLLECTOR SERVICES                                |
|                                                                                   |
|  +--------------+  +------------------+  +-----------------+  +----------------+  |
|  | GitHub Event |  | Wikimedia Edit   |  | USGS Earthquake |  | CoinGecko      |  |
|  | Monitor      |  | Stream Collector |  | Feed Collector  |  | Crypto Stream  |  |
|  +--------------+  +------------------+  +-----------------+  +----------------+  |
|  +--------------+  +------------------+  +-----------------+  +----------------+  |
|  | Open-Meteo   |  | NASA Open APIs   |  | Launch Library  |  | NewsAPI /      |  |
|  | Weather Feed |  | Collector        |  | Space Tracker   |  | RSS Ingestor   |  |
|  +--------------+  +------------------+  +-----------------+  +----------------+  |
+-----------------------------------------------------------------------------------+
```

---

## ⚙️ Event Processing Pipeline

When raw event payload is captured by any collector service, it undergoes a strict 9-step pipeline before rendering on the user's dashboard:

```
  +--------------+     +---------------+     +--------------------+
  | 1. Fetch     | --> | 2. Validate   | --> | 3. Normalize       |
  |    Event     |     |    JSON       |     |    Schema          |
  +--------------+     +---------------+     +--------------------+
                                                        |
  +--------------+     +---------------+     +----------v---------+
  | 6. Store in  | <-- | 5. Calculate  | <-- | 4. Enrich with     |
  |    PostgreSQL|     |    Importance |     |    Geolocation     |
  +--------------+     +---------------+     +--------------------+
         |
  +--------------+     +---------------+     +--------------------+
  | 7. Cache in  | --> | 8. Broadcast  | --> | 9. Display on      |
  |    Redis     |     |    Socket.IO  |     |    Frontend UI     |
  +--------------+     +---------------+     +--------------------+
```

1. **Fetch Event**: Polling routines or streaming listeners receive raw event payloads from external APIs.
2. **Validate JSON**: Sanitize data structure and drop corrupted or malformed payloads.
3. **Normalize Schema**: Map source-specific payload to the **Unified Event Model**.
4. **Enrich with Geolocation**: Resolve IP/country/city tags or mapping fallback coordinates to `(lat, lng)`.
5. **Calculate Importance Score**: Apply scoring rules based on severity metrics (e.g., earthquake magnitude, GitHub star count, news priority).
6. **Store in PostgreSQL**: Persist normalized event to relational storage via Prisma ORM.
7. **Cache in Redis**: Cache latest $N$ events and publish to Redis Pub/Sub channel.
8. **Broadcast through Socket.IO**: Push live event payload to active frontend clients over WebSocket connections.
9. **Display on Frontend**: Render real-time markers on 3D Globe and append to live feeds/charts.

---

## 📦 Unified Event Model

All event collectors transform external data formats into this standardized JSON structure:

```json
{
  "id": "evt_9876543210",
  "source": "usgs_earthquake",
  "type": "seismic_activity",
  "title": "M 5.4 Earthquake - 12km NW of Tokyo, Japan",
  "description": "Seismic event detected at depth of 35km.",
  "category": "natural_disasters",
  "timestamp": "2026-07-23T11:14:45.000Z",
  "importance": 8.5,
  "location": {
    "country": "Japan",
    "city": "Tokyo",
    "lat": 35.6762,
    "lng": 139.6503
  },
  "metadata": {
    "magnitude": 5.4,
    "depth_km": 35,
    "tsunami_alert": false,
    "external_url": "https://earthquake.usgs.gov/earthquakes/eventpage/us987654"
  }
}
```

---

## 🔌 Integrated Data Sources

- **GitHub Events API**: Tracks public repository commits, pushes, releases, and pull requests.
- **Wikimedia EventStreams**: Ingests Server-Sent Events (SSE) from Wikipedia live edit feeds globally.
- **USGS GeoJSON Feed**: Fetches real-time global earthquake feeds categorized by magnitude thresholds.
- **Open-Meteo API**: Polls global weather anomalies, temperature extremes, and storm updates.
- **CoinGecko API**: Real-time cryptocurrency market updates and major price movements.
- **NASA Open APIs**: Ingests Astronomical events, Near-Earth Object (NEO) passes, and Earth observatory imagery.
- **Launch Library 2**: Tracks space exploration rocket launches and orbital events.
- **Hacker News Firebase API**: Monitors top tech news posts and viral stories.
- **NewsAPI / GNews / RSS Feeds**: Parses global headline streams and categorizes news items.
