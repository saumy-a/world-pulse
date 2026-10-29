import { useState, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Flame, Code2, Rocket, TrendingUp, CloudLightning, Newspaper, Layers, ChevronDown, ChevronRight } from 'lucide-react';

export const LeftLayerPanel: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeLayers = useEventStore((s) => s.activeLayers);
  const toggleLayer = useEventStore((s) => s.toggleLayer);

  const layerItems = [
    { id: 'natural', label: 'SEISMIC / NATURAL', color: '#ef4444', icon: Flame },
    { id: 'technology', label: 'CYBER / GITHUB', color: '#00d4ff', icon: Code2 },
    { id: 'space', label: 'AEROSPACE / NASA', color: '#f59e0b', icon: Rocket },
    { id: 'finance', label: 'FINANCE / CRYPTO', color: '#10b981', icon: TrendingUp },
    { id: 'weather', label: 'METEO SATELLITE', color: '#06b6d4', icon: CloudLightning },
    { id: 'news', label: 'WIKIMEDIA INTEL', color: '#ec4899', icon: Newspaper },
  ];

  return (
    <div className="gev-panel select-none">
      <div className="gev-panel-header">
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span className="gev-panel-title">DATA LAYERS</span>
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
        <div className="space-y-1.5 pt-1">
          {layerItems.map((layer) => {
            const isActive = activeLayers[layer.id] !== false;
            const Icon = layer.icon;

            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-mono tracking-wider transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900/60 border-cyan-400/30 text-slate-100 shadow-[0_0_12px_rgba(0,212,255,0.06)]'
                    : 'bg-white/[0.02] border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: isActive ? layer.color : '#475569',
                      boxShadow: isActive ? `0 0 6px ${layer.color}` : 'none',
                    }}
                  />
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? layer.color : '#64748b' }} />
                  <span className="font-semibold">{layer.label}</span>
                </div>

                <span
                  className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase"
                  style={{
                    color: isActive ? layer.color : '#64748b',
                    background: isActive ? `${layer.color}15` : 'transparent',
                    border: `1px solid ${isActive ? `${layer.color}40` : 'transparent'}`,
                  }}
                >
                  {isActive ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
