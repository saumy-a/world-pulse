/**
 * Accurate simplified polygonal coastlines of Earth's continents.
 * Each array represents a closed geographic boundary [lon, lat].
 */

export interface MetroHub {
  name: string;
  lat: number;
  lon: number;
  intensity: number; // 0 to 1
}

export const METRO_HUBS: MetroHub[] = [
  // North America
  { name: 'New York', lat: 40.71, lon: -74.00, intensity: 1.0 },
  { name: 'San Francisco', lat: 37.77, lon: -122.41, intensity: 0.95 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24, intensity: 0.9 },
  { name: 'Chicago', lat: 41.87, lon: -87.62, intensity: 0.85 },
  { name: 'Toronto', lat: 43.65, lon: -79.38, intensity: 0.8 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13, intensity: 0.85 },
  // Europe
  { name: 'London', lat: 51.50, lon: -0.12, intensity: 1.0 },
  { name: 'Paris', lat: 48.85, lon: 2.35, intensity: 0.95 },
  { name: 'Frankfurt / Berlin', lat: 51.16, lon: 10.45, intensity: 0.9 },
  { name: 'Amsterdam', lat: 52.36, lon: 4.90, intensity: 0.85 },
  { name: 'Madrid', lat: 40.41, lon: -3.70, intensity: 0.75 },
  // Asia & Middle East
  { name: 'Tokyo', lat: 35.67, lon: 139.65, intensity: 1.0 },
  { name: 'Shanghai / Beijing', lat: 31.23, lon: 121.47, intensity: 1.0 },
  { name: 'Seoul', lat: 37.56, lon: 126.97, intensity: 0.95 },
  { name: 'Hong Kong / Shenzhen', lat: 22.31, lon: 114.16, intensity: 0.95 },
  { name: 'Singapore', lat: 1.35, lon: 103.81, intensity: 0.95 },
  { name: 'Mumbai', lat: 19.07, lon: 72.87, intensity: 0.9 },
  { name: 'Delhi', lat: 28.61, lon: 77.20, intensity: 0.9 },
  { name: 'Bengaluru', lat: 12.97, lon: 77.59, intensity: 0.85 },
  { name: 'Dubai', lat: 25.20, lon: 55.27, intensity: 0.9 },
  // South America
  { name: 'São Paulo', lat: -23.55, lon: -46.63, intensity: 0.85 },
  { name: 'Buenos Aires', lat: -34.60, lon: -58.38, intensity: 0.8 },
  // Africa
  { name: 'Cairo', lat: 30.04, lon: 31.23, intensity: 0.8 },
  { name: 'Johannesburg', lat: -26.20, lon: 28.04, intensity: 0.75 },
  { name: 'Lagos', lat: 6.52, lon: 3.37, intensity: 0.75 },
  // Oceania
  { name: 'Sydney', lat: -33.86, lon: 151.20, intensity: 0.85 },
  { name: 'Melbourne', lat: -37.81, lon: 144.96, intensity: 0.8 },
];

export const CONTINENTAL_POLYGONS: [number, number][][] = [
  // North America
  [
    [-168, 65], [-160, 71], [-140, 70], [-125, 69], [-100, 74], [-80, 72], [-65, 62],
    [-55, 52], [-60, 44], [-70, 42], [-75, 35], [-80, 25], [-82, 23], [-85, 20],
    [-88, 16], [-83, 10], [-77, 8], [-80, 8], [-85, 13], [-92, 16], [-97, 19],
    [-105, 23], [-110, 30], [-117, 32], [-124, 40], [-125, 48], [-130, 54], [-140, 60],
    [-150, 60], [-160, 58], [-168, 65],
  ],
  // South America
  [
    [-77, 8], [-72, 11], [-62, 10], [-50, 0], [-35, -5], [-35, -10], [-38, -18],
    [-45, -24], [-50, -30], [-55, -35], [-65, -42], [-68, -53], [-75, -53], [-73, -45],
    [-72, -35], [-70, -25], [-76, -14], [-80, -4], [-80, 2], [-77, 8],
  ],
  // Europe
  [
    [-10, 36], [-5, 43], [-1, 46], [-5, 48], [-4, 52], [-5, 58], [2, 53],
    [5, 58], [10, 55], [10, 62], [15, 65], [25, 71], [30, 68], [35, 60],
    [30, 50], [25, 45], [20, 40], [15, 38], [10, 37], [0, 38], [-10, 36],
  ],
  // Scandinavia
  [
    [5, 58], [10, 58], [12, 56], [16, 56], [20, 60], [25, 65], [28, 70],
    [24, 71], [18, 69], [12, 65], [8, 63], [5, 60], [5, 58],
  ],
  // Africa
  [
    [-6, 35], [10, 37], [25, 32], [33, 31], [35, 25], [43, 12], [51, 12],
    [45, 5], [40, -5], [38, -15], [35, -24], [30, -32], [20, -34], [17, -30],
    [12, -18], [10, -5], [5, 4], [0, 6], [-10, 5], [-16, 12], [-17, 21],
    [-13, 28], [-6, 35],
  ],
  // Asia Main
  [
    [30, 50], [40, 55], [60, 60], [80, 72], [105, 75], [130, 72], [150, 70],
    [170, 66], [180, 65], [160, 55], [142, 50], [135, 45], [130, 40], [122, 38],
    [122, 30], [118, 25], [108, 20], [105, 10], [100, 5], [98, 15], [90, 22],
    [80, 16], [78, 8], [73, 16], [68, 24], [58, 25], [50, 30], [40, 30],
    [35, 35], [30, 42], [30, 50],
  ],
  // India Subcontinent
  [
    [68, 24], [72, 20], [73, 16], [76, 10], [78, 8], [80, 13], [82, 17],
    [87, 22], [90, 22], [88, 25], [78, 30], [70, 30], [68, 24],
  ],
  // Japan
  [
    [130, 32], [132, 34], [136, 35], [140, 38], [142, 42], [145, 44],
    [142, 45], [140, 42], [136, 38], [132, 35], [130, 32],
  ],
  // Australia
  [
    [114, -22], [120, -18], [130, -13], [136, -12], [142, -11], [145, -15],
    [150, -22], [153, -28], [150, -36], [145, -38], [138, -35], [130, -32],
    [120, -34], [115, -34], [113, -26], [114, -22],
  ],
  // New Zealand
  [
    [172, -35], [176, -38], [178, -39], [175, -42], [173, -43], [170, -46],
    [167, -46], [169, -43], [172, -41], [174, -37], [172, -35],
  ],
];
