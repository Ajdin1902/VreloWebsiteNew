import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { hashIp } from "@/lib/demo/ratelimit";

export const CAPS = { proAdresseTage: 30, proIpTag: 3, proTag: 50 } as const;

const MAIL_SALT = process.env.PC_HASH_SALT || "vrelo-pc-mail-v1";

function hashMail(email: string): string {
  return createHash("sha256").update(`${MAIL_SALT}:${email.trim().toLowerCase()}`).digest("hex");
}

export type CapResult = { ok: true } | { ok: false; grund: "adresse" | "ip" | "tag" };

/**
 * Check-then-count in one call: reads the three counters, blocks (without
 * counting) if one is at its cap, else increments all three. Fails open.
 */
export async function checkSendCaps(x: { ip: string; email: string }): Promise<CapResult> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return { ok: true };
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const day = new Date().toISOString().slice(0, 10);
    // Unknown IP would share one bucket and lock everyone out: skip the IP cap then.
    const ipKnown = !["", "unknown"].includes(x.ip.trim().toLowerCase());
    // Address and IP windows are fixed from the first send, not rolling.
    const checks = [
      { key: `pc:mail:${hashMail(x.email)}`, max: 1, ttl: CAPS.proAdresseTage * 86400, grund: "adresse" as const },
      ...(ipKnown ? [{ key: `pc:ip:${hashIp(x.ip)}`, max: CAPS.proIpTag, ttl: 86400, grund: "ip" as const }] : []),
      { key: `pc:day:${day}`, max: CAPS.proTag, ttl: 26 * 3600, grund: "tag" as const },
    ];
    const counts = await Promise.all(checks.map((c) => redis.get<number>(c.key)));
    const hit = checks.find((c, i) => Number(counts[i] ?? 0) >= c.max);
    if (hit) return { ok: false, grund: hit.grund };
    // Small race between read and increment is accepted (caps are abuse brakes, not exact quotas).
    for (const c of checks) {
      const n = await redis.incr(c.key);
      // A crash between INCR and EXPIRE would leave a key without TTL: heal it on the next send.
      if (n === 1 || (await redis.ttl(c.key)) === -1) await redis.expire(c.key, c.ttl);
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}
