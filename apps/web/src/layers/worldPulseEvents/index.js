import * as Cesium from 'cesium';

const CATEGORY_COLORS = Object.freeze({
  technology: '#45d9ff',
  geopolitics: '#ff6b6b',
  natural: '#ffb547',
  weather: '#5de2b5',
  finance: '#c7a6ff',
  space: '#8aa8ff',
  news: '#f3e779',
  other: '#d3e4ee',
});

/** Display geolocated World Pulse records on the existing Cesium globe. */
export function createWorldPulseEventsLayer({ source } = {}) {
  if (typeof source?.getSnapshot !== 'function')
    throw new TypeError('World Pulse events require a snapshot source');

  let viewer = null;
  let dataSource = null;
  let request = null;
  let enabled = false;
  let count = 0;
  let lastUpdate = null;
  let lastError = null;
  let eventRecords = [];
  let rangeHours = 24;
  let replayProgress = 100;
  let filters = { query: '', category: 'all', minImportance: 0, savedOnly: false };
  const listeners = new Set();

  const notify = () => {
    for (const listener of [...listeners]) listener();
  };

  function visibleEvents() {
    const query = filters.query.trim().toLowerCase();
    return eventRecords.filter((event) =>
      (!query || `${event.title} ${event.source} ${event.country}`.toLowerCase().includes(query)) &&
      (filters.category === 'all' || event.category === filters.category) &&
      event.importance >= filters.minImportance &&
      (!filters.savedOnly || filters.savedIds?.has(event.id)),
    );
  }

  function renderEvents() {
    if (!dataSource) return;
    const entities = visibleEvents().map((event) => {
      const baseColor = Cesium.Color.fromCssColorString(
        CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other,
      );
      const size = 7 + Math.round(event.importance * 0.8);
      return new Cesium.Entity({
        id: `world-pulse:${event.id}`,
        name: event.title,
        position: Cesium.Cartesian3.fromDegrees(event.longitude, event.latitude),
        point: {
          pixelSize: size,
          color: baseColor.withAlpha(0.9),
          outlineColor: Cesium.Color.BLACK.withAlpha(0.85),
          outlineWidth: 1.5,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: 0,
        },
        properties: {
          worldPulseEventId: event.id,
          source: event.source,
          category: event.category,
          type: event.type,
          importance: event.importance,
          timestamp: new Date(event.timestamp).toISOString(),
          country: event.country,
          url: event.url,
        },
      });
    });
    dataSource.entities.removeAll();
    for (const entity of entities) dataSource.entities.add(entity);
  }

  return {
    id: 'world-pulse-events',
    name: 'World Pulse Events',
    icon: '✦',
    source: source.label || 'World Pulse API',
    updateInterval: 60_000,

    init(targetViewer) {
      if (viewer) throw new Error('World Pulse event layer is already initialized');
      viewer = targetViewer;
      dataSource = new Cesium.CustomDataSource('world-pulse-events');
      dataSource.show = false;
      viewer.dataSources.add(dataSource);
      count = 0;
      lastUpdate = null;
      lastError = null;
      enabled = false;
    },

    enable() {
      enabled = true;
      if (dataSource) dataSource.show = true;
    },

    disable() {
      request?.abort();
      request = null;
      enabled = false;
      if (dataSource) dataSource.show = false;
    },

    async update() {
      if (!enabled || !dataSource) return false;
      request?.abort();
      const current = new AbortController();
      request = current;
      try {
        const replayBefore = Date.now() - rangeHours * (1 - replayProgress / 100) * 60 * 60 * 1000;
        const events = await source.getSnapshot({
          signal: current.signal,
          sinceHours: rangeHours,
          before: new Date(replayBefore),
        });
        if (current.signal.aborted || request !== current || !enabled) return false;
        eventRecords = events;
        renderEvents();
        count = eventRecords.length;
        lastUpdate = Date.now();
        lastError = null;
        notify();
        return true;
      } catch (error) {
        if (current.signal.aborted || request !== current || !enabled) return false;
        lastError = error?.message || 'World Pulse event request failed';
        console.warn('[Data:WorldPulseEvents] Refresh failed:', lastError);
        notify();
        return false;
      } finally {
        if (request === current) request = null;
      }
    },

    destroy(targetViewer = viewer) {
      request?.abort();
      request = null;
      enabled = false;
      if (dataSource) targetViewer.dataSources.remove(dataSource, true);
      viewer = null;
      dataSource = null;
      count = 0;
      lastUpdate = null;
      lastError = null;
      eventRecords = [];
      notify();
    },

    getStats() {
      return {
        count: visibleEvents().length,
        total: count,
        lastUpdate,
        error: lastError,
        enabled,
        rangeHours,
        replayProgress,
      };
    },

    getEvents() {
      return visibleEvents().slice();
    },

    setFilters(next = {}) {
      filters = {
        query: String(next.query ?? filters.query).slice(0, 120),
        category: String(next.category ?? filters.category),
        minImportance: Math.max(0, Math.min(10, Number(next.minImportance ?? filters.minImportance) || 0)),
        savedOnly: next.savedOnly ?? filters.savedOnly,
        savedIds: next.savedIds instanceof Set ? next.savedIds : filters.savedIds,
      };
      renderEvents();
      notify();
    },

    setReplay({ hours = rangeHours, progress = replayProgress } = {}) {
      rangeHours = Math.max(1, Math.min(24 * 30, Number(hours) || 24));
      replayProgress = Math.max(0, Math.min(100, Number(progress) || 0));
      notify();
    },

    getOverview(options) {
      if (typeof source.getOverview !== 'function')
        throw new Error('World Pulse analytics endpoint is unavailable');
      return source.getOverview(options);
    },

    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    focusEvent(id) {
      const entity = dataSource?.entities.getById(`world-pulse:${id}`);
      if (!entity || !viewer) return false;
      viewer.selectedEntity = entity;
      Promise.resolve(viewer.flyTo(entity, { duration: 1.2 })).catch(() => {});
      return true;
    },
  };
}
