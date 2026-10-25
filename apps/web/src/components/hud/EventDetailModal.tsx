import type { FC } from 'react';
import type { WorldEvent } from '../../types';
import { useEventStore } from '../../store/useEventStore';
import { getEventColor } from '../../utils/geo';
import { X, ExternalLink, Crosshair, MapPin, Calendar, Cpu, Bookmark } from 'lucide-react';

interface EventDetailModalProps {
  event: WorldEvent | null;
  onClose: () => void;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export const EventDetailModal: FC<EventDetailModalProps> = ({
  event,
  onClose,
  bookmarked = false,
  onToggleBookmark,
}) => {
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);

  if (!event) return null;

  const color = getEventColor(event.category, event.source);

  const handleLocate = () => {
    if (event.location) {
      setCameraTarget({ lat: event.location.latitude, lon: event.location.longitude });
    }
  };

  return (
    <div
      className="absolute bottom-4 right-4 w-[360px] max-h-[82vh] overflow-y-auto z-40 select-none animate-fade-up"
      style={{
        background: 'rgba(8,11,18,0.97)',
        border: '1px solid rgba(0,212,255,0.3)',
        backdropFilter: 'blur(28px) saturate(1.4)',
        boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 18px rgba(0,212,255,0.08)',
        clipPath: 'polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))',
      }}
    >
      {/* Corner accent line at top */}
      <div style={{ height: '2px', background: `linear-gradient(90deg, ${color}88, ${color}44 50%, transparent)` }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent)', boxShadow: '0 0 4px var(--accent)', animation: 'live-pulse 2s ease-in-out infinite' }}
              />
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', fontWeight: 700, letterSpacing: '2px', color: 'var(--accent)', textTransform: 'uppercase' }}
              >
                TARGET LOCK // {event.id.slice(-8)}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2 py-0.5 text-[8px] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-mono)', color, border: `1px solid ${color}50`, background: `${color}10` }}
              >
                {event.source}
              </span>
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}
              >
                {event.category}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 cursor-pointer transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', borderRadius: '2px' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Severity */}
        <div
          className="p-3 mb-3 flex items-center justify-between"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
              INCIDENT SEVERITY
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color, textShadow: `0 0 10px ${color}55` }}>
              LEVEL {event.importance.toFixed(1)} / 10.0
            </span>
          </div>
          <div className="w-20 h-[3px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '1px' }}>
            <div
              style={{
                width: `${(event.importance / 10) * 100}%`,
                height: '100%',
                background: color,
                borderRadius: '1px',
                boxShadow: `0 0 6px ${color}`,
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h3
          className="mb-2 leading-snug"
          style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p
            className="text-[11px] mb-3 leading-relaxed p-3"
            style={{
              color: 'rgba(232,237,245,0.65)',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.05)',
              lineHeight: 1.6,
            }}
          >
            {event.description}
          </p>
        )}

        {/* Geographic info */}
        <div
          className="p-3 mb-3 space-y-2"
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,212,255,0.12)',
          }}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {event.region ? `${event.region}, ` : ''}{event.country || 'Global Coordinates'}
            </span>
          </div>

          {event.location && (
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent)', letterSpacing: '0.5px' }}>
                LAT: {event.location.latitude.toFixed(4)}° LON: {event.location.longitude.toFixed(4)}°
              </span>
              <button
                onClick={handleLocate}
                className="flex items-center gap-1 cursor-pointer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--accent)', letterSpacing: '1px', background: 'none', border: 'none', textTransform: 'uppercase' }}
              >
                <Crosshair className="w-2.5 h-2.5" />
                CENTER
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Calendar className="w-3 h-3 shrink-0" style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
              {new Date(event.timestamp).toUTCString()}
            </span>
          </div>
        </div>

        {/* Metadata */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mb-3">
            <h4
              className="flex items-center gap-1.5 mb-2"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase' }}
            >
              <Cpu className="w-2.5 h-2.5" style={{ color: 'var(--accent)' }} />
              PAYLOAD TELEMETRY
            </h4>
            <div
              className="divide-y p-0"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 0, ['--tw-divide-opacity' as string]: 1 }}
            >
              {Object.entries(event.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{key}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, color: 'var(--accent)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          className="flex items-center gap-2 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              title={bookmarked ? 'Remove from Dossier' : 'Save to Dossier'}
              className="p-2 cursor-pointer transition-all"
              style={{
                border: '1px solid',
                borderColor: bookmarked ? 'rgba(255,184,0,0.5)' : 'rgba(255,255,255,0.08)',
                background: bookmarked ? 'rgba(255,184,0,0.1)' : 'rgba(255,255,255,0.03)',
                color: bookmarked ? 'var(--warning)' : 'var(--text-dim)',
                borderRadius: '2px',
              }}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

          {event.location && (
            <button
              onClick={handleLocate}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 cursor-pointer transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                letterSpacing: '1.5px',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: '1px solid rgba(0,212,255,0.45)',
                background: 'rgba(0,212,255,0.1)',
                color: 'var(--accent)',
                boxShadow: '0 0 12px rgba(0,212,255,0.12)',
              }}
            >
              <Crosshair className="w-3.5 h-3.5" />
              LOCATE GLOBE
            </button>
          )}

          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 transition-all no-underline"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-secondary)',
              }}
            >
              SOURCE
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
