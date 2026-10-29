import { useState, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Sparkles, MapPin, Activity, Github, Globe2, Flame, TrendingUp } from 'lucide-react';

interface CommandDockProps {
  onOpenAiBriefing: () => void;
  onOpenChannel?: (channel: 'github' | 'wikimedia' | 'earthquake_weather' | 'crypto') => void;
}

export const CommandDock: FC<CommandDockProps> = ({ onOpenAiBriefing, onOpenChannel }) => {
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

      {/* ── Center Section: Channels + AI Intelligence Pill ── */}
      <div className="flex items-center gap-2">
        {onOpenChannel && (
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onOpenChannel('github')}
              title="Open GitHub Activity Stream"
              className="px-2 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Github className="w-3 h-3" />
              <span>GITHUB</span>
            </button>
            <button
              onClick={() => onOpenChannel('wikimedia')}
              title="Open Wikimedia Edit Stream"
              className="px-2 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Globe2 className="w-3 h-3" />
              <span>WIKI</span>
            </button>
            <button
              onClick={() => onOpenChannel('earthquake_weather')}
              title="Open USGS Seismic & Weather Alerts"
              className="px-2 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Flame className="w-3 h-3" />
              <span>SEISMIC</span>
            </button>
            <button
              onClick={() => onOpenChannel('crypto')}
              title="Open Crypto & Financial Sentinel"
              className="px-2 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3 h-3" />
              <span>CRYPTO</span>
            </button>
          </div>
        )}

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
