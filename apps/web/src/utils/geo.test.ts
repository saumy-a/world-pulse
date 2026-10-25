import { describe, it, expect } from 'vitest';
import { latLongToVector3, getEventColor, CATEGORY_COLORS, SOURCE_COLORS } from './geo';
import { EventCategory, EventSource } from '../types';

describe('geo telemetry calculations', () => {
  it('converts Equator / Prime Meridian (0°, 0°) to Cartesian coordinates correctly', () => {
    const radius = 5.0;
    const { x, y, z } = latLongToVector3(0, 0, radius);

    expect(y).toBeCloseTo(0, 5); // Equator has y = 0
    expect(x).toBeCloseTo(5, 5);  // Along prime meridian axis
    expect(z).toBeCloseTo(0, 5);
  });

  it('converts North Pole (90°, 0°) to Cartesian coordinates correctly', () => {
    const radius = 5.0;
    const { x, y, z } = latLongToVector3(90, 0, radius);

    expect(y).toBeCloseTo(5, 5); // North pole has y = +radius
    expect(x).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it('converts South Pole (-90°, 0°) to Cartesian coordinates correctly', () => {
    const radius = 5.0;
    const { x, y, z } = latLongToVector3(-90, 0, radius);

    expect(y).toBeCloseTo(-5, 5); // South pole has y = -radius
    expect(x).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it('clamps out-of-range latitudes safely between -90 and 90', () => {
    const radius = 5.0;
    const clampedNorth = latLongToVector3(120, 0, radius);
    const standardNorth = latLongToVector3(90, 0, radius);

    expect(clampedNorth.y).toBeCloseTo(standardNorth.y, 5);
  });

  it('assigns correct visual category and source colors', () => {
    expect(getEventColor(EventCategory.Natural)).toBe(CATEGORY_COLORS[EventCategory.Natural]);
    expect(getEventColor(undefined, EventSource.NASA)).toBe(SOURCE_COLORS[EventSource.NASA]);
    expect(getEventColor()).toBe('#38bdf8'); // Fallback cyan
  });
});
