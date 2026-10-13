import type { EventLocation, WorldEvent } from "@world-pulse/shared-types";

type EventInput = Partial<WorldEvent> & Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asNonEmptyString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const normalizeLocation = (value: unknown): EventLocation | undefined => {
  if (!isRecord(value)) return undefined;

  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);

  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : undefined;
};

/** Converts a partially-known collector payload into the common event shape. */
export function normalizeEvent(input: EventInput): WorldEvent {
  const timestamp = new Date(input.timestamp ?? Date.now());
  const importance = Number(input.importance);
  const tags = Array.isArray(input.tags)
    ? input.tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim()))
    : undefined;

  return {
    id: asNonEmptyString(input.id) ?? crypto.randomUUID(),
    source: asNonEmptyString(input.source) ?? "other",
    sourceEventId: asNonEmptyString(input.sourceEventId),
    type: asNonEmptyString(input.type) ?? "unknown",
    category: asNonEmptyString(input.category) ?? "other",
    title: asNonEmptyString(input.title) ?? "Untitled event",
    description: asNonEmptyString(input.description),
    url: asNonEmptyString(input.url),
    tags,
    country: asNonEmptyString(input.country),
    region: asNonEmptyString(input.region),
    timestamp: Number.isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString(),
    importance: Number.isFinite(importance) ? Math.max(0, Math.min(10, importance)) : 0,
    location: normalizeLocation(input.location),
    metadata: isRecord(input.metadata) ? input.metadata : undefined,
  };
}

/** Returns true only for complete, safely displayable World Pulse events. */
export function validateEvent(value: unknown): value is WorldEvent {
  if (!isRecord(value)) return false;

  const requiredStrings = [value.id, value.source, value.type, value.category, value.title, value.timestamp];
  const importance = value.importance;
  const date = new Date(value.timestamp as string);

  return (
    requiredStrings.every((field) => typeof field === "string" && Boolean(field.trim())) &&
    typeof importance === "number" &&
    Number.isFinite(importance) &&
    importance >= 0 &&
    importance <= 10 &&
    !Number.isNaN(date.getTime()) &&
    (value.location === undefined || normalizeLocation(value.location) !== undefined)
  );
}
