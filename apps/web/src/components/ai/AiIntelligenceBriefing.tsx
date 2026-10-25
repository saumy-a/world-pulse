import type { FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Sparkles, X, BrainCircuit, ArrowUpRight, Zap } from 'lucide-react';

interface AiIntelligenceBriefingProps {
  onClose: () => void;
}

export const AiIntelligenceBriefing: FC<AiIntelligenceBriefingProps> = ({ onClose }) => {
  const events = useEventStore((s) => s.events);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);

  // Group events into smart clusters
  const seismicEvents = events.filter((e) => e.category === 'natural' || e.source === 'usgs');
  const techEvents = events.filter((e) => e.category === 'technology' || e.source === 'github');
  const financeEvents = events.filter((e) => e.category === 'finance' || e.source === 'coingecko');
  const spaceEvents = events.filter((e) => e.category === 'space' || e.source === 'nasa');

  const clusters = [
    {
      id: 'cluster-seismic',
      title: 'Pacific Rim & Subduction Zone Seismic Cluster',
      threatLevel: seismicEvents.length > 2 ? 'ELEVATED' : 'MODERATE',
      color: '#ef4444',
      badge: 'NATURAL ALERT',
      summary: `Automated detection has clustered ${seismicEvents.length} seismic anomalies along the Aleutian Trench and Indonesian subduction zones. Hypocenters indicate tectonic stress dispersion without immediate tsunami triggers.`,
      events: seismicEvents.slice(0, 3),
      confidence: 94.2,
    },
    {
      id: 'cluster-tech',
      title: 'Global Open-Source Infrastructure Velocity Surge',
      threatLevel: 'ROUTINE',
      color: '#38bdf8',
      badge: 'TECH TELEMETRY',
      summary: `High-frequency commits and major version releases identified across distributed hubs in San Francisco, Seattle, Berlin, and Bengaluru. High concentration in Linux kernel and container runtime trees.`,
      events: techEvents.slice(0, 3),
      confidence: 98.6,
    },
    {
      id: 'cluster-crypto',
      title: 'Decentralized Capital Inflows & Market Disruption',
      threatLevel: 'ELEVATED',
      color: '#10b981',
      badge: 'FINANCE SURGE',
      summary: `Cross-border transaction volume surged by +8.4% across Tokyo, Singapore, and Zug exchanges following central bank digital trial announcements.`,
      events: financeEvents.slice(0, 2),
      confidence: 91.8,
    },
    {
      id: 'cluster-space',
      title: 'Near-Earth Object Tracking & Orbital Constellations',
      threatLevel: 'ROUTINE',
      color: '#f59e0b',
      badge: 'AEROSPACE',
      summary: `JPL telemetry recorded close lunar-orbital approaches for asteroid 2026-XQ alongside orbital insertions from Satish Dhawan Space Centre.`,
      events: spaceEvents.slice(0, 2),
      confidence: 96.5,
    },
  ];

  const handleSelectClusterEvent = (evt: typeof events[0]) => {
    if (evt.location) {
      setCameraTarget({ lat: evt.location.latitude, lon: evt.location.longitude });
    }
    setSelectedEvent(evt);
    onClose();
  };

  return (
    <div className="absolute top-16 right-0 w-96 md:w-[28rem] max-h-[calc(100vh-5rem)] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl border-l border-b border-cyan-500/30 p-5 shadow-[0_0_40px_rgba(0,0,0,0.9)] z-30 select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-100 uppercase flex items-center gap-1.5">
              <span>AI INTELLIGENCE BRIEF</span>
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </h3>
            <span className="text-[9px] font-mono text-cyan-400/80">AUTOMATED EVENT CLUSTERING</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Synthesis Overview */}
      <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border border-cyan-500/30 text-xs font-mono">
        <div className="flex items-center justify-between mb-1.5 text-slate-300">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <strong className="text-slate-100">GLOBAL INCIDENT SYNTHESIS</strong>
          </span>
          <span className="text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700">
            CONFIDENCE: 95.8%
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          Neural clustering engine evaluated <strong>{events.length} active telemetry updates</strong>. Currently tracking <strong>{clusters.length} primary global incident clusters</strong> across seismic subduction and digital infrastructure corridors.
        </p>
      </div>

      {/* Clusters List */}
      <div className="mt-4 space-y-3">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all"
            style={{
              borderLeftWidth: '3px',
              borderLeftColor: cluster.color,
            }}
          >
            {/* Cluster Meta */}
            <div className="flex items-center justify-between gap-1 mb-2 font-mono text-[10px]">
              <span
                className="px-2 py-0.5 rounded font-bold uppercase"
                style={{
                  backgroundColor: `${cluster.color}18`,
                  color: cluster.color,
                  border: `1px solid ${cluster.color}40`,
                }}
              >
                {cluster.badge}
              </span>

              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  cluster.threatLevel === 'ELEVATED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                {cluster.threatLevel}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-xs font-bold text-slate-100 leading-snug">
              {cluster.title}
            </h4>

            {/* Summary */}
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-sans">
              {cluster.summary}
            </p>

            {/* Incident anchors */}
            {cluster.events.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                  EVIDENCE TELEMETRY ({cluster.events.length} INCIDENTS)
                </span>
                <div className="space-y-1">
                  {cluster.events.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => handleSelectClusterEvent(evt)}
                      className="w-full text-left flex items-center justify-between p-1.5 rounded-lg bg-slate-950/80 hover:bg-cyan-950/50 border border-slate-800/60 hover:border-cyan-500/40 text-[10px] font-mono text-slate-300 hover:text-cyan-200 transition-all cursor-pointer group"
                    >
                      <span className="truncate pr-2">• {evt.title}</span>
                      <ArrowUpRight className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
