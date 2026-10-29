import type { FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { getEventColor } from '../../utils/geo';
import { BarChart2, X, Activity, Server, ShieldCheck, Zap } from 'lucide-react';

interface StatsDrawerProps {
  onClose: () => void;
}

export const StatsDrawer: FC<StatsDrawerProps> = ({ onClose }) => {
  const events = useEventStore((s) => s.events);

  const sourceCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  let totalImportance = 0;

  events.forEach((e) => {
    sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1;
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    totalImportance += e.importance;
  });

  const avgImportance = events.length > 0 ? (totalImportance / events.length).toFixed(1) : '0.0';

  return (
    <div
      className="absolute top-14 right-0 w-80 max-h-[calc(100vh-4rem)] overflow-y-auto z-30 select-none animate-slide-right"
      style={{
        background: 'rgba(8,11,18,0.95)',
        borderLeft: '1px solid rgba(129,140,248,0.15)',
        borderBottom: '1px solid rgba(129,140,248,0.1)',
        backdropFilter: 'blur(24px) saturate(1.3)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(8,11,18,0.96)', borderBottom: '1px solid rgba(129,140,248,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-7 h-7"
            style={{
              background: 'rgba(129,140,248,0.08)',
              border: '1px solid rgba(129,140,248,0.3)',
              clipPath: 'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))',
            }}
          >
            <BarChart2 className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              STREAM TELEMETRY
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              GLOBAL PULSE METRICS
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', borderRadius: '3px' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <Activity className="w-3 h-3" />, label: 'AVG SEVERITY', value: `${avgImportance}`, unit: '/ 10', color: 'var(--accent)' },
            { icon: <ShieldCheck className="w-3 h-3" />, label: 'STREAM HEALTH', value: '99.8%', unit: 'OK', color: '#00e5a0' },
          ].map(({ icon, label, value, unit, color }) => (
            <div
              key={label}
              className="p-3"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex items-center gap-1.5 mb-2"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '1.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}
              >
                <span style={{ color }}>{icon}</span>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color, lineHeight: 1, textShadow: `0 0 12px ${color}55` }}>
                {value}
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 400, marginLeft: '4px' }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Throughput */}
        <div
          className="flex items-center justify-between p-3"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Throughput Velocity
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--warning)', letterSpacing: '-0.01em' }}>
            ~14.2 <span style={{ fontSize: '8px', fontWeight: 400, color: 'var(--text-dim)' }}>ev/min</span>
          </span>
        </div>

        {/* Source breakdown */}
        <div>
          <h4
            className="flex items-center gap-1.5 mb-3"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase' }}
          >
            <Server className="w-3 h-3" style={{ color: 'var(--accent)' }} />
            EVENTS BY SOURCE
          </h4>
          <div className="space-y-2.5">
            {Object.entries(sourceCounts).map(([source, count]) => {
              const pct = Math.round((count / Math.max(1, events.length)) * 100);
              const color = getEventColor(undefined, source);
              return (
                <div key={source}>
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {source}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color }}>
                      {count} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: color,
                        transition: 'width 600ms ease',
                        borderRadius: '1px',
                        boxShadow: `0 0 4px ${color}80`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <h4
            className="mb-2.5"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase' }}
          >
            INCIDENTS BY CATEGORY
          </h4>
          <div className="space-y-1.5">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const color = getEventColor(cat);
              return (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {cat}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
