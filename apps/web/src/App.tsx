import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useEventStore } from './store/useEventStore';
import { GlobeCanvas } from './components/globe/GlobeCanvas';
import { FlatMapCanvas } from './components/map/FlatMapCanvas';
import { TopNav } from './components/hud/TopNav';
import { LeftLayerPanel } from './components/hud/LeftLayerPanel';
import { EventFeed } from './components/hud/EventFeed';
import { CommandDock } from './components/hud/CommandDock';
import { EventDetailModal } from './components/hud/EventDetailModal';
import { NotificationToast } from './components/notifications/NotificationToast';
import { generateRandomEvent } from './services/mockEvents';
import { initSocketConnection, disconnectSocket } from './services/socket';
import type { WorldEvent } from './types';

// Lazy-load heavy modals that are rarely shown (only rendered when toggled open)
const FilterBar = lazy(() => import('./components/hud/FilterBar').then(m => ({ default: m.FilterBar })));
const StatsDrawer = lazy(() => import('./components/hud/StatsDrawer').then(m => ({ default: m.StatsDrawer })));
const TimelineReplay = lazy(() => import('./components/hud/TimelineReplay').then(m => ({ default: m.TimelineReplay })));
const AiIntelligenceBriefing = lazy(() => import('./components/ai/AiIntelligenceBriefing').then(m => ({ default: m.AiIntelligenceBriefing })));
const AnalyticsModal = lazy(() => import('./components/analytics/AnalyticsModal').then(m => ({ default: m.AnalyticsModal })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));
const BookmarksModal = lazy(() => import('./components/bookmarks/BookmarksModal').then(m => ({ default: m.BookmarksModal })));
const AdminDashboardModal = lazy(() => import('./components/admin/AdminDashboardModal').then(m => ({ default: m.AdminDashboardModal })));

const STORAGE_BOOKMARKS = 'worldpulse_bookmarks';

export function App() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeToastEvent, setActiveToastEvent] = useState<WorldEvent | null>(null);

  // Load persistent bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_BOOKMARKS);
      return saved ? JSON.parse(saved) : ['evt-usgs-1', 'evt-gh-1'];
    } catch {
      return [];
    }
  });

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const isSimulatorActive = useEventStore((s) => s.isSimulatorActive);
  const addEvent = useEventStore((s) => s.addEvent);
  const viewMode = useEventStore((s) => s.viewMode);

  // 1. Initialize real-time Socket.IO connection
  useEffect(() => {
    initSocketConnection();
    return () => disconnectSocket();
  }, []);

  // 2. Real-time Ingestion Simulator Loop
  useEffect(() => {
    if (!isSimulatorActive) return;

    const interval = setInterval(() => {
      const nextEvt = generateRandomEvent();
      addEvent(nextEvt);

      if (nextEvt.importance >= 7.5) {
        setActiveToastEvent(nextEvt);
      }
    }, 6500);

    return () => clearInterval(interval);
  }, [isSimulatorActive, addEvent]);

  return (
    <div
      className="w-screen h-screen relative overflow-hidden"
      style={{
        background: 'var(--bg-dark)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── 1. Full-Screen Earth Globe / 2D Map Canvas (Background Viewport) ── */}
      <div className="absolute inset-0 z-0">
        {viewMode === '3d' ? <GlobeCanvas /> : <FlatMapCanvas />}
      </div>

      {/* ── 2. Top-Bar System: Title (Left) + Actions (Center) + Style Indicator (Right) ── */}
      <TopNav
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => {
          setIsFiltersOpen(!isFiltersOpen);
          setIsStatsOpen(false);
          setIsAiOpen(false);
        }}
        isStatsOpen={isStatsOpen}
        onToggleStats={() => {
          setIsStatsOpen(!isStatsOpen);
          setIsFiltersOpen(false);
          setIsAiOpen(false);
        }}
        isReplayOpen={isReplayOpen}
        onToggleReplay={() => setIsReplayOpen(!isReplayOpen)}
        isAiOpen={isAiOpen}
        onToggleAi={() => {
          setIsAiOpen(!isAiOpen);
          setIsFiltersOpen(false);
          setIsStatsOpen(false);
        }}
        onToggleAnalyticsModal={() => setIsAnalyticsModalOpen(true)}
        onToggleAuthModal={() => setIsAuthOpen(true)}
        onToggleBookmarksModal={() => setIsBookmarksOpen(true)}
        onToggleAdminModal={() => setIsAdminOpen(true)}
        isAdminOpen={isAdminOpen}
        bookmarkCount={bookmarkedIds.length}
      />

      {/* ── 3. Left Panel Stack: Data Layers + Incident Radar ── */}
      <div className="left-rail-stack">
        <LeftLayerPanel />
        <EventFeed
          onSelectEvent={(evt) => setSelectedEvent(evt)}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={toggleBookmark}
        />
      </div>

      {/* ── 4. Unified Bottom Command Dock (Locations | AI Intel | Visual Presets) ── */}
      <CommandDock onOpenAiBriefing={() => setIsAiOpen(true)} />

      {/* ── 5. Flyout Modals & Drawers (Lazy-loaded for performance) ── */}
      <Suspense fallback={null}>
        {/* Filter Drawer */}
        {isFiltersOpen && <FilterBar onClose={() => setIsFiltersOpen(false)} />}

        {/* Analytics Drawer */}
        {isStatsOpen && <StatsDrawer onClose={() => setIsStatsOpen(false)} />}

        {/* AI Intelligence Briefing Drawer */}
        {isAiOpen && <AiIntelligenceBriefing onClose={() => setIsAiOpen(false)} />}

        {/* Historical Timeline Replay */}
        {isReplayOpen && <TimelineReplay onClose={() => setIsReplayOpen(false)} />}

        {/* Collector Health & System Console Modal */}
        {isAnalyticsModalOpen && (
          <AnalyticsModal onClose={() => setIsAnalyticsModalOpen(false)} />
        )}

        {/* Auth Gateway / Profile Modal */}
        {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}

        {/* Bookmarks & Export Suite Modal */}
        {isBookmarksOpen && (
          <BookmarksModal
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onClose={() => setIsBookmarksOpen(false)}
          />
        )}

        {/* Dedicated Admin Command & Control Modal */}
        {isAdminOpen && <AdminDashboardModal onClose={() => setIsAdminOpen(false)} />}
      </Suspense>

      {/* Real-time High-Severity Notification Toast */}
      <NotificationToast
        event={activeToastEvent}
        onDismiss={() => setActiveToastEvent(null)}
      />

      {/* Event Detail Inspector Drawer */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        bookmarked={selectedEvent ? bookmarkedIds.includes(selectedEvent.id) : false}
        onToggleBookmark={selectedEvent ? () => toggleBookmark(selectedEvent.id) : undefined}
      />
    </div>
  );
}

export default App;
