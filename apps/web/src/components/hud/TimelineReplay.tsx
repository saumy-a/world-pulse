import { useEffect, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { Play, Pause, RotateCcw, Clock, Radio, X } from 'lucide-react';

interface TimelineReplayProps {
  onClose: () => void;
}

export const TimelineReplay: FC<TimelineReplayProps> = ({ onClose }) => {
  const events = useEventStore((s) => s.events);
  const timelineMode = useEventStore((s) => s.timelineMode);
  const setTimelineMode = useEventStore((s) => s.setTimelineMode);
  const replayProgress = useEventStore((s) => s.replayProgress);
  const setReplayProgress = useEventStore((s) => s.setReplayProgress);
  const isReplayPlaying = useEventStore((s) => s.isReplayPlaying);
  const setIsReplayPlaying = useEventStore((s) => s.setIsReplayPlaying);
  const replaySpeed = useEventStore((s) => s.replaySpeed);
  const setReplaySpeed = useEventStore((s) => s.setReplaySpeed);
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);

  // Playback timer effect
  useEffect(() => {
    if (!isReplayPlaying) return;

    const interval = setInterval(() => {
      setReplayProgress(
        Math.min(100, (replayProgress + 1 * replaySpeed) % 100)
      );
    }, 200);

    return () => clearInterval(interval);
  }, [isReplayPlaying, replayProgress, replaySpeed, setReplayProgress]);

  // When replay progress updates, sync selected event
  useEffect(() => {
    if (timelineMode === 'replay' && events.length > 0) {
      const idx = Math.floor((replayProgress / 100) * (events.length - 1));
      setSelectedEvent(events[idx] || null);
    }
  }, [replayProgress, timelineMode, events, setSelectedEvent]);

  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-40 select-none animate-fade-up p-3.5"
      style={{
        background: 'rgba(8, 11, 18, 0.95)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 20px rgba(245, 158, 11, 0.08)',
        backdropFilter: 'blur(24px) saturate(1.35)',
        clipPath: 'polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px))',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-950/60 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[2px] text-amber-200 uppercase">
              REPLAY ENGINE
            </span>
          </div>
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold uppercase ml-1">
            {timelineMode.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {timelineMode === 'replay' ? (
            <button
              onClick={() => {
                setTimelineMode('live');
                setIsReplayPlaying(false);
              }}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 hover:bg-cyan-900/80 flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(0,212,255,0.2)] cursor-pointer"
            >
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>RETURN TO LIVE</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setTimelineMode('replay');
                setIsReplayPlaying(true);
              }}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/80 hover:bg-amber-900/80 flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
            >
              <span>ENGAGE REPLAY</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrubber Slider */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mb-1 tracking-wider">
          <span>-24H PAST</span>
          <span className="text-amber-300 font-bold">
            SCRUBBER: {replayProgress.toFixed(0)}%
            {selectedEvent ? ` // [${selectedEvent.source.toUpperCase()}]` : ''}
          </span>
          <span>LIVE</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={replayProgress}
          onChange={(e) => {
            setTimelineMode('replay');
            setReplayProgress(parseFloat(e.target.value));
          }}
          className="w-full accent-amber-400 h-1.5 bg-slate-900 rounded cursor-pointer border border-white/5"
        />

        {/* Current Incident Title on Timeline */}
        {selectedEvent && (
          <div className="mt-1.5 text-[10px] font-mono text-slate-300 truncate bg-black/40 px-2.5 py-1 rounded border border-amber-500/20">
            <span className="text-amber-400 mr-1.5">►</span>
            <span>{selectedEvent.title}</span>
          </div>
        )}
      </div>

      {/* Control Buttons: Play/Pause, Speed */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setTimelineMode('replay');
              setIsReplayPlaying(!isReplayPlaying);
            }}
            className="p-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            {isReplayPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setTimelineMode('replay');
              setReplayProgress(0);
            }}
            title="Rewind to beginning"
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed multi-buttons */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/10 text-[9px] font-mono">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => setReplaySpeed(speed)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                replaySpeed === speed
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-[0_0_6px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
