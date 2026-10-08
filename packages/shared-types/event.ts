export interface EventLocation {
  latitude: number;
  longitude: number;
}

export interface WorldEvent {
  id: string;
  source: string;
  sourceEventId?: string;

  type: string;
  category: string;

  title: string;
  description?: string;

  timestamp: string;
  importance: number;

  location?: EventLocation;

  metadata?: Record<string, unknown>;
}