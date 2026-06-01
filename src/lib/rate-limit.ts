/**
 * Simple in-memory rate limiter for Vercel serverless functions.
 *
 * Each IP is allowed `limit` requests per `windowMs` interval.
 * The store auto-prunes expired entries to prevent memory leaks.
 *
 * Note: On Vercel, each serverless function instance has its own memory,
 * so this isn't globally shared across instances. It still provides good
 * protection against single-source abuse. For stricter global limiting,
 * swap in Vercel KV or Upstash Redis.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Prune expired entries every 60 s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

export function rateLimit(
  ip: string,
  { limit = 3, windowMs = 60_000 } = {}
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { ok: false, remaining: 0 };
  }

  return { ok: true, remaining: limit - entry.count };
}
