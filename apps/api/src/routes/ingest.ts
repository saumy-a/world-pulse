import { createHash, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { EventModel } from '../models/Event';

const router = Router();
const MAX_BATCH_SIZE = 500;

function matchesIngestKey(candidate: string, expected: string): boolean {
  const candidateHash = createHash('sha256').update(candidate).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(candidateHash, expectedHash) && candidate === expected;
}

function isEvent(value: any): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (
    typeof value.id !== 'string' ||
    !value.id.trim() || value.id.length > 240 ||
    typeof value.source !== 'string' || value.source.length > 80 ||
    typeof value.type !== 'string' || value.type.length > 120 ||
    typeof value.category !== 'string' || value.category.length > 80 ||
    typeof value.title !== 'string' || !value.title.trim() || value.title.length > 500 ||
    typeof value.timestamp !== 'string' || !Number.isFinite(Date.parse(value.timestamp)) ||
    typeof value.importance !== 'number' || !Number.isFinite(value.importance) ||
    value.importance < 0 || value.importance > 10
  ) return false;
  if (value.location == null) return true;
  const { latitude, longitude } = value.location;
  return Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
    Number.isFinite(longitude) && Math.abs(longitude) <= 180;
}

// POST /api/v1/events/ingest — collector-only, bounded idempotent upsert.
router.post('/', async (req, res) => {
  const expected = process.env.WORLD_PULSE_INGEST_KEY;
  const supplied = req.header('x-world-pulse-ingest-key') ?? '';
  if (!expected) {
    res.status(503).json({ success: false, error: 'Event ingestion is not configured' });
    return;
  }
  if (!matchesIngestKey(supplied, expected)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const events = req.body?.events;
  if (!Array.isArray(events) || events.length > MAX_BATCH_SIZE || !events.every(isEvent)) {
    res.status(400).json({ success: false, error: `Expected up to ${MAX_BATCH_SIZE} valid events` });
    return;
  }
  if (events.length === 0) {
    res.json({ success: true, received: 0, upserted: 0, modified: 0 });
    return;
  }

  try {
    const operations = events.map((event: any) => ({
      updateOne: {
        filter: { eventId: event.id },
        update: {
          $set: {
            eventId: event.id,
            source: event.source,
            sourceEventId: event.sourceEventId,
            type: event.type,
            category: event.category,
            title: event.title,
            description: event.description,
            url: event.url,
            tags: Array.isArray(event.tags) ? event.tags.filter((tag: unknown) => typeof tag === 'string').slice(0, 40) : [],
            country: typeof event.country === 'string' ? event.country.slice(0, 100) : undefined,
            region: typeof event.region === 'string' ? event.region.slice(0, 160) : undefined,
            timestamp: new Date(event.timestamp),
            importance: event.importance,
            location: event.location,
            metadata: event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata) ? event.metadata : {},
          },
        },
        upsert: true,
      },
    }));
    const result = await EventModel.bulkWrite(operations, { ordered: false });
    res.json({
      success: true,
      received: events.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error('Failed to ingest events:', error);
    res.status(500).json({ success: false, error: 'Failed to ingest events' });
  }
});

export default router;
