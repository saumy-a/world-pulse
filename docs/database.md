# 🗄️ Database Design

## Overview

**World Pulse** utilizes PostgreSQL as its primary relational database management system, accessed through **Prisma ORM**, and **Redis (Upstash)** as an in-memory caching and message pub/sub tier.

---

## 📐 Entity-Relationship Schema (PostgreSQL)

```
                    +-------------------+
                    |       Users       |
                    +-------------------+
                    | id (PK)           |
                    | email             |
                    | password_hash     |
                    | role              |
                    | created_at        |
                    +---------+---------+
                              |
       +----------------------+----------------------+
       | 1:N                  | 1:N                  | 1:1
       v                      v                      v
+--------------+      +--------------+      +------------------+
| Notifications|      |SavedDashb'rds|      | UserPreferences  |
+--------------+      +--------------+      +------------------+
| id (PK)      |      | id (PK)      |      | id (PK)          |
| user_id (FK) |      | user_id (FK) |      | user_id (FK, Unq)|
| title        |      | name         |      | theme            |
| message      |      | config (JSON)|      | default_view     |
| is_read      |      +--------------+      +------------------+
+--------------+

+------------------+         +------------------+         +------------------+
|      Events      |         |     Sources      |         |   AISummaries    |
+------------------+         +------------------+         +------------------+
| id (PK)          |         | id (PK)          |         | id (PK)          |
| source_id (FK)   | <-----> | name             |         | topic            |
| source_type      |   N:1   | api_url          |         | summary          |
| category         |         | status           |         | event_ids (JSON) |
| title            |         | fetch_interval   |         | generated_at     |
| description      |         +------------------+         +------------------+
| importance       |
| lat / lng        |
| metadata (JSON)  |
+------------------+
```

---

## 📋 Table Definitions

### 1. `users`
Stores user profile information, authentication credentials, and access roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Unique user ID |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | User email address |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypted password hash |
| `role` | `ENUM('ADMIN', 'USER')` | `DEFAULT 'USER'` | Authorization role |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

### 2. `events`
Main store for normalized digital & physical internet events.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PK` | Unique event ID |
| `source_id` | `UUID` | `FK -> sources.id, NULLABLE` | Associated collector source |
| `source_type` | `VARCHAR(50)` | `NOT NULL, INDEX` | Source string (e.g. `github`, `usgs`) |
| `category` | `VARCHAR(50)` | `NOT NULL, INDEX` | Event category |
| `title` | `TEXT` | `NOT NULL` | Event headline title |
| `description` | `TEXT` | `NULLABLE` | Full event description |
| `importance` | `FLOAT` | `NOT NULL, INDEX` | Importance rating (0.0 to 10.0) |
| `country` | `VARCHAR(100)` | `NULLABLE` | Country name |
| `city` | `VARCHAR(100)` | `NULLABLE` | City name |
| `lat` | `FLOAT` | `NULLABLE` | Latitude coordinate |
| `lng` | `FLOAT` | `NULLABLE` | Longitude coordinate |
| `metadata` | `JSONB` | `DEFAULT '{}'` | Custom payload attributes |
| `timestamp` | `TIMESTAMPTZ` | `NOT NULL, INDEX` | Occurrence timestamp |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record insertion time |

### 3. `sources`
Tracks active collector pipelines and API endpoint health.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Source configuration ID |
| `name` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Service name (e.g., `GitHub Events`) |
| `api_url` | `TEXT` | `NOT NULL` | External API endpoint URL |
| `status` | `ENUM('ACTIVE', 'DEGRADED', 'OFFLINE')` | `DEFAULT 'ACTIVE'` | Collector operational status |
| `fetch_interval_sec`| `INT` | `DEFAULT 60` | Polling frequency in seconds |
| `total_events_collected`| `BIGINT` | `DEFAULT 0` | Metrics tracking counter |

### 4. `notifications`
Real-time alerts sent to specific system users.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Notification ID |
| `user_id` | `UUID` | `FK -> users.id, NOT NULL` | Target user reference |
| `title` | `VARCHAR(255)` | `NOT NULL` | Alert title |
| `message` | `TEXT` | `NOT NULL` | Alert message body |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | Read status flag |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Alert generation timestamp |

### 5. `saved_dashboards`
Stores personalized layout configurations for user dashboards.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Dashboard config ID |
| `user_id` | `UUID` | `FK -> users.id, NOT NULL` | Owner user ID |
| `name` | `VARCHAR(100)` | `NOT NULL` | Custom dashboard name |
| `config` | `JSONB` | `NOT NULL` | Widget arrangement & filter JSON |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |

### 6. `ai_summaries`
Automated AI-generated summaries covering cluster activity over time windows.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Summary ID |
| `topic` | `VARCHAR(100)` | `NOT NULL` | Summary topic (e.g., `Global Seismic Activity`) |
| `summary` | `TEXT` | `NOT NULL` | Generated AI text summary |
| `event_ids` | `JSONB` | `NOT NULL` | Array of source event IDs summarized |
| `generated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of generation |

### 7. `user_preferences`
User interface settings and display preferences.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Preference ID |
| `user_id` | `UUID` | `FK -> users.id, UNIQUE, NOT NULL` | Owner user ID |
| `theme` | `VARCHAR(20)` | `DEFAULT 'dark'` | UI theme preference (`dark`/`light`) |
| `default_view` | `VARCHAR(50)` | `DEFAULT '3d_globe'` | Landing component |
| `notifications_enabled` | `BOOLEAN` | `DEFAULT TRUE` | Global alert toggle |

---

## ⚡ Redis Caching & Pub/Sub Strategy

Redis (via Upstash) acts as the high-speed data caching and WebSocket streaming distribution layer.

### Key Structures
1. **Latest Event Stream Cache**:
   - `Key`: `events:latest` (Sorted Set `ZSET` scored by timestamp).
   - Keeps the top 500 most recent events in memory for fast client initial load without hitting PostgreSQL.
2. **Event Details Cache**:
   - `Key`: `event:<id>` (String / JSON with 1-hour TTL).
3. **Session Cache**:
   - `Key`: `session:<user_id>` (Hash storing active WebSocket session IDs).

### Pub/Sub Channels
- **`events:stream`**: Collector worker services publish newly normalized events to this channel. The API server listens and relays payloads over Socket.IO to connected web clients.
- **`alerts:broadcast`**: High-importance alerts broadcast channel.
