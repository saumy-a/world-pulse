import { Router } from 'express';
import { EventModel } from '../models/Event';

const router = Router();

router.get('/overview', async (_req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalEvents24h, grouped, average, activeSources] = await Promise.all([
      EventModel.countDocuments({ timestamp: { $gte: since } }),
      EventModel.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      EventModel.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: null, value: { $avg: '$importance' } } },
      ]),
      EventModel.distinct('source', { updatedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } }),
    ]);
    res.json({
      success: true,
      data: {
        totalEvents24h,
        eventsByCategory: Object.fromEntries(grouped.map((row: { _id: string; count: number }) => [row._id, row.count])),
        activeCollectors: activeSources.length,
        averageImportance: Number(average[0]?.value ?? 0),
      },
    });
  } catch (error) {
    console.error('Failed to fetch event analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event analytics' });
  }
});

export default router;
