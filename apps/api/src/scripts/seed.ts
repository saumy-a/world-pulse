import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db";
import { EventModel } from "../models/Event";

const hoursAgo = (hours: number): Date =>
  new Date(Date.now() - hours * 60 * 60 * 1000);

// Sample events only. The collectors will add real ones later.
const sampleEvents = [
  { eventId: "seed_001", source: "usgs", type: "earthquake", category: "natural", title: "M 5.4 Earthquake - Tokyo, Japan", country: "Japan", timestamp: hoursAgo(1), importance: 8.5, location: { latitude: 35.6762, longitude: 139.6503 }, metadata: { magnitude: 5.4 } },
  { eventId: "seed_002", source: "usgs", type: "earthquake", category: "natural", title: "M 4.8 Earthquake - Santiago, Chile", country: "Chile", timestamp: hoursAgo(3), importance: 6.2, location: { latitude: -33.4489, longitude: -70.6693 }, metadata: { magnitude: 4.8 } },
  { eventId: "seed_003", source: "usgs", type: "earthquake", category: "natural", title: "M 5.1 Earthquake - Anchorage, USA", country: "USA", timestamp: hoursAgo(6), importance: 7.0, location: { latitude: 61.2181, longitude: -149.9003 }, metadata: { magnitude: 5.1 } },
  { eventId: "seed_004", source: "usgs", type: "earthquake", category: "natural", title: "M 6.0 Earthquake - Jakarta, Indonesia", country: "Indonesia", timestamp: hoursAgo(9), importance: 9.1, location: { latitude: -6.2088, longitude: 106.8456 }, metadata: { magnitude: 6.0 } },
  { eventId: "seed_005", source: "github", type: "code_push", category: "technology", title: "Major release pushed to an open-source project", country: "USA", timestamp: hoursAgo(2), importance: 4.5, location: { latitude: 37.7749, longitude: -122.4194 }, metadata: { repo: "example/project" } },
  { eventId: "seed_006", source: "github", type: "release", category: "technology", title: "New framework version released", country: "Germany", timestamp: hoursAgo(5), importance: 3.8, location: { latitude: 52.52, longitude: 13.405 }, metadata: { repo: "example/framework" } },
  { eventId: "seed_007", source: "github", type: "code_push", category: "technology", title: "Large commit burst on a trending repository", country: "India", timestamp: hoursAgo(7), importance: 4.1, location: { latitude: 12.9716, longitude: 77.5946 }, metadata: { commits: 42 } },
  { eventId: "seed_008", source: "coingecko", type: "price_move", category: "finance", title: "Bitcoin up 4% in 24 hours", timestamp: hoursAgo(4), importance: 6.5, metadata: { changePercent: 4.0 } },
  { eventId: "seed_009", source: "coingecko", type: "price_move", category: "finance", title: "Ethereum down 3% in 24 hours", timestamp: hoursAgo(8), importance: 5.2, metadata: { changePercent: -3.0 } },
  { eventId: "seed_010", source: "nasa", type: "asteroid", category: "space", title: "Near-Earth asteroid flyby detected", timestamp: hoursAgo(12), importance: 7.4, metadata: { distanceKm: 4200000 } },
  { eventId: "seed_011", source: "launch-library", type: "rocket_launch", category: "space", title: "Falcon 9 launch from Cape Canaveral", country: "USA", timestamp: hoursAgo(10), importance: 6.8, location: { latitude: 28.3922, longitude: -80.6077 }, metadata: { vehicle: "Falcon 9" } },
  { eventId: "seed_012", source: "launch-library", type: "rocket_launch", category: "space", title: "PSLV launch from Sriharikota", country: "India", timestamp: hoursAgo(20), importance: 7.2, location: { latitude: 13.7199, longitude: 80.2304 }, metadata: { vehicle: "PSLV" } },
  { eventId: "seed_013", source: "hacker-news", type: "story", category: "technology", title: "Show HN: A new open-source database tool", timestamp: hoursAgo(11), importance: 3.5, metadata: { points: 312 } },
  { eventId: "seed_014", source: "news", type: "headline", category: "geopolitics", title: "International summit opens in Geneva", country: "Switzerland", timestamp: hoursAgo(14), importance: 5.9, location: { latitude: 46.2044, longitude: 6.1432 }, metadata: { outlet: "example-news" } },
  { eventId: "seed_015", source: "open-meteo", type: "weather_alert", category: "weather", title: "Heavy rainfall alert - Mumbai, India", country: "India", timestamp: hoursAgo(15), importance: 6.0, location: { latitude: 19.076, longitude: 72.8777 }, metadata: { rainfallMm: 85 } },
];

async function seed(): Promise<void> {
  await connectDatabase();

  const operations = sampleEvents.map((event) => ({
    updateOne: {
      filter: { eventId: event.eventId },
      update: { $set: event },
      upsert: true,
    },
  }));

  const result = await EventModel.bulkWrite(operations);
  console.log(
    `Seed finished: ${result.upsertedCount} added, ${result.modifiedCount} updated`
  );
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
