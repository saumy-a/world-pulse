import { Router } from "express";
import { EventModel } from "../models/Event";

const router = Router();

// GET /api/v1/events
router.get("/", async (req, res) => {
  try {
    // Pagination: page starts at 1, limit defaults to 20 and is capped at 100
    const page = Math.max(parseInt(String(req.query.page), 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit), 10) || 20, 1),
      100
    );

    // Filters. Only plain strings are accepted, which blocks query
    // injection such as ?source[$ne]=x
    const filter: Record<string, unknown> = {};

    if (typeof req.query.source === "string") filter.source = req.query.source;
    if (typeof req.query.category === "string") filter.category = req.query.category;
    if (typeof req.query.country === "string") filter.country = req.query.country;

    const timeFilter: Record<string, Date> = {};
    if (typeof req.query.sinceHours === "string") {
      const hours = Number(req.query.sinceHours);
      if (Number.isFinite(hours) && hours > 0) {
        timeFilter.$gte = new Date(Date.now() - Math.min(hours, 24 * 30) * 60 * 60 * 1000);
      }
    }
    if (typeof req.query.before === "string") {
      const before = new Date(req.query.before);
      if (!Number.isNaN(before.getTime())) timeFilter.$lte = before;
    }
    if (Object.keys(timeFilter).length) filter.timestamp = timeFilter;

    if (typeof req.query.q === "string" && req.query.q.trim()) {
      const term = req.query.q.trim().slice(0, 100).replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
      filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { source: { $regex: term, $options: "i" } },
      ];
    }

    if (typeof req.query.minImportance === "string") {
      const min = parseFloat(req.query.minImportance);
      if (!Number.isNaN(min)) filter.importance = { $gte: min };
    }

    // Newest events first, and a total count for the pagination block
    const [events, total] = await Promise.all([
      EventModel.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
.limit(limit)
        .lean(),
      EventModel.countDocuments(filter),
    ]);

    // Reshape each document into the response format from docs/api.md
    const data = events.map((event) => ({
      id: event.eventId,
      source: event.source,
      type: event.type,
      title: event.title,
      description: event.description ?? null,
      url: event.url ?? null,
      category: event.category,
      importance: event.importance,
      timestamp: event.timestamp.toISOString(),
      location: {
        country: event.country ?? null,
        region: event.region ?? null,
        lat: event.location?.latitude ?? null,
        lng: event.location?.longitude ?? null,
      },
      tags: event.tags,
      metadata: event.metadata,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
});

export default router;
