import { useState, useEffect, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Layers,
  Share2,
  Compass,
  RotateCcw,
  BarChart2,
  Clock,
  Search,
  X,
  Shield,
  User,
  Volume2,
  VolumeX,
  Bookmark,
} from 'lucide-react';

interface TopNavProps {
  onToggleFilters: () => void;
  isFiltersOpen: boolean;
  onToggleStats: () => void;
  isStatsOpen: boolean;
  onToggleReplay: () => void;
  isReplayOpen: boolean;
  onToggleAi: () => void;
  isAiOpen: boolean;
  onToggleAnalyticsModal: () => void;
  onToggleAuthModal: () => void;
  onToggleBookmarksModal: () => void;
  bookmarkCount: number;
}

export const TopNav: FC<TopNavProps> = ({
  onToggleFilters,
  isFiltersOpen,
  onToggleStats,
  isStatsOpen,
  onToggleReplay,
  isReplayOpen,
  onToggleAi: _onToggleAi,
  isAiOpen: _isAiOpen,
  onToggleAnalyticsModal: _onToggleAnalyticsModal,
  onToggleAuthModal,
  onToggleBookmarksModal,
  bookmarkCount,
}) => {
  const [utcTime, setUtcTime] = useState('');
  const viewMode = useEventStore((s) => s.viewMode);
  const setViewMode = useEventStore((s) => s.setViewMode);
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);
  const isSoundMuted = useEventStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useEventStore((s) => s.toggleSoundMuted);
  const searchQuery = useEventStore((s) => s.filters.searchQuery);
  const setSearchQuery = useEventStore((s) => s.setSearchQuery);
  const [isCopied, setIsCopied] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setUtcTime(d.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetView = () => {
    setCameraTarget({ lat: 20, lon: 0 });
  };

  return (
    <>
      {/* ── 1. Top-Left: Exact Title Bar ── */}
      <div className="title-bar-wrap">
        <div className="title-bar-glow" />
        <h1 className="title-bar-h1">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-400/30">
            <img src="/logo.svg" alt="God's Eye" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
          </span>
          <span>
            GOD'S EYE <span className="title-accent">VIEW</span>
          </span>
        </h1>
        <p className="title-bar-subtitle">NO PLACE LEFT BEHIND // WORLD PULSE</p>
      </div>

      {/* ── 2. Top-Center Actions: Exact Circular Control Bar ── */}
      <nav className="top-center-dock" aria-label="Globe actions">
        <button
          type="button"
          onClick={onToggleFilters}
          className={`top-round-btn ${isFiltersOpen ? 'active' : ''}`}
          title="Toggle Data Layer Discrimination Filters"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleShare}
          className={`top-round-btn ${isCopied ? 'active text-emerald-400 border-emerald-400' : ''}`}
          title="Copy Live Coordinates & Share Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
          className={`top-round-btn ${viewMode === '2d' ? 'active' : ''}`}
          title="Toggle 3D Spherical & 2D Mercator View"
        >
          <span className="font-mono text-[10px] font-bold">{viewMode === '3d' ? '2D' : '3D'}</span>
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="top-round-btn"
          title="Reset Map to North Up (0° Heading)"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="top-round-btn"
          title="Reset to Full Globe View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        {/* Sound toggle */}
        <button
          type="button"
          onClick={toggleSoundMuted}
          className={`top-round-btn ${!isSoundMuted ? 'active' : ''}`}
          title={isSoundMuted ? 'Unmute Procedural Audio' : 'Mute Procedural Audio'}
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </nav>

      {/* ── 3. Top-Right: Exact Style Indicator & Access HUD ── */}
      <div className="style-indicator-wrap">
        {/* Universal Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" />
          <input
            type="text"
            placeholder="COORDINATES / SEARCH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 pl-8 pr-7 py-1.5 rounded-xl bg-slate-950/70 border border-white/10 text-[10px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,212,255,0.2)] transition-all uppercase"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Telemetry Clock & Status */}
        <div className="style-indicator-box">
          <span className="indicator-label">{utcTime || 'ZULU TIME'}</span>
          <span className="indicator-value">NORMAL</span>
        </div>

        {/* Quick Toggles: Stats, Replay, Dossier, Auth */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleStats}
            title="Telemetry Analytics"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isStatsOpen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                : 'bg-slate-950/70 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleReplay}
            title="Timeline Historical Replay"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isReplayOpen
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-950/70 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleBookmarksModal}
            title="Saved Incident Dossiers"
            className="relative p-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-mono font-bold text-[8px] shadow-[0_0_6px_rgba(0,212,255,0.8)]">
                {bookmarkCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleAuthModal}
            title={isAuthenticated ? `Authenticated: ${user?.email}` : 'Access Authorization'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 font-mono text-[10px] tracking-wider transition-all cursor-pointer"
          >
            {isAuthenticated ? (
              <>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">{user?.role}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">ACCESS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
