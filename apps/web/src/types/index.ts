export {
  EventCategory,
  EventSource,
  type EventLocation,
  type WorldEvent,
} from '@world-pulse/shared-types';

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedSources: string[];
  minImportance: number;
}

export type TimelineMode = 'live' | 'replay';
