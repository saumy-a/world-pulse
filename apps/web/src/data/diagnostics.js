const DEFAULT_API_URL = 'http://localhost:5000';
const SESSION_STORAGE_KEY = 'world-pulse-diagnostics-session';

function apiBaseUrl() {
  return import.meta.env?.VITE_WORLD_PULSE_API_URL || DEFAULT_API_URL;
}

function getSessionId() {
  try {
    const existing = globalThis.sessionStorage?.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const id = globalThis.crypto?.randomUUID?.();
    if (!id) return null;
    globalThis.sessionStorage?.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return globalThis.crypto?.randomUUID?.() || null;
  }
}

/** Best-effort, privacy-limited client diagnostics. Never send error messages or URLs. */
export function recordClientDiagnostic({
  action,
  source,
  durationMs,
  resultCount,
  statusCode,
  errorCode,
} = {}) {
  const sessionId = getSessionId();
  if (!sessionId || typeof globalThis.fetch !== 'function') return;

  const log = {
    action,
    source,
    sessionId,
    ...(Number.isFinite(durationMs) ? { durationMs: Math.max(0, Math.round(durationMs)) } : {}),
    ...(Number.isInteger(resultCount) ? { resultCount: Math.max(0, resultCount) } : {}),
    ...(Number.isInteger(statusCode) ? { statusCode } : {}),
    ...(typeof errorCode === 'string' ? { errorCode: errorCode.slice(0, 48) } : {}),
  };
  try {
    void globalThis.fetch(new URL('/api/v1/diagnostics/client', apiBaseUrl()), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: [log] }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Diagnostics must never interrupt map interaction or recursively report
    // their own transport failures.
  }
}
