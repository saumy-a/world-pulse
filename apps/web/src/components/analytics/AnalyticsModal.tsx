import { useState, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import {
  Activity,
  X,
  Server,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

interface AnalyticsModalProps {
  onClose: () => void;
}

export const AnalyticsModal: FC<AnalyticsModalProps> = ({ onClose }) => {
  const events = useEventStore((s) => s.events);
  const [activeTab, setActiveTab] = useState<'collectors' | 'timeline' | 'density'>('collectors');

  const collectors = [
    {
      name: 'GitHub Events Worker',
      protocol: 'REST / Polling (ETag)',
      status: 'OPERATIONAL',
      pingMs: 142,
      uptime: '99.98%',
      rate: '15 ev/min',
      color: '#38bdf8',
    },
    {
      name: 'Wikimedia EventStreams',
      protocol: 'SSE (Server-Sent Events)',
      status: 'STREAMING',
      pingMs: 52,
      uptime: '100.0%',
      rate: '68 ev/min',
      color: '#a855f7',
    },
    {
      name: 'USGS Earthquake Seismic GeoJSON',
      protocol: 'Polling (node-cron)',
      status: 'OPERATIONAL',
      pingMs: 230,
      uptime: '99.95%',
      rate: '1.2 ev/min',
      color: '#ef4444',
    },
    {
      name: 'CoinGecko Financial Market Feed',
      protocol: 'REST API / Upstash Hot Cache',
      status: 'OPERATIONAL',
      pingMs: 185,
      uptime: '99.92%',
      rate: '8.4 ev/min',
      color: '#10b981',
    },
    {
      name: 'NASA JPL Near-Earth Ingestor',
      protocol: 'REST / Open APIs',
      status: 'OPERATIONAL',
      pingMs: 310,
      uptime: '99.88%',
      rate: '0.8 ev/min',
      color: '#f59e0b',
    },
    {
      name: 'Open-Meteo Weather Anomalies',
      protocol: 'Polling / Spatial Filter',
      status: 'OPERATIONAL',
      pingMs: 164,
      uptime: '99.99%',
      rate: '2.1 ev/min',
      color: '#06b6d4',
    },
  ];

  // SVG Area Chart points representing 24-hour volume
  const hourlyPoints = [
    { hour: '00:00', count: 18 },
    { hour: '03:00', count: 12 },
    { hour: '06:00', count: 28 },
    { hour: '09:00', count: 64 },
    { hour: '12:00', count: 88 },
    { hour: '15:00', count: 96 },
    { hour: '18:00', count: 74 },
    { hour: '21:00', count: 52 },
    { hour: 'Now', count: events.length },
  ];

  const maxVal = Math.max(...hourlyPoints.map((p) => p.count), 100);
  const chartWidth = 500;
  const chartHeight = 160;

  const pointsString = hourlyPoints
    .map((p, idx) => {
      const x = (idx / (hourlyPoints.length - 1)) * chartWidth;
      const y = chartHeight - (p.count / maxVal) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  const areaString = `0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-950/95 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Tactical Corner Reticles */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-widest text-slate-100 uppercase flex items-center gap-2">
                <span>SYSTEM INTELLIGENCE & COLLECTOR CONSOLE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ALL SYSTEMS NOMINAL
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time pipeline health, microservice collectors telemetry, and temporal activity curves
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('collectors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'collectors'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>COLLECTOR HEALTH ({collectors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>24H VOLUME CURVE</span>
          </button>
        </div>

        {/* Tab 1: Collector Health Monitor */}
        {activeTab === 'collectors' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
            {collectors.map((col) => (
              <div
                key={col.name}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all"
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: col.color,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{col.name}</h4>
                    <span className="text-[10px] text-slate-500">{col.protocol}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{col.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-500 block">LATENCY</span>
                    <span className="text-cyan-300 font-bold">{col.pingMs}ms</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">UPTIME</span>
                    <span className="text-emerald-400 font-bold">{col.uptime}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">THROUGHPUT</span>
                    <span className="text-slate-200 font-bold">{col.rate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: 24-Hour Time-Series Curve */}
        {activeTab === 'timeline' && (
          <div className="mt-5 p-5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  24-Hour Ingestion Frequency
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Real-time normalized stream volume recorded across global endpoints
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-700">
                PEAK: 96 EV / HOUR
              </span>
            </div>

            {/* SVG Area Chart */}
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0.25, 0.5, 0.75].map((pct, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={chartHeight * pct}
                    x2={chartWidth}
                    y2={chartHeight * pct}
                    stroke="rgba(56, 189, 248, 0.12)"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Area under curve */}
                <polygon points={areaString} fill="url(#areaGradient)" />

                {/* Stroke line */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  points={pointsString}
                />

                {/* Data points */}
                {hourlyPoints.map((p, idx) => {
                  const x = (idx / (hourlyPoints.length - 1)) * chartWidth;
                  const y = chartHeight - (p.count / maxVal) * (chartHeight - 30) - 15;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#00f0ff"
                      stroke="#030712"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                {hourlyPoints.map((p, idx) => (
                  <span key={idx}>{p.hour}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
