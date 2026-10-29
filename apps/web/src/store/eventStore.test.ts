import { describe, it, expect, beforeEach } from 'vitest';
import { useEventStore } from './useEventStore';
import { EventCategory, EventSource, type WorldEvent } from '../types';

describe('useEventStore state management', () => {
  beforeEach(() => {
    // Reset filters and settings
    useEventStore.getState().resetFilters();
    useEventStore.getState().setViewMode('3d');
  });

  it('initializes with default mock events and 3D view mode', () => {
    const state = useEventStore.getState();
    expect(state.events.length).toBeGreaterThan(0);
    expect(state.viewMode).toBe('3d');
    expect(state.isSimulatorActive).toBe(true);
  });

  it('switches viewMode between 3d and 2d correctly', () => {
    const store = useEventStore.getState();
    expect(store.viewMode).toBe('3d');

    store.setViewMode('2d');
    expect(useEventStore.getState().viewMode).toBe('2d');

    store.setViewMode('3d');
    expect(useEventStore.getState().viewMode).toBe('3d');
  });

  it('appends unique events and ignores duplicate event IDs', () => {
    const initialCount = useEventStore.getState().events.length;
    const testEvt: WorldEvent = {
      id: 'test-evt-unique-1234',
      type: 'test_event',
      title: 'Global Quantum Grid Test Anomaly',
      category: EventCategory.Technology,
      source: EventSource.GitHub,
      timestamp: new Date().toISOString(),
      importance: 8.5,
      location: { latitude: 37.77, longitude: -122.41 },
      country: 'United States',
    };

    useEventStore.getState().addEvent(testEvt);
    expect(useEventStore.getState().events.length).toBe(initialCount + 1);

    // Re-adding same event ID should be ignored
    useEventStore.getState().addEvent(testEvt);
    expect(useEventStore.getState().events.length).toBe(initialCount + 1);
  });

  it('toggles filters correctly', () => {
    const store = useEventStore.getState();
    store.setMinImportance(6.0);
    expect(useEventStore.getState().filters.minImportance).toBe(6.0);

    store.toggleCategory(EventCategory.Natural);
    expect(useEventStore.getState().filters.selectedCategories).toContain(EventCategory.Natural);

    store.toggleCategory(EventCategory.Natural);
    expect(useEventStore.getState().filters.selectedCategories).not.toContain(EventCategory.Natural);

    store.resetFilters();
    expect(useEventStore.getState().filters.minImportance).toBe(0);
    expect(useEventStore.getState().filters.selectedCategories).toHaveLength(0);
  });

  it('sets camera targets for automatic globe centering', () => {
    const targetCoords = { lat: 35.6762, lon: 139.6503 }; // Tokyo
    useEventStore.getState().setCameraTarget(targetCoords);

    expect(useEventStore.getState().cameraTarget).toEqual(targetCoords);
  });
});
