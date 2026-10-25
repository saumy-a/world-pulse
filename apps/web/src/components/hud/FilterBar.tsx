import type { FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { EventCategory, EventSource } from '../../types';
import { getEventColor } from '../../utils/geo';
import { RotateCcw, X, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  onClose: () => void;
}

const SOURCES = [
  EventSource.GitHub, EventSource.USGS, EventSource.Wikimedia,
  EventSource.NASA, EventSource.CoinGecko, EventSource.OpenMeteo,
  EventSource.News, EventSource.LaunchLibrary,
];

export const FilterBar: FC<FilterBarProps> = ({ onClose }) => {
  const filters = useEventStore((s) => s.filters);
  const toggleCategory = useEventStore((s) => s.toggleCategory);
  const toggleSource = useEventStore((s) => s.toggleSource);
  const setMinImportance = useEventStore((s) => s.setMinImportance);
  const resetFilters = useEventStore((s) => s.resetFilters);

  const categories = Object.values(EventCategory);
  const hasActiveFilters = filters.selectedCategories.length > 0 || filters.selectedSources.length > 0 || filters.minImportance > 0;

  return (
    <div
      className="absolute top-14 right-0 w-80 max-h-[calc(100vh-4rem)] overflow-y-auto z-30 select-none animate-slide-right"
      style={{
        background: 'rgba(8,11,18,0.95)',
        borderLeft: '1px solid rgba(0,212,255,0.15)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        backdropFilter: 'blur(24px) saturate(1.3)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(8,11,18,0.96)', borderBottom: '1px solid rgba(0,212,255,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-7 h-7"
            style={{
              background: 'rgba(0,212,255,0.07)',
              border: '1px solid rgba(0,212,255,0.28)',
              clipPath: 'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))',
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              RADAR FILTERS
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              INCIDENT DISCRIMINATION
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2 py-1 cursor-pointer transition-all"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1px', color: 'var(--accent)', border: '1px solid rgba(0,212,255,0.28)', background: 'rgba(0,212,255,0.07)', textTransform: 'uppercase' }}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              RESET
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 cursor-pointer transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', borderRadius: '3px' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Severity Slider */}
        <div
          className="p-3"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              MIN SEVERITY
            </span>
            <span
              className="px-2 py-0.5"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', border: '1px solid rgba(0,212,255,0.28)', background: 'rgba(0,212,255,0.07)' }}
            >
              ≥ {filters.minImportance.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0" max="9" step="0.5"
            value={filters.minImportance}
            onChange={(e) => setMinImportance(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            {['ALL (0)', 'MOD (5)', 'CRIT (8+)'].map(label => (
              <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.8px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <h4
            className="mb-2.5"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase' }}
          >
            INGESTION SOURCES
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {SOURCES.map((src) => {
              const isActive = filters.selectedSources.includes(src);
              const color = getEventColor(undefined, src);
              return (
                <button
                  key={src}
                  onClick={() => toggleSource(src)}
                  className="flex items-center gap-1.5 px-2.5 py-1 cursor-pointer transition-all"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    border: '1px solid',
                    borderColor: isActive ? `${color}60` : 'rgba(255,255,255,0.08)',
                    background: isActive ? `${color}12` : 'rgba(255,255,255,0.03)',
                    color: isActive ? color : 'var(--text-dim)',
                    borderRadius: '2px',
                  }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: color }} />
                  {src}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4
            className="mb-2.5"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase' }}
          >
            CATEGORY CRITERIA
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isActive = filters.selectedCategories.includes(cat);
              const color = getEventColor(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-1.5 px-2.5 py-1 cursor-pointer transition-all capitalize"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    border: '1px solid',
                    borderColor: isActive ? `${color}60` : 'rgba(255,255,255,0.08)',
                    background: isActive ? `${color}12` : 'rgba(255,255,255,0.03)',
                    color: isActive ? color : 'var(--text-dim)',
                    borderRadius: '2px',
                  }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: color }} />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
