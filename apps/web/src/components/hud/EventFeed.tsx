import { useState, useMemo, memo, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Radio, Crosshair, AlertTriangle, Bookmark, ChevronDown, ChevronRight } from 'lucide-react';
import { getEventColor } from '../../utils/geo';
import type { WorldEvent } from '../../types';

interface EventFeedProps {
  onSelectEvent: (event: WorldEvent) => void;
  bookmarkedIds?: string[];
  onToggleBookmark?: (id: string) => void;
}

export const EventFeed: FC<EventFeedProps> = memo(({
  onSelectEvent,
  bookmarkedIds = [],
  onToggleBookmark,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const events = useEventStore((s) => s.events);
  const filters = useEventStore((s) => s.filters);
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (filters.minImportance > 0 && evt.importance < filters.minImportance) return false;
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(evt.category)) return false;
      if (filters.selectedSources.length > 0 && !filters.selectedSources.includes(evt.source)) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchCountry = evt.country?.toLowerCase().includes(q) ?? false;
        const matchSource = evt.source.toLowerCase().includes(q);
        if (!matchTitle && !matchCountry && !matchSource) return false;
      }
      return true;
    });
  }, [events, filters]);

  const formatRelativeTime = (timestamp: string) => {
    const diffSec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    return `${Math.floor(diffMin / 60)}h`;
  };

  const handleLocate = (e: React.MouseEvent, evt: WorldEvent) => {
    e.stopPropagation();
    if (evt.location) {
      setCameraTarget({ lat: evt.location.latitude, lon: evt.location.longitude });
    }
    onSelectEvent(evt);
  };

  return (
    <div className="gev-panel select-none flex flex-col max-h-[380px]">
      <div className="gev-panel-header">
        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="gev-panel-title">INCIDENT RADAR</span>
        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 font-bold">
          {filteredEvents.length}
        </span>
        <div className="gev-panel-divider" />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="gev-panel-btn"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredEvents.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-white/5 rounded-xl">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-slate-600" />
              <p className="text-[9px] font-mono text-slate-500 uppercase">NO INCIDENTS MATCH</p>
            </div>
          ) : (
            filteredEvents.slice(0, 15).map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const color = getEventColor(evt.category, evt.source);
              const isCritical = evt.importance >= 7.5;

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-slate-900/80 border-cyan-400/50 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                  style={{
                    borderLeftWidth: '3px',
                    borderLeftColor: color,
                  }}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase"
                        style={{ color, background: `${color}15`, border: `1px solid ${color}40` }}
                      >
                        {evt.source}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 uppercase">
                        {evt.category}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                  </div>

                  <p className="text-[10px] font-semibold text-slate-200 line-clamp-1 leading-snug">
                    {evt.title}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-mono text-slate-500">LVL</span>
                      <span className="text-[9px] font-mono font-bold" style={{ color }}>
                        {evt.importance.toFixed(1)}
                      </span>
                      {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-1" />}
                    </div>

                    <div className="flex items-center gap-1">
                      {onToggleBookmark && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(evt.id);
                          }}
                          className={`p-1 rounded border text-[9px] transition-all cursor-pointer ${
                            bookmarkedIds.includes(evt.id)
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-white/5 border-white/5 text-slate-500 hover:text-amber-300'
                          }`}
                        >
                          <Bookmark className={`w-2.5 h-2.5 ${bookmarkedIds.includes(evt.id) ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      {evt.location && (
                        <button
                          onClick={(e) => handleLocate(e, evt)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono bg-cyan-950/40 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 transition-all cursor-pointer"
                        >
                          <Crosshair className="w-2.5 h-2.5 text-cyan-400" />
                          <span>LOCATE</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

EventFeed.displayName = 'EventFeed';
