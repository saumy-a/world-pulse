import { useEffect, type FC } from 'react';
import type { WorldEvent } from '../../types';
import { AlertOctagon, Crosshair, X } from 'lucide-react';
import { useEventStore } from '../../store/useEventStore';

interface NotificationToastProps {
  event: WorldEvent | null;
  onDismiss: () => void;
}

export const NotificationToast: FC<NotificationToastProps> = ({ event, onDismiss }) => {
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);

  useEffect(() => {
    if (!event) return;
    const timer = setTimeout(() => onDismiss(), 9000);
    return () => clearTimeout(timer);
  }, [event, onDismiss]);

  if (!event) return null;

  const handleLocate = () => {
    if (event.location) {
      setCameraTarget({ lat: event.location.latitude, lon: event.location.longitude });
    }
    setSelectedEvent(event);
    onDismiss();
  };

  return (
    <div
      className="fixed top-16 right-4 z-50 w-80 select-none animate-slide-top"
      style={{
        background: 'rgba(8,5,14,0.97)',
        border: '1px solid rgba(255,68,102,0.6)',
        backdropFilter: 'blur(24px) saturate(1.3)',
        boxShadow: '0 0 28px rgba(255,68,102,0.2), 0 8px 24px rgba(0,0,0,0.7)',
        clipPath: 'polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px))',
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,68,102,0.8) 30%, rgba(255,68,102,0.5) 70%, transparent)', marginBottom: '12px' }} />

      <div className="px-4 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <AlertOctagon
              className="w-4 h-4 shrink-0"
              style={{ color: 'var(--danger)', filter: 'drop-shadow(0 0 6px rgba(255,68,102,0.6))', animation: 'live-pulse 1s ease-in-out infinite' }}
            />
            <div>
              <span
                className="block text-[9px] font-bold tracking-[2px] uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)', textShadow: '0 0 8px rgba(255,68,102,0.5)' }}
              >
                CRITICAL TELEMETRY
              </span>
              <span
                className="text-[8px] tracking-[1px]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
              >
                IMPORTANCE: <strong style={{ color: 'rgba(255,150,165,0.95)' }}>{event.importance.toFixed(1)} / 10</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex items-center justify-center w-6 h-6 cursor-pointer transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', borderRadius: '2px' }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Title */}
        <p
          className="text-[11px] leading-snug line-clamp-2 mb-1"
          style={{ fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {event.title}
        </p>

        {event.country && (
          <p
            className="text-[9px] mb-3"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '0.5px' }}
          >
            <span style={{ color: 'var(--accent)' }}>⌖</span>{' '}
            {event.region ? `${event.region}, ` : ''}{event.country}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={handleLocate}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 cursor-pointer transition-all"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 700,
              border: '1px solid rgba(255,68,102,0.5)',
              background: 'rgba(255,68,102,0.1)',
              color: 'rgba(255,150,165,0.95)',
            }}
          >
            <Crosshair className="w-3 h-3" />
            INTERCEPT TARGET
          </button>
          <button
            onClick={onDismiss}
            className="py-1.5 px-3 cursor-pointer transition-all"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--text-dim)',
            }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
