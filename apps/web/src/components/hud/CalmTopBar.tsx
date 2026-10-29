import { useState, type FC, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { geocodeLocation } from '../../services/locationSearch';
import { useEventStore } from '../../store/useEventStore';

export interface CategoryChip {
  id: string;
  label: string;
  color: string;
  filterKey: string; // matches event category or 'all'
}

export const CATEGORIES: CategoryChip[] = [
  { id: 'all', label: 'All', color: '#94a3b8', filterKey: 'all' },
  { id: 'earthquakes', label: 'Earthquakes', color: '#f97316', filterKey: 'natural' },
  { id: 'code', label: 'Code', color: '#10b981', filterKey: 'technology' },
  { id: 'knowledge', label: 'Knowledge', color: '#38bdf8', filterKey: 'geopolitics' },
  { id: 'markets', label: 'Markets', color: '#eab308', filterKey: 'finance' },
  { id: 'weather', label: 'Weather', color: '#06b6d4', filterKey: 'weather' },
];

export const CalmTopBar: FC = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const filters = useEventStore((s) => s.filters);
  const toggleCategory = useEventStore((s) => s.toggleCategory);
  const resetFilters = useEventStore((s) => s.resetFilters);
  const events = useEventStore((s) => s.events);
  const feedLive = events.length > 0;

  const activeCategory = filters.selectedCategories.length === 1 ? filters.selectedCategories[0] : 'all';

  const handleChipClick = (cat: CategoryChip) => {
    if (cat.id === 'all') {
      resetFilters();
    } else {
      useEventStore.setState((state) => ({
        filters: {
          ...state.filters,
          selectedCategories: [cat.filterKey],
        },
      }));
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || searching) return;
    setSearching(true);
    setSearchError('');
    try {
      const result = await geocodeLocation(query.trim());
      if (!result) throw new Error('Place not found');
      window.dispatchEvent(new CustomEvent('wp:fly-to', { detail: result }));
      setQuery(result.label);
    } catch {
      setSearchError('Place not found. Try a city or coordinates.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <header aria-label="World Pulse navigation" className="wp-topbar">
      {/* Brand Logo & Name */}
      <div className="wp-brand">
        <div className="wp-brand-icon">
          🌍
        </div>
        <div>
          <span className="font-semibold text-sm tracking-tight text-white">World Pulse</span>
        </div>
      </div>

      {/* Labeled Category Chips */}
      <form onSubmit={handleSearch} role="search" className="wp-search">
        <Search aria-hidden="true" className="wp-search-icon" />
        <input aria-label="Search for a place" placeholder="Search a place" value={query} onChange={(event) => setQuery(event.target.value)} />
        {searchError && <span role="status" className="wp-search-error">{searchError}</span>}
      </form>
      <nav aria-label="Event Categories" className="wp-categories">
        {CATEGORIES.map((cat) => {
          const isSelected =
            cat.id === 'all'
              ? filters.selectedCategories.length === 0
              : filters.selectedCategories.includes(cat.filterKey);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleChipClick(cat)}
              className={`wp-category-chip ${
                isSelected
                ? 'is-selected'
                  : ''
              }`}
              style={{
                borderColor: isSelected ? cat.color : undefined,
                backgroundColor: isSelected ? `${cat.color}22` : undefined,
                boxShadow: isSelected ? `0 0 14px ${cat.color}33` : undefined,
              }}
            >
              <span
                className="wp-category-dot"
                style={{
                  backgroundColor: cat.color,
                  boxShadow: isSelected ? `0 0 8px ${cat.color}` : 'none',
                  transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                }}
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Live Status Indicator */}
      <div className="wp-live-wrap">
        <div className="wp-live">
          <span className="wp-live-dot-wrap">
            {feedLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`wp-live-dot ${feedLive ? 'is-live' : 'is-connecting'}`}></span>
          </span>
          <span className="wp-live-label">{feedLive ? 'LIVE' : 'CONNECTING'}</span>
          <span className="wp-live-detail">{feedLive ? `${events.length} events` : 'USGS feed'}</span>
        </div>
      </div>
    </header>
  );
};
