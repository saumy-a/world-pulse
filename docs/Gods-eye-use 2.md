# 🌍 World Pulse
## God's Eye View Base Integration Plan

**Project:** World Pulse — Real-Time Global Event Intelligence & Visualization Platform  
**Purpose:** Define how the existing God's Eye View project will be used as a foundation for World Pulse.

---

# 1. Objective

World Pulse will use the **God's Eye View** project as a reference/base for the **3D globe and geographic visualization layer**.

We will **not simply copy, rename, or submit God's Eye View as our project**.

Instead, we will use its existing visualization concepts/components where technically and legally appropriate, and build our own:

- Event aggregation system
- Data collectors
- Unified event model
- Backend
- Database
- WebSocket pipeline
- Authentication
- Search
- Analytics
- Filtering
- Notifications
- Project documentation

The goal is to transform a globe visualization into a complete **real-time global event intelligence platform**.

---

# 2. Core Idea

### God's Eye View

Primarily focuses on:

```text
Global Data
     ↓
Geospatial Visualization
     ↓
3D Globe
     ↓
Interactive Layers
```

### World Pulse

Will focus on:

```text
Multiple External Sources
          ↓
      Collectors
          ↓
     Normalization
          ↓
      Event Engine
          ↓
     PostgreSQL
          ↓
   REST + WebSockets
          ↓
    World Pulse UI
          ↓
 ┌────────┴────────┐
 ↓                 ↓
3D Globe       Intelligence
              Dashboard
```

Therefore:

> **God's Eye View provides the inspiration/foundation for visualization, while World Pulse provides the event intelligence architecture.**

---

# 3. What We Want to Reuse

The following areas can potentially be reused or adapted after checking the repository's license and implementation.

## 3.1 3D Globe

The globe is one of the most valuable components.

We want:

- Interactive Earth
- Zoom
- Rotation
- Geographic positioning
- Event markers
- Layer visualization
- Location-based interaction

Example:

```text
             WORLD PULSE GLOBE

                  🌍
          ● Earthquake
                   \
                    ● GitHub Event
             ●
          NASA Event

       ● News Event

     [Filters] [Search] [Timeline]
```

---

# 4. Globe Requirements for World Pulse

The World Pulse globe should eventually support:

### Navigation

- Rotate
- Zoom
- Pan
- Reset view
- Select country
- Select region

### Event visualization

Events should appear according to:

```text
latitude
longitude
timestamp
category
importance
```

Example:

```json
{
  "id": "evt_123",
  "source": "USGS",
  "type": "earthquake",
  "title": "Earthquake detected",
  "category": "natural_disaster",
  "timestamp": "2026-10-05T08:30:00Z",
  "importance": 8,
  "location": {
    "latitude": 23.5,
    "longitude": 72.1
  }
}
```

---

# 5. What We Will NOT Reuse Directly

We should not blindly copy the entire God's Eye View project.

World Pulse will have its own:

- Backend
- Database
- API
- Authentication
- Event schema
- Collector architecture
- Analytics
- Search
- Notification system
- GitHub repository structure
- Documentation

The project should remain architecturally understandable as **our own system**.

---

# 6. World Pulse Architecture

```text
                         EXTERNAL SOURCES
                              │
        ┌─────────────┬───────┼─────────┬───────────┐
        ↓             ↓       ↓         ↓           ↓
      GitHub         USGS    NASA      News      CoinGecko
        │             │       │         │           │
        └─────────────┴───────┴─────────┴───────────┘
                              │
                              ▼
                       COLLECTOR LAYER
                              │
                              ▼
                       NORMALIZATION
                              │
                              ▼
                       EVENT VALIDATION
                              │
                              ▼
                    ┌──────────────────┐
                    │   EVENT ENGINE   │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ↓                           ↓
          PostgreSQL                      Redis
                │                           │
                └─────────────┬─────────────┘
                              ↓
                       EXPRESS BACKEND
                              │
                  ┌───────────┴───────────┐
                  ↓                       ↓
                REST                  Socket.IO
                  │                       │
                  └───────────┬───────────┘
                              ↓
                       WORLD PULSE WEB
                              │
                ┌─────────────┴─────────────┐
                ↓                           ↓
             3D GLOBE                  DASHBOARD
                │                           │
                ↓                           ↓
         Event Visualization          Analytics
         Geographic Layers            Search
         Timeline                     Filters
```

---

# 7. Event-Centric Architecture

The most important difference between World Pulse and a simple globe application is that **the event is the central unit of the system**.

Everything should eventually revolve around:

```text
EVENT
```

An event contains:

```text
ID
Source
Type
Title
Description
Category
Timestamp
Importance
Location
Metadata
```

Example:

```json
{
  "id": "evt_001",
  "source": "NASA",
  "type": "space",
  "title": "Satellite launch",
  "description": "Launch event detected",
  "category": "space",
  "timestamp": "2026-10-05T10:00:00Z",
  "importance": 7,
  "location": {
    "latitude": 28.5,
    "longitude": -80.6
  },
  "metadata": {}
}
```

---

# 8. Collector Architecture

Every external data source will have its own collector.

Recommended structure:

```text
apps/
└── collectors/
    ├── github/
    │   └── githubCollector.ts
    │
    ├── usgs/
    │   └── usgsCollector.ts
    │
    ├── nasa/
    │   └── nasaCollector.ts
    │
    ├── news/
    │   └── newsCollector.ts
    │
    ├── wikipedia/
    │   └── wikipediaCollector.ts
    │
    └── coingecko/
        └── coinGeckoCollector.ts
```

Each collector follows:

```text
FETCH
  ↓
PARSE
  ↓
NORMALIZE
  ↓
VALIDATE
  ↓
STORE
  ↓
BROADCAST
```

---

# 9. Frontend Architecture

The frontend will use the globe foundation together with our own World Pulse UI.

```text
apps/
└── web/
    ├── components/
    │   ├── Globe/
    │   ├── EventMarker/
    │   ├── EventCard/
    │   ├── Filters/
    │   ├── Search/
    │   ├── Timeline/
    │   └── Dashboard/
    │
    ├── pages/
    │   ├── Login/
    │   ├── Register/
    │   ├── Dashboard/
    │   ├── Globe/
    │   └── Analytics/
    │
    ├── services/
    │   ├── api.ts
    │   └── socket.ts
    │
    └── stores/
        └── eventStore.ts
```

---

# 10. Globe + Backend Integration

The globe should not directly communicate with external APIs.

Incorrect:

```text
Globe
  ↓
USGS API
  ↓
NASA API
  ↓
GitHub API
```

Instead:

```text
USGS ──────┐
NASA ──────┤
GitHub ────┤
News ──────┤
           ↓
       Collectors
           ↓
      Event Engine
           ↓
       PostgreSQL
           ↓
       Backend
           ↓
      Socket.IO
           ↓
         Globe
```

This makes the system easier to maintain and scale.

---

# 11. Real-Time Event Flow

Example: a new earthquake occurs.

```text
USGS
 ↓
USGS Collector
 ↓
Normalize Event
 ↓
Validate Event
 ↓
PostgreSQL
 ↓
Socket.IO
 ↓
Frontend
 ↓
Globe
 ↓
New Marker Appears
```

The user should not need to refresh the page.

---

# 12. Event Categories

World Pulse can eventually support categories such as:

```text
🌋 Natural Disaster
🌍 Earthquake
🚀 Space
💻 Technology
📰 News
📈 Finance
🔬 Science
🌐 Internet
🛰️ Satellite
✈️ Aviation
🚢 Maritime
🎮 Gaming
```

The actual categories should be finalized after the collector implementations are tested.

---

# 13. Globe Interaction

When a user clicks an event marker:

```text
                  🌍
                   ●
                   │
                   ▼
             EVENT DETAILS

      ┌─────────────────────────┐
      │ Earthquake detected     │
      │                         │
      │ Source: USGS            │
      │ Magnitude: 5.8          │
      │ Location: Gujarat       │
      │ Time: 10:32 AM          │
      │                         │
      │ View Details →          │
      └─────────────────────────┘
```

The event panel should be generated from the World Pulse event model.

---

# 14. Filters

The globe should support filters such as:

```text
Category
Source
Time
Importance
Country
Region
Event Type
```

Example:

```text
FILTERS

Source:
☑ USGS
☑ NASA
☐ GitHub
☐ News

Category:
☑ Natural Disaster
☐ Space
☐ Technology

Time:
○ Last hour
● Last 24 hours
○ Last 7 days
```

---

# 15. Timeline

World Pulse should eventually provide a timeline.

Example:

```text
12:00 ─────── 13:00 ─────── 14:00 ─────── 15:00

      ●            ● ●             ●
   Event        Events          Event
```

The user can move through time and inspect historical events.

---

# 16. Dashboard

The globe should not be the entire application.

The dashboard should show:

```text
WORLD PULSE

Active Events                  1,284
Events Today                     8,532
Active Sources                      12
Critical Events                     27

────────────────────────────────────────

        3D GLOBAL EVENT MAP

              🌍

────────────────────────────────────────

Trending Events

1. Major Earthquake
2. Space Launch
3. Technology Event
4. Market Movement
5. Breaking News
```

---

# 17. Analytics

The backend can calculate:

- Events per hour
- Events per category
- Events per country
- Events per source
- Trending locations
- Event frequency
- Historical activity
- Most active regions

Example:

```text
Events by Category

Natural Disaster ████████████
Technology       ████████
News             █████████████
Space            ████
Finance          ██████
```

---

# 18. Technology Stack

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
Zustand
React Three Fiber / existing globe technology
D3.js
Socket.IO Client
Shadcn/UI
```

## Backend

```text
Node.js
Express
TypeScript
Prisma
PostgreSQL
Socket.IO
JWT
Redis
BullMQ
```

## Infrastructure

```text
Docker
GitHub Actions
Vercel
Railway / Render
Neon PostgreSQL
Upstash Redis
```

---

# 19. Team Responsibilities

## Member 1 — Team Leader / Core Integration

Responsible for:

- System architecture
- Shared event schema
- Event validation
- Backend integration
- WebSockets
- Redis
- Docker
- GitHub Actions
- Integration testing
- Code reviews
- Documentation

---

## Member 2 — Frontend & Visualization

Responsible for:

- God's Eye-style globe foundation
- React integration
- Event markers
- Dashboard
- Filters
- Search UI
- Timeline
- Event details
- Responsive design

---

## Member 3 — Backend & Database

Responsible for:

- Express API
- PostgreSQL
- Prisma
- Database schema
- Authentication
- REST APIs
- Event APIs
- Search APIs
- Backend testing

---

## Member 4 — Collectors & Analytics

Responsible for:

- External APIs
- Data collectors
- Data normalization
- Collector scheduling
- Analytics
- Trending events
- Historical data
- Collector testing

---

# 20. Git Strategy

The God's Eye View base should **not be directly modified on `main`**.

The World Pulse repository follows:

```text
main
 │
 └── develop
       │
       ├── feature/globe-foundation
       ├── feature/event-markers
       ├── feature/usgs-collector
       ├── feature/event-api
       └── feature/dashboard
```

Every modification should happen through a feature branch and Pull Request.

---

# 21. Recommended First Development Phase

Before building all collectors, establish the globe foundation.

### Phase 1

```text
God's Eye View
       ↓
Understand globe architecture
       ↓
Check license
       ↓
Create World Pulse frontend
       ↓
Integrate globe
       ↓
Display static mock events
```

The globe should first display fake/test events.

Example:

```json
[
  {
    "title": "Test Earthquake",
    "latitude": 23.02,
    "longitude": 72.57
  },
  {
    "title": "Test Space Event",
    "latitude": 28.61,
    "longitude": -80.60
  }
]
```

Only after this works should we connect real APIs.

---

# 22. Phase 2 — Connect Backend

```text
Frontend
    ↓
REST API
    ↓
Express
    ↓
PostgreSQL
```

The globe receives real events from our backend.

---

# 23. Phase 3 — Add Collectors

Start with a small number of reliable sources.

Recommended initial sources:

```text
1. USGS
2. GitHub
3. NASA
```

Then add:

```text
4. Wikimedia
5. News
6. CoinGecko
7. Other sources
```

This prevents the team from trying to build everything simultaneously.

---

# 24. Phase 4 — Real-Time Streaming

Add:

```text
Collector
 ↓
Event Processing
 ↓
Redis
 ↓
Socket.IO
 ↓
Frontend
 ↓
Globe
```

Now new events appear automatically.

---

# 25. Phase 5 — Intelligence Layer

Add:

```text
Search
Filters
Analytics
Trending
Historical replay
Notifications
```

This is where World Pulse becomes substantially more than a globe visualization.

---

# 26. Phase 6 — Production Polish

Final work:

```text
Authentication
Error handling
Loading states
Empty states
Responsive UI
Security
Testing
Performance
Docker
CI/CD
Deployment
Documentation
```

---

# 27. Legal & Licensing Requirement

Before copying or modifying code from God's Eye View:

### The team MUST inspect:

```text
LICENSE
README
package.json
Third-party dependencies
Attribution requirements
Asset licenses
Data-source terms
```

Do not assume that code is freely reusable simply because the GitHub repository is public.

If the license permits reuse, follow its requirements.

If the license does not permit the type of reuse we want, we should use the project only as **technical inspiration** and implement our own version.

---

# 28. Third-Party Data

World Pulse will also depend on external APIs.

Each source must be checked for:

- API usage terms
- Rate limits
- Attribution requirements
- Commercial/non-commercial restrictions
- Redistribution restrictions
- Data licensing

The source should be stored with the event.

Example:

```json
{
  "source": "USGS",
  "sourceUrl": "...",
  "sourceEventId": "...",
  "timestamp": "..."
}
```

---

# 29. What Makes World Pulse Unique?

Our differentiation should be:

### God's Eye View

```text
Visualize global information
```

### World Pulse

```text
COLLECT
   ↓
NORMALIZE
   ↓
VALIDATE
   ↓
STORE
   ↓
STREAM
   ↓
ANALYZE
   ↓
VISUALIZE
```

World Pulse is therefore:

> **A real-time global event aggregation, intelligence, and visualization platform.**

The globe is the interface.

The **event engine is the actual project**.

---

# 30. Final Architecture

The final system should look like:

```text
                    WORLD PULSE
                         │
        ┌────────────────┴────────────────┐
        │                                 │
     DATA LAYER                       VISUAL LAYER
        │                                 │
  External Sources                    3D Globe
        │                                 │
    Collectors                       Dashboard
        │                                 │
   Normalization                     Analytics
        │                                 │
    Validation                       Timeline
        │                                 │
   Event Processing                  Filters
        │                                 │
   PostgreSQL + Redis                Search
        │                                 │
        └──────────────┬──────────────────┘
                       │
                 Express API
                       │
                 Socket.IO
                       │
                 React Frontend
```

---

# 31. Final Decision

### We WILL:

✅ Use God's Eye View as a reference/base for the globe visualization where permitted by its license.

✅ Build our own World Pulse event architecture.

✅ Build our own collectors.

✅ Build our own backend.

✅ Build our own database.

✅ Build our own event schema.

✅ Build our own real-time pipeline.

✅ Add analytics and search.

✅ Integrate the globe with our backend.

✅ Clearly document third-party components and licenses.

### We WILL NOT:

❌ Simply fork and rename the project.

❌ Copy the entire application without understanding it.

❌ Claim third-party code as completely original.

❌ Ignore licensing requirements.

❌ Make the globe the entire project.

---

# 32. Project Positioning

For the final presentation, describe World Pulse as:

> **World Pulse — A Real-Time Global Event Intelligence & Visualization Platform**

And explain:

> "World Pulse aggregates real-time events from multiple public data sources, normalizes them into a unified event model, processes and stores them through a backend event engine, streams updates in real time, and visualizes global activity through an interactive 3D globe and analytical dashboard."

This clearly differentiates the project from a simple globe visualization application.

---

# 33. Development Principle

The team should follow:

```text
USE THE GLOBE
BUILD THE ENGINE
OWN THE ARCHITECTURE
```

The globe is what users see.

The event engine is what makes World Pulse a real project.

The architecture, collectors, normalization, backend, database, WebSockets, analytics, and frontend integration are what the team should develop and demonstrate.

---

## End Goal

```text
             🌍 WORLD PULSE

     ┌──────────────────────────┐
     │      INTERACTIVE GLOBE   │
     └────────────┬─────────────┘
                  │
        REAL-TIME EVENT STREAM
                  │
     ┌────────────┴─────────────┐
     │                          │
  DASHBOARD                  EVENTS
     │                          │
 ANALYTICS                  DETAILS
 SEARCH                     SOURCE
 FILTERS                    TIMELINE
     │                          │
     └────────────┬─────────────┘
                  │
           EVENT INTELLIGENCE
                  │
        ┌─────────┴─────────┐
        │                   │
     COLLECTORS          DATABASE
        │                   │
        └─────────┬─────────┘
                  │
           GLOBAL SOURCES
```

**World Pulse is not God's Eye View.**

**God's Eye View is the potential visual foundation. World Pulse is the system built around it.**