/**
 * Simplified continental bounds and key geographic points for procedural world rendering.
 */
export const CONTINENTAL_CLUSTERS: { name: string; lat: number; lon: number; spreadLat: number; spreadLon: number }[] = [
  // North America
  { name: 'US East', lat: 38, lon: -78, spreadLat: 8, spreadLon: 12 },
  { name: 'US West', lat: 37, lon: -120, spreadLat: 10, spreadLon: 10 },
  { name: 'US Midwest', lat: 41, lon: -95, spreadLat: 8, spreadLon: 14 },
  { name: 'Canada East', lat: 48, lon: -75, spreadLat: 8, spreadLon: 15 },
  { name: 'Canada West', lat: 55, lon: -115, spreadLat: 10, spreadLon: 18 },
  { name: 'Mexico', lat: 23, lon: -102, spreadLat: 6, spreadLon: 10 },
  // South America
  { name: 'Brazil East', lat: -15, lon: -47, spreadLat: 12, spreadLon: 12 },
  { name: 'Amazon', lat: -3, lon: -60, spreadLat: 8, spreadLon: 14 },
  { name: 'Andes / Chile', lat: -25, lon: -68, spreadLat: 16, spreadLon: 6 },
  { name: 'Argentina', lat: -35, lon: -65, spreadLat: 10, spreadLon: 8 },
  // Europe
  { name: 'UK & Ireland', lat: 54, lon: -2, spreadLat: 4, spreadLon: 4 },
  { name: 'Western Europe', lat: 48, lon: 3, spreadLat: 6, spreadLon: 8 },
  { name: 'Central Europe', lat: 50, lon: 15, spreadLat: 6, spreadLon: 10 },
  { name: 'Nordics', lat: 62, lon: 15, spreadLat: 8, spreadLon: 12 },
  { name: 'Southern Europe', lat: 40, lon: 15, spreadLat: 5, spreadLon: 14 },
  // Africa
  { name: 'North Africa', lat: 28, lon: 15, spreadLat: 6, spreadLon: 25 },
  { name: 'West Africa', lat: 9, lon: 0, spreadLat: 6, spreadLon: 14 },
  { name: 'East Africa', lat: 1, lon: 37, spreadLat: 10, spreadLon: 10 },
  { name: 'Southern Africa', lat: -25, lon: 26, spreadLat: 8, spreadLon: 10 },
  // Asia
  { name: 'East China', lat: 31, lon: 115, spreadLat: 10, spreadLon: 14 },
  { name: 'North China', lat: 40, lon: 116, spreadLat: 6, spreadLon: 12 },
  { name: 'Japan', lat: 36, lon: 138, spreadLat: 6, spreadLon: 5 },
  { name: 'South Korea', lat: 36, lon: 128, spreadLat: 3, spreadLon: 3 },
  { name: 'India North', lat: 26, lon: 78, spreadLat: 7, spreadLon: 10 },
  { name: 'India South', lat: 14, lon: 77, spreadLat: 6, spreadLon: 8 },
  { name: 'Southeast Asia', lat: 14, lon: 102, spreadLat: 8, spreadLon: 10 },
  { name: 'Indonesia', lat: -2, lon: 118, spreadLat: 6, spreadLon: 20 },
  { name: 'Middle East', lat: 28, lon: 45, spreadLat: 8, spreadLon: 12 },
  { name: 'Central Asia', lat: 48, lon: 68, spreadLat: 10, spreadLon: 20 },
  // Oceania
  { name: 'Australia East', lat: -28, lon: 148, spreadLat: 10, spreadLon: 8 },
  { name: 'Australia West', lat: -25, lon: 122, spreadLat: 10, spreadLon: 10 },
  { name: 'New Zealand', lat: -41, lon: 174, spreadLat: 6, spreadLon: 4 },
];
