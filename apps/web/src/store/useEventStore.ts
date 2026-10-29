import { create } from 'zustand';
import type { WorldEvent } from '../types';
import {
  playHoverBlip,
  playNewIncidentSound,
  playCriticalAlertSound,
  playTargetLockSound,
  setSoundMuted,
} from '../services/sound';

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedSources: string[];
  minImportance: number;
  country: string;
  startDate: string; // ISO string or YYYY-MM-DD
  endDate: string;   // ISO string or YYYY-MM-DD
}

export type ThemeAccent = 'cyan' | 'amber' | 'emerald' | 'rose';

interface EventStoreState {
  events: WorldEvent[];
  selectedEvent: WorldEvent | null;
  hoveredEvent: WorldEvent | null;
  cameraTarget: { lat: number; lon: number } | null;
  trackedFlightId: string | null;

  // Visual layers (Earthquake/Natural, Code/Tech, Aerospace/NASA, Financial, Weather)
  activeLayers: Record<string, boolean>;

  // View Projection Mode
  viewMode: '3d' | '2d';

  // Theme Accent
  themeAccent: ThemeAccent;

  // Sound
  isSoundMuted: boolean;

  // Filters
  filters: FilterState;

  // Real-time & Simulator
  isConnected: boolean;
  isSimulatorActive: boolean;

  // Timeline & Replay
  timelineMode: 'live' | 'replay';
  replayProgress: number; // 0 to 100 percentage
  isReplayPlaying: boolean;
  replaySpeed: number;

  // Actions
  addEvent: (event: WorldEvent) => void;
  addEvents: (events: WorldEvent[]) => void;
  setSelectedEvent: (event: WorldEvent | null) => void;
  setHoveredEvent: (event: WorldEvent | null) => void;
  setCameraTarget: (target: { lat: number; lon: number } | null) => void;
  setTrackedFlightId: (id: string | null) => void;
  
  setViewMode: (mode: '3d' | '2d') => void;
  toggleLayer: (layerId: string) => void;
  setThemeAccent: (accent: ThemeAccent) => void;
  toggleSoundMuted: () => void;

  setSearchQuery: (query: string) => void;
  toggleCategory: (category: string) => void;
  toggleSource: (source: string) => void;
  setMinImportance: (importance: number) => void;
  setCountryFilter: (country: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  resetFilters: () => void;

  setIsConnected: (connected: boolean) => void;
  setSimulatorActive: (active: boolean) => void;

  setTimelineMode: (mode: 'live' | 'replay') => void;
  setReplayProgress: (progress: number) => void;
  setIsReplayPlaying: (isPlaying: boolean) => void;
  setReplaySpeed: (speed: number) => void;
}

export const useEventStore = create<EventStoreState>((set) => ({
  events: [],
  selectedEvent: null,
  hoveredEvent: null,
  cameraTarget: null,
  trackedFlightId: null,

  activeLayers: {
    natural: true,
    technology: true,
    space: true,
    finance: true,
    weather: true,
    news: true,
  },

  viewMode: '3d',
  themeAccent: 'cyan',
  isSoundMuted: false,

  filters: {
    searchQuery: '',
    selectedCategories: [],
    selectedSources: [],
    minImportance: 0,
    country: '',
    startDate: '',
    endDate: '',
  },

  isConnected: false,
  isSimulatorActive: true,

  timelineMode: 'live',
  replayProgress: 100,
  isReplayPlaying: false,
  replaySpeed: 1,

  addEvent: (event) =>
    set((state) => {
      const updated = [event, ...state.events.filter((item) => item.id !== event.id)]
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, 300);
      return { events: updated };
    }),

  addEvents: (newEvents) =>
    set((state) => {
      const merged = new Map(state.events.map((event) => [event.id, event]));
      for (const event of newEvents) merged.set(event.id, event);
      const updated = [...merged.values()]
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, 300);
      return { events: updated };
    }),

  setSelectedEvent: (selectedEvent) => {
    if (selectedEvent) {
      playTargetLockSound();
    }
    set({ selectedEvent });
  },

  setHoveredEvent: (hoveredEvent) => {
    if (hoveredEvent) {
      playHoverBlip();
    }
    set({ hoveredEvent });
  },

  setCameraTarget: (cameraTarget) => set({ cameraTarget }),
  setTrackedFlightId: (trackedFlightId) => set({ trackedFlightId }),

  setViewMode: (viewMode) => set({ viewMode }),

  toggleLayer: (layerId) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layerId]: !state.activeLayers[layerId],
      },
    })),

  setThemeAccent: (themeAccent) => set({ themeAccent }),

  toggleSoundMuted: () =>
    set((state) => {
      const next = !state.isSoundMuted;
      setSoundMuted(next);
      return { isSoundMuted: next };
    }),

  setSearchQuery: (searchQuery) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery },
    })),

  toggleCategory: (category) =>
    set((state) => {
      const exists = state.filters.selectedCategories.includes(category);
      const updated = exists
        ? state.filters.selectedCategories.filter((c) => c !== category)
        : [...state.filters.selectedCategories, category];
      return { filters: { ...state.filters, selectedCategories: updated } };
    }),

  toggleSource: (source) =>
    set((state) => {
      const exists = state.filters.selectedSources.includes(source);
      const updated = exists
        ? state.filters.selectedSources.filter((s) => s !== source)
        : [...state.filters.selectedSources, source];
      return { filters: { ...state.filters, selectedSources: updated } };
    }),

  setMinImportance: (minImportance) =>
    set((state) => ({
      filters: { ...state.filters, minImportance },
    })),

  setCountryFilter: (country) =>
    set((state) => ({
      filters: { ...state.filters, country },
    })),

  setDateRange: (startDate, endDate) =>
    set((state) => ({
      filters: { ...state.filters, startDate, endDate },
    })),

  resetFilters: () =>
    set({
      filters: {
        searchQuery: '',
        selectedCategories: [],
        selectedSources: [],
        minImportance: 0,
        country: '',
        startDate: '',
        endDate: '',
      },
    }),

  setIsConnected: (isConnected) => set({ isConnected }),
  setSimulatorActive: (isSimulatorActive) => set({ isSimulatorActive }),

  setTimelineMode: (timelineMode) => set({ timelineMode }),
  setReplayProgress: (replayProgress) => set({ replayProgress }),
  setIsReplayPlaying: (isReplayPlaying) => set({ isReplayPlaying }),
  setReplaySpeed: (replaySpeed) => set({ replaySpeed }),
}));
