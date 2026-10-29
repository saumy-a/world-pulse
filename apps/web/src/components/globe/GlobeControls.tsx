import { memo, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Flame, Code2, Rocket, TrendingUp, CloudLightning, Newspaper, Layers } from 'lucide-react';

// Static data moved outside component to avoid recreation on every render
const layerItems = [
  { id: 'natural', label: 'SEISMIC', color: '#ef4444', icon: Flame },
  { id: 'technology', label: 'CYBER/CODE', color: '#00d4ff', icon: Code2 },
  { id: 'space', label: 'AEROSPACE', color: '#f59e0b', icon: Rocket },
  { id: 'finance', label: 'FINANCE', color: '#10b981', icon: TrendingUp },
  { id: 'weather', label: 'METEO', color: '#06b6d4', icon: CloudLightning },
  { id: 'news', label: 'INTEL', color: '#ec4899', icon: Newspaper },
] as const;

export const GlobeControls: FC = memo(() => {
  const activeLayers = useEventStore((s) => s.activeLayers);
  const toggleLayer = useEventStore((s) => s.toggleLayer);

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 select-none"
      style={{
        background: 'rgba(9, 18, 27, 0.88)',
        border: '1px solid rgba(123, 189, 211, 0.28)',
        borderRadius: '8px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 20px rgba(0, 212, 255, 0.08)',
        backdropFilter: 'blur(24px) saturate(1.35)',
      }}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono tracking-widest text-cyan-300/80 border-r"
        style={{ borderColor: 'rgba(123, 189, 211, 0.16)' }}
      >
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline font-bold">LAYERS</span>
      </div>

      <div className="flex items-center gap-1">
        {layerItems.map((item) => {
          const isActive = activeLayers[item.id] !== false;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => toggleLayer(item.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono tracking-wider transition-all cursor-pointer rounded"
              style={{
                border: '1px solid',
                borderColor: isActive ? `${item.color}70` : 'transparent',
                background: isActive ? `${item.color}15` : 'transparent',
                color: isActive ? '#f8fafc' : 'rgba(232, 234, 237, 0.4)',
                boxShadow: isActive ? `0 0 10px ${item.color}25` : 'none',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: isActive ? item.color : '#475569',
                  boxShadow: isActive ? `0 0 6px ${item.color}` : 'none',
                }}
              />
              <Icon className="w-3 h-3" style={{ color: isActive ? item.color : '#64748b' }} />
              <span className="hidden md:inline font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

GlobeControls.displayName = 'GlobeControls';
