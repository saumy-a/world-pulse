import { useEffect, useState } from 'react';
import { useEventStore } from './store/useEventStore';
import { GlobeCanvas } from './components/globe/GlobeCanvas';
import { CalmTopBar } from './components/hud/CalmTopBar';
import { RightNowSummary } from './components/hud/RightNowSummary';
import { LiveTicker } from './components/hud/LiveTicker';
import { CornerControls } from './components/hud/CornerControls';
import { EventDetailCard } from './components/hud/EventDetailCard';
import { fetchLiveEarthquakes } from './services/usgsAdapter';
import { fetchNearbyFlights } from './services/flightAdapter';

export function App() {
  const addEvents = useEventStore((s) => s.addEvents);
  const flightsEnabled = useEventStore((s) => s.activeLayers.flights ?? false);
  const [introVisible, setIntroVisible] = useState(() => !localStorage.getItem('world-pulse-intro-seen'));
  const [hintVisible, setHintVisible] = useState(() => !localStorage.getItem('world-pulse-hint-seen'));

  // Initialize event stream and poll live USGS earthquakes
  useEffect(() => {
    // Show only records received from the live USGS feed.
    let isMounted = true;
    const controller = new AbortController();
    const loadLiveEarthquakes = async () => {
      try {
        const liveQuakes = await fetchLiveEarthquakes(controller.signal);
        if (isMounted && liveQuakes.length > 0) {
          addEvents(liveQuakes);
        }
      } catch (err) {
        console.warn('[World Pulse] Earthquake telemetry sync notice:', err);
      }
    };

    loadLiveEarthquakes();

    // Refresh the live feed every 60 seconds.
    const interval = setInterval(loadLiveEarthquakes, 60000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [addEvents]);

  useEffect(() => {
    const store = useEventStore.getState();
    if (!flightsEnabled) {
      useEventStore.setState({ events: store.events.filter((event) => event.source !== 'flight') });
      store.setTrackedFlightId(null);
      return;
    }
    let active = true;
    let timer = 0;
    let controller: AbortController | null = null;
    const refresh = async () => {
      controller = new AbortController();
      try {
        const flights = await fetchNearbyFlights(39, -98, controller.signal);
        if (active) {
          useEventStore.setState((state) => ({
            events: [...state.events.filter((event) => event.source !== 'flight'), ...flights]
              .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
              .slice(0, 300),
          }));
        }
      } catch (error) {
        if (active && !controller.signal.aborted) console.warn('[World Pulse] Flight feed unavailable:', error);
      } finally {
        if (active) timer = window.setTimeout(refresh, 25000);
      }
    };
    void refresh();
    return () => { active = false; window.clearTimeout(timer); controller?.abort(); };
  }, [flightsEnabled]);

  useEffect(() => {
    if (!introVisible) return;
    const timer = window.setTimeout(() => {
      setIntroVisible(false);
      localStorage.setItem('world-pulse-intro-seen', '1');
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [introVisible]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#070a12] font-sans antialiased">
      {/* 1. Photorealistic 3D Earth Globe Canvas (Hero Centerpiece) */}
      <div className="absolute inset-0 z-0">
        <GlobeCanvas />
      </div>

      {/* 2. Slim Top Navigation Bar with Category Chips */}
      <CalmTopBar />

      {/* 3. Left "Right Now" Plain-Language Summary Glass Card */}
      <RightNowSummary />

      {/* 4. Event Detail Card (Right-side slide-in when an event is selected) */}
      <EventDetailCard />

      {/* 5. Live Scrolling Event Ticker at Bottom */}
      <LiveTicker />

      {/* 6. Corner Navigation Controls (Zoom in/out, Reset View) */}
      <CornerControls />
      {hintVisible && !introVisible && (
        <button
          className="wp-explore-hint"
          onClick={() => { setHintVisible(false); localStorage.setItem('world-pulse-hint-seen', '1'); }}
        >Click any pulse to explore · dismiss</button>
      )}
      {introVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a12] transition-opacity duration-700" role="status">
          <div className="text-center">
            <div className="mx-auto mb-5 h-24 w-24 animate-pulse rounded-full border border-sky-300/40 bg-sky-400/10 shadow-[0_0_80px_rgba(56,189,248,.28)]" />
            <p className="text-sm tracking-wide text-slate-200">The world, in motion.</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
