import { type FC } from 'react';
import { X, ExternalLink, MapPin, Activity } from 'lucide-react';
import { useEventStore } from '../../store/useEventStore';
import { getEventColor } from '../../utils/geo';

export const EventDetailCard: FC = () => {
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const trackedFlightId = useEventStore((s) => s.trackedFlightId);
  const setTrackedFlightId = useEventStore((s) => s.setTrackedFlightId);

  if (!selectedEvent) return null;

  const color = getEventColor(selectedEvent.category, selectedEvent.source);

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins <= 0) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  const handleClose = () => {
    setSelectedEvent(null);
  };

  const mag = selectedEvent.metadata?.magnitude as number | undefined;
  const depth = selectedEvent.metadata?.depthKm as number | undefined;

  return (
    <div
      role="dialog"
      aria-label="Event Details"
      className="fixed top-20 right-4 z-40 w-80 p-5 rounded-2xl bg-[#0c1220]/75 backdrop-blur-2xl border border-white/[0.1] shadow-2xl animate-in slide-in-from-right duration-300 max-md:top-auto max-md:bottom-3 max-md:left-3 max-md:right-3 max-md:w-auto"
      style={{
        boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 25px ${color}20`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">
            {selectedEvent.type || selectedEvent.category}
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close event detail"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white leading-snug mb-2">
        {selectedEvent.title}
      </h3>

      {/* Meta Row (Time & Location) */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mb-3 font-mono">
        <span>{formatRelativeTime(selectedEvent.timestamp)}</span>
        {selectedEvent.country && (
          <span className="flex items-center gap-1 text-slate-300">
            <MapPin className="w-3 h-3 text-slate-500" />
            {selectedEvent.country}
          </span>
        )}
      </div>

      {/* Earthquake Depth & Magnitude if applicable */}
      {mag !== undefined && (
        <div className="flex items-center gap-4 py-2 px-3 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#f97316]" />
            <span className="text-slate-400">Magnitude:</span>
            <span className="font-bold text-white font-mono">{mag.toFixed(1)}</span>
          </div>
          {depth !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Depth:</span>
              <span className="font-bold text-white font-mono">{depth.toFixed(1)} km</span>
            </div>
          )}
        </div>
      )}

      {/* Plain English Explanation */}
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {selectedEvent.description || 'Live global activity detected and mapped in real time.'}
      </p>

      {/* Action Footer */}
      {selectedEvent.source === 'flight' && (
        <button
          type="button"
          aria-pressed={trackedFlightId === selectedEvent.id}
          onClick={() => setTrackedFlightId(trackedFlightId === selectedEvent.id ? null : selectedEvent.id)}
          className="mb-3 w-full rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-medium text-sky-100 hover:bg-sky-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
        >{trackedFlightId === selectedEvent.id ? 'Stop following aircraft' : 'Follow this aircraft'}</button>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        {selectedEvent.url ? (
          <a
            href={selectedEvent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            <span>View source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">USGS Live Sensor</span>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          Close view
        </button>
      </div>
    </div>
  );
};
