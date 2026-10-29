import { useMemo, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';

export const RightNowSummary: FC = () => {
  const events = useEventStore((s) => s.events);

  // Compute plain-language statistics
  const stats = useMemo(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return {
      quakes: events.filter((event) => event.source === 'usgs' && Date.parse(event.timestamp) >= oneHourAgo).length,
      significant: events.filter((event) => event.source === 'usgs' && Number(event.metadata?.magnitude) >= 4.5).length,
      mapped: events.length,
      latest: events[0] ? new Date(events[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    };
  }, [events]);

  return (
    <aside
      aria-label="Current Global Summary"
      className="wp-summary"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Right Now
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Planet Earth</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-md:grid-cols-4 max-md:gap-2">
        <Summary value={stats.quakes} label="Earthquakes · 1h" color="#fb923c" />
        <Summary value={stats.significant} label="Magnitude 4.5+" color="#fda4af" />
        <Summary value={stats.mapped} label="Events mapped" color="#67e8f9" />
        <Summary value={stats.latest} label="Latest update" color="#a5b4fc" />
      </div>
    </aside>
  );
};

function Summary({ value, label, color }: { value: number | string; label: string; color: string }) {
  return <div className="min-w-0"><div className="text-xl font-semibold tracking-tight" style={{ color }}>{value}</div><div className="text-[11px] leading-tight text-slate-300">{label}</div></div>;
}
