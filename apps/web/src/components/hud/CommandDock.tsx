import { useState, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Sparkles, MapPin } from 'lucide-react';

export const CommandDock: FC<{ onOpenAiBriefing: () => void }> = ({ onOpenAiBriefing }) => {
  const [activeStyle, setActiveStyle] = useState('normal');
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);
  const setSearchQuery = useEventStore((s) => s.setSearchQuery);

  const presets = [
    { id: 'normal', label: 'NORMAL', icon: '◯', key: '1' },
    { id: 'crt', label: 'CRT', icon: '▦', key: '2' },
    { id: 'nvg', label: 'NVG', icon: '🌙', key: '3' },
    { id: 'flir', label: 'FLIR', icon: '🌡️', key: '4' },
    { id: 'anime', label: 'ANIME', icon: '✦', key: '5' },
    { id: 'noir', label: 'NOIR', icon: '◐', key: '6' },
  ];

  const quickCities = [
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', lat: 40.7128, lon: -74.006 },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  ];

  return (
    <div className="bottom-command-dock" role="toolbar" aria-label="Command Dock">
      {/* ── Left Section: Quick Locations / Cities ── */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 text-[8px] font-mono tracking-widest text-slate-400 uppercase shrink-0">
          <MapPin className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">LOCATIONS</span>
        </div>
        <div className="flex items-center gap-1.5">
          {quickCities.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                setCameraTarget({ lat: city.lat, lon: city.lon });
                setSearchQuery(city.name);
              }}
              className="px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider border border-white/10 bg-white/5 hover:border-cyan-400/40 hover:text-cyan-300 text-slate-300 transition-all cursor-pointer whitespace-nowrap"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Center Section: Voice / AI Intelligence Pill ── */}
      <div className="dock-voice-pill shrink-0">
        <button
          onClick={onOpenAiBriefing}
          className="dock-voice-btn"
          title="Open AI Neural Intelligence Briefing"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>AI INTEL</span>
        </button>
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest">
            VOICE & CLUSTERS
          </span>
          <span className="text-[7px] font-mono text-slate-400">
            NEURAL RECON
          </span>
        </div>
      </div>

      {/* ── Right Section: Visual Presets Grid ── */}
      <div className="flex items-center gap-2 pl-3 border-l border-white/10 overflow-x-auto scrollbar-none">
        <span className="hidden xl:inline text-[8px] font-mono tracking-widest text-slate-400 uppercase shrink-0">
          PRESETS
        </span>
        <div className="style-btn-grid">
          {presets.map((p) => {
            const isActive = activeStyle === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveStyle(p.id)}
                className={`dock-preset-btn ${isActive ? 'active' : ''}`}
                title={`Visual Preset: ${p.label}`}
              >
                <span className="btn-icon">{p.icon}</span>
                <span className="btn-label">{p.label}</span>
                <span className="btn-key">{p.key}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
