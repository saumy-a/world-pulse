const LAYER_ID = 'world-pulse-events';
const BOOKMARKS_KEY = 'world-pulse:event-bookmarks:v1';
const CATEGORIES = [
  'all', 'technology', 'geopolitics', 'natural', 'weather', 'finance', 'space', 'news', 'other',
];

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

/** Mount a compact live feed beside the inherited globe's layer controls. */
export function mountWorldPulseEventsPanel({ dataManager, catalog, viewer }) {
  const layer = catalog?.get?.(LAYER_ID);
  const container = document.getElementById('left-panel-stack');
  if (!layer || !container) return () => {};

  const root = makeElement('section', 'wp-event-panel');
  root.id = 'world-pulse-events-panel';
  root.setAttribute('aria-label', 'World Pulse live events');

  const header = makeElement('header', 'wp-event-panel-header');
  const heading = makeElement('div', 'wp-event-panel-heading');
  heading.append(
    makeElement('strong', '', 'WORLD PULSE'),
    makeElement('span', '', 'LIVE EVENT FEED'),
  );
  const count = makeElement('span', 'wp-event-count', '0');
  count.setAttribute('aria-live', 'polite');
  const toggle = makeElement('button', 'wp-event-toggle', 'LOAD EVENTS');
  toggle.type = 'button';
  toggle.setAttribute('aria-pressed', 'false');
  header.append(heading, count, toggle);

  const filters = makeElement('div', 'wp-event-filters');
  const search = makeElement('input', 'gev-field wp-event-search');
  search.type = 'search';
  search.placeholder = 'Search events';
  search.setAttribute('aria-label', 'Search World Pulse events');
  const category = makeElement('select', 'gev-field wp-event-category');
  category.setAttribute('aria-label', 'Filter by event category');
  for (const value of CATEGORIES) {
    const option = makeElement('option', '', value === 'all' ? 'All categories' : value);
    option.value = value;
    category.append(option);
  }
  const importanceWrap = makeElement('label', 'wp-event-importance');
  const importanceText = makeElement('span', '', 'MIN IMPORTANCE');
  const importance = makeElement('input', '');
  importance.type = 'range';
  importance.min = '0';
  importance.max = '10';
  importance.step = '1';
  importance.value = '0';
  const importanceValue = makeElement('output', '', '0');
  importanceWrap.append(importanceText, importance, importanceValue);
  const savedLabel = makeElement('label', 'wp-event-saved-filter');
  const savedOnly = makeElement('input', '');
  savedOnly.type = 'checkbox';
  savedLabel.append(savedOnly, makeElement('span', '', 'SAVED ONLY'));
  filters.append(search, category, importanceWrap, savedLabel);

  const replay = makeElement('div', 'wp-event-replay');
  const replayTitle = makeElement('label', 'wp-event-replay-label', 'EVENT WINDOW');
  const replayRange = makeElement('select', 'gev-field');
  replayRange.setAttribute('aria-label', 'Event replay time window');
  for (const [value, label] of [['24', '24 HOURS'], ['168', '7 DAYS'], ['720', '30 DAYS']]) {
    const option = makeElement('option', '', label);
    option.value = value;
    replayRange.append(option);
  }
  const replaySlider = makeElement('input', 'wp-event-replay-slider');
  replaySlider.type = 'range';
  replaySlider.min = '0';
  replaySlider.max = '100';
  replaySlider.step = '1';
  replaySlider.value = '100';
  replaySlider.setAttribute('aria-label', 'Replay events through the selected time window');
  const replayTime = makeElement('output', 'wp-event-replay-time', 'LIVE');
  replay.append(replayTitle, replayRange, replaySlider, replayTime);

  const status = makeElement('div', 'wp-event-status', 'Enable the layer to load events.');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const list = makeElement('div', 'wp-event-list');
  list.setAttribute('aria-label', 'Recent World Pulse events');
  const analytics = makeElement('div', 'wp-event-analytics', 'Analytics loading…');
  root.append(header, filters, replay, analytics, status, list);
  container.append(root);

  let savedIds = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    if (Array.isArray(stored)) savedIds = new Set(stored.filter((id) => typeof id === 'string'));
  } catch {
    savedIds = new Set();
  }

  function render() {
    const state = dataManager.getLayerLifecycleState(LAYER_ID);
    const stats = layer.getStats();
    const events = layer.getEvents();
    const isEnabled = state?.enabled === true;
    toggle.textContent = isEnabled ? 'LAYER ON' : 'LOAD EVENTS';
    toggle.setAttribute('aria-pressed', String(isEnabled));
    count.textContent = `${events.length}${stats.total === events.length ? '' : ` / ${stats.total}`}`;
    status.textContent = stats.error
      ? stats.error
      : stats.lastUpdate
        ? stats.replayProgress < 100
          ? `REPLAY · THROUGH ${new Date(Date.now() - stats.rangeHours * (1 - stats.replayProgress / 100) * 60 * 60 * 1000).toLocaleString()}`
          : `Updated ${new Date(stats.lastUpdate).toLocaleTimeString()}`
        : isEnabled
          ? 'Connecting to World Pulse API…'
          : 'Enable the layer to load events.';

    list.replaceChildren();
    if (events.length === 0 && !stats.error && isEnabled) {
      list.append(makeElement('div', 'wp-event-empty', 'No geolocated events match these filters.'));
      return;
    }
    for (const event of events.slice(0, 40)) {
      const row = makeElement('article', 'wp-event-row');
      const button = makeElement('button', 'wp-event-select');
      button.type = 'button';
      button.addEventListener('click', () => layer.focusEvent(event.id));
      const title = makeElement('strong', 'wp-event-title', event.title);
      const detail = makeElement(
        'span',
        'wp-event-detail',
        `${event.source} · ${event.category} · ${event.importance.toFixed(1)}`,
      );
      const time = makeElement('time', 'wp-event-time', new Date(event.timestamp).toLocaleString());
      button.append(title, detail, time);
      const bookmark = makeElement('button', 'wp-event-bookmark', savedIds.has(event.id) ? '★' : '☆');
      bookmark.type = 'button';
      bookmark.setAttribute('aria-label', savedIds.has(event.id) ? 'Remove bookmark' : 'Bookmark event');
      bookmark.setAttribute('aria-pressed', String(savedIds.has(event.id)));
      bookmark.addEventListener('click', () => {
        if (savedIds.has(event.id)) savedIds.delete(event.id);
        else savedIds.add(event.id);
        try {
          localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...savedIds]));
        } catch {
          status.textContent = 'Browser storage is unavailable; bookmark was not saved.';
        }
        applyFilters();
        render();
      });
      row.append(button, bookmark);
      if (event.url) {
        const sourceLink = makeElement('a', 'wp-event-source-link', 'SOURCE');
        sourceLink.href = event.url;
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener noreferrer';
        row.append(sourceLink);
      }
      list.append(row);
    }
  }

  const applyFilters = () => {
    importanceValue.value = importance.value;
    layer.setFilters({
      query: search.value,
      category: category.value,
      minImportance: Number(importance.value),
      savedOnly: savedOnly.checked,
      savedIds,
    });
  };
  search.addEventListener('input', applyFilters);
  category.addEventListener('change', applyFilters);
  importance.addEventListener('input', applyFilters);
  savedOnly.addEventListener('change', applyFilters);
  let replayTimer = null;
  const applyReplay = () => {
    const progress = Number(replaySlider.value);
    layer.setReplay({ hours: Number(replayRange.value), progress });
    replayTime.value = progress === 100
      ? 'LIVE'
      : new Date(Date.now() - Number(replayRange.value) * (1 - progress / 100) * 60 * 60 * 1000).toLocaleString();
    clearTimeout(replayTimer);
    replayTimer = setTimeout(() => {
      if (dataManager.getLayerLifecycleState(LAYER_ID)?.enabled)
        dataManager.refreshLayer(LAYER_ID).catch(() => {});
      else render();
    }, 300);
  };
  replayRange.addEventListener('change', applyReplay);
  replaySlider.addEventListener('input', applyReplay);
  toggle.addEventListener('click', async () => {
    const enabled = dataManager.getLayerLifecycleState(LAYER_ID)?.enabled === true;
    toggle.disabled = true;
    try {
      await dataManager.setEnabled(LAYER_ID, !enabled, { origin: 'user' });
    } finally {
      toggle.disabled = false;
      render();
    }
  });

  const unsubscribeLayer = layer.subscribe(render);
  const unsubscribeManager = dataManager.subscribe(render);
  render();

  let overviewController = null;
  const refreshOverview = async () => {
    overviewController?.abort();
    const controller = new AbortController();
    overviewController = controller;
    try {
      const overview = await layer.getOverview({ signal: controller.signal });
      analytics.textContent = `${overview.totalEvents24h ?? 0} EVENTS / 24H · ${overview.activeCollectors ?? 0} SOURCES · AVG ${Number(overview.averageImportance ?? 0).toFixed(1)}`;
    } catch (error) {
      if (!controller.signal.aborted)
        analytics.textContent = error?.message || 'Analytics unavailable';
    }
  };
  void refreshOverview();
  const overviewTimer = setInterval(refreshOverview, 60_000);

  const cleanup = () => {
    clearTimeout(replayTimer);
    clearInterval(overviewTimer);
    overviewController?.abort();
    unsubscribeLayer();
    unsubscribeManager();
    root.remove();
  };
  window.addEventListener('pagehide', cleanup, { once: true });
  return cleanup;
}
