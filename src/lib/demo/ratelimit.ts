import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { dailyBudget } from "./config";

// Salt the IP hash so the stored key is a pseudonym, not the raw address.
// A deployment can set DEMO_IP_SALT to a secret for stronger (keyed) pseudonymisation.
const IP_SALT = process.env.DEMO_IP_SALT || "vrelo-demo-rl-v1";

/**
 * Pseudonymise a client IP before it becomes a rate-limit key, so the raw
 * address is never written to Upstash. Deterministic (same IP → same key),
 * so per-IP counting still works.
 */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${IP_SALT}:${ip}`).digest("hex");
}

let redis: Redis | null = null;
let limiter: Ratelimit | null = null;

function clients(): { redis: Redis; limiter: Ratelimit } | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 h"), prefix: "demo:rl" });
  }
  return { redis: redis!, limiter: limiter! };
}

function utcDayKey(): string {
  // Stable per UTC day without Date.now surprises in tests: derive from ISO date.
  return `demo:budget:${new Date().toISOString().slice(0, 10)}`;
}

export type LimitResult = { ok: true } | { ok: false; reason: "rate" | "budget" };

/**
 * Enforce a per-IP rate limit and (when charge=true) increment + check the
 * daily model-call budget. Fails OPEN on infra errors so the demo degrades
 * gracefully rather than hard-breaking. If Upstash isn't configured, allows.
 */
export async function enforceLimits(ip: string, opts: { charge: boolean }): Promise<LimitResult> {
  const c = clients();
  if (!c) return { ok: true };
  try {
    const rl = await c.limiter.limit(hashIp(ip));
    if (!rl.success) return { ok: false, reason: "rate" };

    if (opts.charge) {
      const key = utcDayKey();
      const count = await c.redis.incr(key);
      if (count === 1) await c.redis.expire(key, 60 * 60 * 26);
      if (count > dailyBudget()) return { ok: false, reason: "budget" };
    }
    return { ok: true };
  } catch {
    return { ok: true }; // fail open
  }
}
