import { type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Bookmark, X, Download, Trash2, Crosshair, FileJson, FileSpreadsheet, MapPin } from 'lucide-react';
import { Badge } from '../common/Badge';
import { getEventColor } from '../../utils/geo';
import type { WorldEvent } from '../../types';

interface BookmarksModalProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
}

export const BookmarksModal: FC<BookmarksModalProps> = ({
  bookmarkedIds,
  onToggleBookmark,
  onClose,
}) => {
  const events = useEventStore((s) => s.events);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);

  const bookmarkedEvents = events.filter((e) => bookmarkedIds.includes(e.id));

  // Export as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarkedEvents, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `world-pulse-incidents-${Date.now()}.json`;
    a.click();
  };

  // Export as GeoJSON FeatureCollection
  const handleExportGeoJson = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: bookmarkedEvents.map((e) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: e.location ? [e.location.longitude, e.location.latitude] : [0, 0],
        },
        properties: {
          id: e.id,
          source: e.source,
          category: e.category,
          title: e.title,
          importance: e.importance,
          timestamp: e.timestamp,
          country: e.country,
          region: e.region,
        },
      })),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJson, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `world-pulse-features-${Date.now()}.geojson`;
    a.click();
  };

  // Export as CSV
  const handleExportCsv = () => {
    const headers = ['id', 'timestamp', 'source', 'category', 'importance', 'title', 'country', 'region', 'latitude', 'longitude'];
    const rows = bookmarkedEvents.map((e) => [
      e.id,
      e.timestamp,
      e.source,
      e.category,
      e.importance,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.country || ''}"`,
      `"${e.region || ''}"`,
      e.location?.latitude || '',
      e.location?.longitude || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `world-pulse-dataset-${Date.now()}.csv`;
    a.click();
  };

  const handleLocate = (evt: WorldEvent) => {
    if (evt.location) {
      setCameraTarget({ lat: evt.location.latitude, lon: evt.location.longitude });
    }
    setSelectedEvent(evt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950/95 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40">
              <Bookmark className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-widest text-slate-100 uppercase">
                SAVED DOSSIERS & EXPORT SUITE
              </h2>
              <span className="text-[10px] font-mono text-cyan-400/80">
                {bookmarkedEvents.length} INCIDENTS BOOKMARKED
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Action Bar */}
        {bookmarkedEvents.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>EXPORT DOSSIER DATA:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={handleExportGeoJson}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>GeoJSON</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* List of Bookmarked Incidents */}
        <div className="mt-4 space-y-2.5">
          {bookmarkedEvents.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl font-mono">
              <Bookmark className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs text-slate-400">No incidents bookmarked yet.</p>
              <p className="text-[10px] text-slate-600 mt-1">
                Click the bookmark star icon on any incident card to save it to this dossier.
              </p>
            </div>
          ) : (
            bookmarkedEvents.map((evt) => {
              const color = getEventColor(evt.category, evt.source);

              return (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-3"
                  style={{
                    borderLeftWidth: '3px',
                    borderLeftColor: color,
                  }}
                >
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge label={evt.source} source={evt.source} />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {evt.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        ★ {evt.importance.toFixed(1)}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 truncate">
                      {evt.title}
                    </h4>

                    {evt.country && (
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        📍 {evt.region ? `${evt.region}, ` : ''}{evt.country}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-1">
                    <button
                      onClick={() => handleLocate(evt)}
                      title="Focus on 3D globe"
                      className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 transition-all cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleBookmark(evt.id)}
                      title="Remove from bookmarks"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
