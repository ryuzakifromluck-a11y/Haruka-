import "server-only";

// Small in-memory sliding-window limiter. Enough for a single-user private site;
// on serverless it resets per instance, so the daily cap is a soft guard.
const hits = new Map<string, number[]>();

const WINDOWS = [
  { ms: 60_000, max: 8 }, // burst
  { ms: 10 * 60_000, max: 40 },
  { ms: 24 * 60 * 60_000, max: 300 },
];

export function rateLimit(key: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const longest = WINDOWS[WINDOWS.length - 1].ms;
  const list = (hits.get(key) ?? []).filter((t) => now - t < longest);
  for (const w of WINDOWS) {
    const inWindow = list.filter((t) => now - t < w.ms);
    if (inWindow.length >= w.max) {
      return { ok: false, retryAfter: Math.ceil((inWindow[0] + w.ms - now) / 1000) };
    }
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 500) for (const k of hits.keys()) if (k !== key) { hits.delete(k); break; }
  return { ok: true };
}
