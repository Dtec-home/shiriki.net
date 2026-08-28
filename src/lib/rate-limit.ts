/**
 * In-memory, fixed-window rate limiter.
 *
 * IMPORTANT: this state lives in a plain `Map` inside the current process.
 * It is per-instance only — it does NOT coordinate across multiple
 * serverless/edge instances or regions, and it resets on every redeploy or
 * cold start. That is an acceptable basic anti-spam deterrent for a single
 * small deployment, but for multi-region production traffic this should be
 * replaced with a shared store such as Upstash Redis or Vercel KV, keyed the
 * same way (`checkRateLimit(ip)` → a Redis `INCR` + `EXPIRE`).
 */

type Bucket = {
  count: number
  windowStart: number
}

export type RateLimitResult = {
  ok: boolean
  /** Present only when `ok` is false — how long the caller should wait. */
  retryAfterSeconds?: number
}

const buckets = new Map<string, Bucket>()

/** How often (in ms) to sweep expired buckets so the Map can't grow forever. */
const PRUNE_INTERVAL_MS = 5 * 60_000
let lastPruneAt = Date.now()

function pruneExpired(now: number, windowMs: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= windowMs) {
      buckets.delete(key)
    }
  }
  lastPruneAt = now
}

/**
 * Fixed-window rate limit check. Each distinct `key` (e.g. a client IP, or
 * `${ip}:${formName}`) gets its own counter that resets `windowMs` after the
 * first request in the window.
 */
export function checkRateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now()

  // Opportunistic pruning — piggybacks on real requests instead of a timer,
  // so it works the same in serverless and long-lived server environments.
  if (now - lastPruneAt > PRUNE_INTERVAL_MS) {
    pruneExpired(now, windowMs)
  }

  const bucket = buckets.get(key)

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return { ok: true }
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.windowStart + windowMs - now) / 1000))
    return { ok: false, retryAfterSeconds }
  }

  bucket.count += 1
  return { ok: true }
}
