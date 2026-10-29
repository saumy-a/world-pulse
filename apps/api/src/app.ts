import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import eventsRouter from "./routes/events";

const app = express();

// Security headers
app.use(helmet());

// Allow the frontend to call this API
app.use(cors());

// Read JSON sent in request bodies
app.use(express.json());

// Log every request in the terminal
app.use(morgan("dev"));

// Health check: proves the server is alive
app.get("/api/v1/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "world-pulse-api",
        timestamp: new Date().toISOString(),
    });
});

// Short health check, as listed in issue #4
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Events API
app.use("/api/v1/events", eventsRouter);

export default app;