# 🔌 API Documentation

## Overview

**World Pulse** exposes RESTful endpoints for resource management, queries, authentication, and analytics, combined with a **Socket.IO** real-time WebSocket protocol for live event feeds and instant alert delivery.

Base URL for REST endpoints: `/api/v1`

---

## 🔐 Authentication Endpoints

### 1. Register New User
- **Endpoint**: `POST /auth/register`
- **Auth Required**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "u_12345678",
        "email": "user@example.com",
        "role": "USER"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 2. Login User
- **Endpoint**: `POST /auth/login`
- **Auth Required**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "u_12345678",
        "email": "user@example.com",
        "role": "USER"
      }
    }
  }
  ```

### 3. Get Current User Profile
- **Endpoint**: `GET /auth/me`
- **Auth Required**: `Bearer <JWT_TOKEN>`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "u_12345678",
      "email": "user@example.com",
      "role": "USER",
      "created_at": "2026-07-23T10:00:00.000Z"
    }
  }
  ```

---

## ⚡ Events Endpoints

### 1. Get Paginated Events Stream
- **Endpoint**: `GET /events`
- **Auth Required**: Optional
- **Query Parameters**:
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 20, max: 100)*
  - `source` *(string, optional, e.g. `github`, `usgs`)*
  - `category` *(string, optional, e.g. `seismic`, `code_push`)*
  - `minImportance` *(float, optional)*
  - `country` *(string, optional)*
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "evt_9876543210",
        "source": "usgs_earthquake",
        "type": "seismic_activity",
        "title": "M 5.4 Earthquake - Tokyo, Japan",
        "category": "natural_disasters",
        "importance": 8.5,
        "timestamp": "2026-07-23T11:14:45.000Z",
        "location": {
          "country": "Japan",
          "city": "Tokyo",
          "lat": 35.6762,
          "lng": 139.6503
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1420,
      "totalPages": 71
    }
  }
  ```

### 2. Get Live Feed (Cached Hot Events)
- **Endpoint**: `GET /events/live`
- **Auth Required**: None
- **Response** (`200 OK`): Returns top 50 recent high-importance events cached in Redis.

### 3. Get Single Event Details
- **Endpoint**: `GET /events/:id`
- **Auth Required**: None
- **Response** (`200 OK`): Detailed event payload including raw metadata.

### 4. Historical Events (Replay Mode)
- **Endpoint**: `GET /events/history`
- **Auth Required**: Optional
- **Query Parameters**: `startTime` *(ISO String)*, `endTime` *(ISO String)*, `stepMinutes` *(number)*.

---

## 📊 Analytics & Search Endpoints

### 1. Get Global Event Analytics Overview
- **Endpoint**: `GET /analytics/overview`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "totalEvents24h": 45890,
      "eventsByCategory": {
        "code_push": 18200,
        "wiki_edit": 15400,
        "seismic": 320,
        "crypto": 8500,
        "news": 3470
      },
      "activeCollectors": 9,
      "averageImportance": 4.2
    }
  }
  ```

### 2. Universal Search
- **Endpoint**: `GET /search`
- **Query Parameters**: `q` *(search term)*, `category` *(optional)*, `from` *(date)*, `to` *(date)*.
- **Response** (`200 OK`): Matching events and summaries.

### 3. Get AI Insights & Summaries
- **Endpoint**: `GET /ai/summaries`
- **Response** (`200 OK`): Summarized trends generated from recent event clusters.

---

## 📡 Socket.IO Real-Time Protocol

Clients establish a persistent WebSocket connection to `/socket.io`.

### Connection Handshake
```js
import { io } from "socket.io-client";
const socket = io("http://localhost:4000", {
  auth: { token: "<JWT_TOKEN>" }
});
```

### Server -> Client Events

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `event:new` | `UnifiedEventObject` | Emitted instantly when a new event passes through the normalization pipeline |
| `event:alert` | `AlertPayload` | High-importance events (importance >= 8.0) |
| `stats:update` | `AnalyticsBrief` | Periodic 10-second pulse update of global activity counters |

### Client -> Server Events

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `subscribe:category` | `{ category: "seismic" }` | Filter WebSocket payload stream to a specific category |
| `unsubscribe:category`| `{ category: "seismic" }` | Remove category filter |
| `ping` | `{ timestamp: number }` | Heartbeat check |
