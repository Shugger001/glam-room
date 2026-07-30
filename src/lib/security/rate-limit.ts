/**
 * Rate limit for abuse-prone API routes.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + TOKEN are set (durable across Vercel instances).
 * Falls back to in-memory limits for local/dev or when Redis is unset.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const memoryBucket = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const state = memoryBucket.get(key);
  if (!state || state.resetAt <= now) {
    memoryBucket.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (state.count >= max) return false;
  state.count += 1;
  memoryBucket.set(key, state);
  return true;
}

function hasUpstash(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

/** Cache limiters by max+window so callers keep existing signatures. */
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(max: number, windowMs: number): Ratelimit {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${max}:${windowSec}`;
  let limiter = upstashLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix: "glam-room",
      analytics: false,
    });
    upstashLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * @returns true if the request is allowed, false if limited
 */
export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  if (!hasUpstash()) {
    return memoryRateLimit(key, max, windowMs);
  }
  try {
    const { success } = await getUpstashLimiter(max, windowMs).limit(key);
    return success;
  } catch {
    // Fail open to memory if Redis is unreachable so bookings still work
    return memoryRateLimit(key, max, windowMs);
  }
}
