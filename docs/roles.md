# 👥 Team Roles & GitHub Workflow

## Project Scope & Work Allocation

**World Pulse** is developed as a 4-member Advanced Web Technology (AWT) semester project. Work is distributed equally across core engineering pillars: Frontend UI & 3D, Backend API & Gateway, Data Collectors & Normalization, and Analytics & DevOps.

---

## 👨‍💻 Member Roles & Task Breakdown

### Member 1: Frontend & 3D Visualization Lead
- **Primary Responsibility**: Client-side web application, user interface, 3D Globe, and real-time Socket.IO client integration.
- **Key Modules & Tasks**:
  - **Interactive Dashboard**: Modular tile layout using Tailwind CSS, dark mode support, responsive design for desktop and mobile.
  - **Live 3D Globe**: Render high-performance 3D Earth using **React Three Fiber (Three.js)** with animated event markers, arcs, and geolocation pins.
  - **Data Visualization**: Interactive time-series & breakdown charts using **D3.js**.
  - **User Authentication UI**: Login, Registration, and User Profile settings screens.
  - **Real-Time Client**: Socket.IO client stream handler, Zustand global state management, and TanStack Query integration.

### Member 2: Backend API & Storage Lead
- **Primary Responsibility**: Server architecture, REST API Gateway, database modeling, authentication, and WebSocket server setup.
- **Key Modules & Tasks**:
  - **Authentication Service**: JWT-based login/registration, password hashing with bcrypt, role-based access control (RBAC).
  - **REST API Server**: Express.js router setup, input validation schemas, error handling middleware, paginated event endpoints.
  - **Database & ORM**: PostgreSQL database schema design, Prisma ORM migration setup, indexed spatial queries.
  - **Caching & Real-Time Gateway**: Redis integration for hot event caching and Socket.IO server broadcast gateway.

### Member 3: Data Collectors & Pipeline Lead
- **Primary Responsibility**: External API integrations, collector microservices, event normalization, and importance scoring.
- **Key Modules & Tasks**:
  - **API Collectors**: Microservice worker routines for:
    - **GitHub Events API** (Commits, pushes, PRs)
    - **Wikimedia EventStreams** (Live Wikipedia edit stream listener)
    - **USGS Earthquake GeoJSON Feed** (Seismic event polling)
    - **Open-Meteo Weather API** (Weather anomalies)
    - **CoinGecko & Financial APIs** (Crypto market movements)
    - **NASA & Launch Library APIs** (Astronomical events & rocket launches)
    - **News APIs & RSS Ingestor** (Hacker News Firebase, NewsAPI)
  - **Event Normalization Engine**: Pipeline stage converting raw payloads into the **Unified Event Model**.
  - **Geolocation & Importance Scoring**: Algorithm for mapping IP/Location tags and scoring incident importance (0.0 – 10.0 scale).

### Member 4: Analytics, DevOps & Infrastructure Lead
- **Primary Responsibility**: Analytics APIs, event replay engine, notification engine, CI/CD pipelines, containerization, and cloud deployment.
- **Key Modules & Tasks**:
  - **Analytics Engine**: Aggregation queries for event volume, source health, and geographic density heatmaps.
  - **Event Replay Mode**: Backend timeline engine for historical playback and time-series queries.
  - **Notifications Service**: User notification preference engine and alert broadcast trigger.
  - **DevOps & CI/CD**: Docker container definitions, Docker Compose stack setup, GitHub Actions workflow for linting, testing, and automated deployment (Vercel, Render/Railway, Neon PostgreSQL, Upstash Redis).
  - **Monitoring & Documentation**: System status page, health checks, and maintaining API & architecture docs.

---

## 🌿 GitHub Workflow & Branching Strategy

To maintain code quality and enable non-conflicting parallel development among 4 members, the project follows a strict Git feature-branch workflow.

### Branch Structure

```text
main           (Production stable releases)
  │
develop        (Staging & integration branch)
  ├── feature/frontend    (Member 1: Dashboard, Globe, UI)
  ├── feature/backend     (Member 2: Express APIs, Prisma, Auth)
  ├── feature/collectors  (Member 3: API collectors, Normalization)
  └── feature/analytics   (Member 4: Analytics, Replay, CI/CD)
```

### 7-Step Collaboration Rules

1. **Pull Latest Develop**:
   Before starting any task, sync local work with the latest develop branch:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create Feature Branch**:
   Branch off `develop` using standard branch naming:
   ```bash
   git checkout -b feature/frontend-3d-globe
   ```

3. **Commit Frequently**:
   Write clear, atomic commit messages following conventional commits format:
   ```bash
   git commit -m "feat(globe): add animated event marker arcs using Three.js"
   ```

4. **Push Feature Branch**:
   ```bash
   git push origin feature/frontend-3d-globe
   ```

5. **Create Pull Request (PR)**:
   Open a PR against the `develop` branch on GitHub. Assign at least 1 team member to review.

6. **Code Review & Automated Checks**:
   GitHub Actions runs automated linting and build tests. Once approved by a team reviewer, merge PR into `develop`.

7. **Release to Main**:
   End-of-phase releases are tested on `develop` before creating a pull request to merge `develop` into `main` for production deployment.
