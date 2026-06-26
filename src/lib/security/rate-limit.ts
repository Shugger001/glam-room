const bucket = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const state = bucket.get(key);
  if (!state || state.resetAt <= now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (state.count >= max) return false;
  state.count += 1;
  bucket.set(key, state);
  return true;
}
