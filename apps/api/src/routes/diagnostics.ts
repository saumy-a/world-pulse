import { createHash, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { DiagnosticLogModel } from '../models/DiagnosticLog';

const router = Router();
const RETENTION_DAYS = 30;
const MAX_BATCH_SIZE = 100;
const CLIENT_REQUESTS_PER_MINUTE = 60;
const clientRateWindows = new Map<string, { start: number; count: number }>();

const clientActions = new Set([
  'layer_enabled',
  'layer_disabled',
  'layer_activation_failed',
  'api_request_succeeded',
  'api_request_failed',
]);
const collectorActions = new Set([
  'collector_succeeded',
  'collector_failed',
  'collector_publish_failed',
]);

function matchesIngestKey(candidate: string, expected: string): boolean {
  const candidateHash = createHash('sha256').update(candidate).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(candidateHash, expectedHash) && candidate === expected;
}

function isSafeLog(value: any, actions: Set<string>, requiresSession: boolean) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (
    typeof value.action !== 'string' || !actions.has(value.action) ||
    typeof value.source !== 'string' || !/^[a-z0-9_.:-]{1,80}$/i.test(value.source)
  ) return false;
  if (
    requiresSession &&
    (typeof value.sessionId !== 'string' || !/^[a-z0-9-]{16,64}$/i.test(value.sessionId))
  ) return false;
  if (value.durationMs != null && (!Number.isFinite(value.durationMs) || value.durationMs < 0 || value.durationMs > 86_400_000)) return false;
  if (value.resultCount != null && (!Number.isInteger(value.resultCount) || value.resultCount < 0 || value.resultCount > 1_000_000)) return false;
  if (value.statusCode != null && (!Number.isInteger(value.statusCode) || value.statusCode < 100 || value.statusCode > 599)) return false;
  if (value.errorCode != null && (typeof value.errorCode !== 'string' || !/^[a-z0-9_.-]{1,48}$/i.test(value.errorCode))) return false;
  return true;
}

function logDocuments(logs: any[], requiresSession: boolean) {
  const expiresAt = new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
  return logs.map((log) => ({
    action: log.action,
    source: log.source,
    ...(requiresSession ? { sessionId: log.sessionId } : {}),
    ...(Number.isFinite(log.durationMs) ? { durationMs: log.durationMs } : {}),
    ...(Number.isInteger(log.resultCount) ? { resultCount: log.resultCount } : {}),
    ...(Number.isInteger(log.statusCode) ? { statusCode: log.statusCode } : {}),
    ...(typeof log.errorCode === 'string' ? { errorCode: log.errorCode } : {}),
    expiresAt,
  }));
}

function allowClientRequest(ip: string): boolean {
  const now = Date.now();
  const current = clientRateWindows.get(ip);
  if (!current || now - current.start >= 60_000) {
    clientRateWindows.set(ip, { start: now, count: 1 });
    if (clientRateWindows.size > 5_000) {
      for (const [key, value] of clientRateWindows) {
        if (now - value.start >= 60_000) clientRateWindows.delete(key);
      }
    }
    return true;
  }
  current.count += 1;
  return current.count <= CLIENT_REQUESTS_PER_MINUTE;
}

// Browser diagnostics contain only fixed action names, a layer id, and an
// opaque session id. Never accept arbitrary messages, URLs, or request headers.
router.post('/client', async (req, res) => {
  if (!allowClientRequest(req.ip || 'unknown')) {
    res.status(429).json({ success: false, error: 'Too many diagnostic requests' });
    return;
  }
  const logs = req.body?.logs;
  if (!Array.isArray(logs) || logs.length > MAX_BATCH_SIZE || !logs.every((entry) => isSafeLog(entry, clientActions, true))) {
    res.status(400).json({ success: false, error: 'Expected up to 100 valid client diagnostic logs' });
    return;
  }
  if (logs.length === 0) {
    res.json({ success: true, stored: 0 });
    return;
  }
  try {
    await DiagnosticLogModel.insertMany(logDocuments(logs, true), { ordered: false });
    res.json({ success: true, stored: logs.length });
  } catch (error) {
    console.error('Failed to store client diagnostics:', error);
    res.status(500).json({ success: false, error: 'Failed to store diagnostics' });
  }
});

// Collector diagnostics use the existing service-to-service secret.
router.post('/collectors', async (req, res) => {
  const expected = process.env.WORLD_PULSE_INGEST_KEY;
  const supplied = req.header('x-world-pulse-ingest-key') ?? '';
  if (!expected || !matchesIngestKey(supplied, expected)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  const logs = req.body?.logs;
  if (!Array.isArray(logs) || logs.length > MAX_BATCH_SIZE || !logs.every((entry) => isSafeLog(entry, collectorActions, false))) {
    res.status(400).json({ success: false, error: 'Expected up to 100 valid collector diagnostic logs' });
    return;
  }
  if (logs.length === 0) {
    res.json({ success: true, stored: 0 });
    return;
  }
  try {
    await DiagnosticLogModel.insertMany(logDocuments(logs, false), { ordered: false });
    res.json({ success: true, stored: logs.length });
  } catch (error) {
    console.error('Failed to store collector diagnostics:', error);
    res.status(500).json({ success: false, error: 'Failed to store diagnostics' });
  }
});

export default router;
