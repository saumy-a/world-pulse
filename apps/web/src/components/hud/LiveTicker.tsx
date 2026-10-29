import { useState, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { getEventColor } from '../../utils/geo';
import type { WorldEvent } from '../../types';

export const LiveTicker: FC = () => {
  const events = useEventStore((s) => s.events);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);
  const [isPaused, setIsPaused] = useState(false);

  // Take recent 12 events
  const tickerItems = events.slice(0, 12);

  const handleItemClick = (evt: WorldEvent) => {
    setSelectedEvent(evt);
    if (evt.location) {
      setCameraTarget({
        lat: evt.location.latitude,
        lon: evt.location.longitude,
      });
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins <= 0) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div
      aria-label="Live Event Ticker"
      className="fixed bottom-3 left-4 right-24 z-30 h-10 px-4 rounded-xl bg-[#0c1220]/60 backdrop-blur-xl border border-white/[0.08] shadow-lg flex items-center overflow-hidden transition-all max-md:left-3 max-md:right-3 max-md:bottom-3 max-md:pr-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 pr-4 mr-2 border-r border-white/10 shrink-0 text-[11px] font-semibold text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="tracking-wider uppercase">LATEST</span>
      </div>

      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        <div
          className={`flex items-center gap-8 whitespace-nowrap will-change-transform ${
          isPaused || tickerItems.length < 2 ? '' : 'animate-ticker'
          }`}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
            {tickerItems.length === 0 ? <span className="text-xs text-slate-400">Waiting for the latest USGS earthquake updates…</span> : tickerItems.map((evt, idx) => {
            const color = getEventColor(evt.category, evt.source);
            return (
              <button
                key={evt.id}
                type="button"
                onClick={() => handleItemClick(evt)}
                className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer group"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-slate-200 group-hover:underline">
                  {evt.title}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatRelativeTime(evt.timestamp)}
                </span>
                <span className="text-slate-600 ml-4">•</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
