import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { hashIp } from "@/lib/demo/ratelimit";
import { CAPS, RESEARCH_CAPS } from "./content";

export { CAPS, RESEARCH_CAPS };

const MAIL_SALT = process.env.PC_HASH_SALT || "vrelo-pc-mail-v1";

function hashMail(email: string): string {
  return createHash("sha256").update(`${MAIL_SALT}:${email.trim().toLowerCase()}`).digest("hex");
}

/** The Upstash client, or null when the env is missing. Shared with job.ts. */
export function redisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const utcDay = () => new Date().toISOString().slice(0, 10);

export type CapResult = { ok: true } | { ok: false; grund: "adresse" | "ip" | "tag" };

// KEYS[i] has the cap ARGV[i] and the TTL ARGV[n + i]. Returns the 1-based index
// of the first key at its cap (nothing counted), else counts all and returns 0.
// One script = one atomic step in Redis, so parallel sends cannot slip past a cap.
// A key left without TTL (TTL -1) gets it back on the next send.
const CAPS_SCRIPT = `
local n = #KEYS
for i = 1, n do
  if tonumber(redis.call("GET", KEYS[i]) or "0") >= tonumber(ARGV[i]) then return i end
end
for i = 1, n do
  if redis.call("INCR", KEYS[i]) == 1 or redis.call("TTL", KEYS[i]) == -1 then
    redis.call("EXPIRE", KEYS[i], ARGV[n + i])
  end
end
return 0
`;

/**
 * Check-then-count in one atomic call: blocks (without counting) if one
 * counter is at its cap, else increments all of them. Fails open.
 */
export async function checkSendCaps(x: { ip: string; email: string }): Promise<CapResult> {
  const redis = redisClient();
  if (!redis) return { ok: true };
  try {
    const day = utcDay();
    // Unknown IP would share one bucket and lock everyone out: skip the IP cap then.
    const ipKnown = !["", "unknown"].includes(x.ip.trim().toLowerCase());
    // Address and IP windows are fixed from the first send, not rolling.
    const checks = [
      { key: `pc:mail:${hashMail(x.email)}`, max: 1, ttl: CAPS.proAdresseTage * 86400, grund: "adresse" as const },
      ...(ipKnown ? [{ key: `pc:ip:${hashIp(x.ip)}`, max: CAPS.proIpTag, ttl: 86400, grund: "ip" as const }] : []),
      { key: `pc:day:${day}`, max: CAPS.proTag, ttl: 26 * 3600, grund: "tag" as const },
    ];
    const hit = await redis.eval<number[], number>(
      CAPS_SCRIPT,
      checks.map((c) => c.key),
      [...checks.map((c) => c.max), ...checks.map((c) => c.ttl)],
    );
    const capped = checks[Number(hit) - 1];
    return capped ? { ok: false, grund: capped.grund } : { ok: true };
  } catch {
    return { ok: true };
  }
}

export type ResearchCapResult = { research: true; frisch: boolean } | { research: false; frisch: false; grund: "tag" | "speicher" };

const researchDayKey = () => `pc:research:${utcDay()}`;
const freshKey = (email: string) => `pc:fresh:${hashMail(email)}`;

/**
 * Reserves one of the 25 research runs of the UTC day (INCR is atomic, so no
 * read/increment race) and claims fresh research for this address once per
 * 30 days (SET NX). Fails closed: no Upstash or an error means no research.
 * The action calls releaseResearch when the hand-off to n8n fails, so only
 * handed-off runs stay counted.
 */
export async function checkResearchCaps(email: string): Promise<ResearchCapResult> {
  const redis = redisClient();
  if (!redis) return { research: false, frisch: false, grund: "speicher" };
  try {
    const key = researchDayKey();
    const n = await redis.incr(key);
    if (n === 1 || (await redis.ttl(key)) === -1) await redis.expire(key, 26 * 3600);
    if (n > RESEARCH_CAPS.proTag) {
      await redis.decr(key);
      return { research: false, frisch: false, grund: "tag" };
    }
    const frisch = (await redis.set(freshKey(email), 1, { nx: true, ex: RESEARCH_CAPS.frischTage * 86400 })) === "OK";
    return { research: true, frisch };
  } catch {
    return { research: false, frisch: false, grund: "speicher" };
  }
}

/** Gives back what checkResearchCaps took for a run that never reached n8n. */
export async function releaseResearch(email: string, frisch: boolean): Promise<void> {
  const redis = redisClient();
  if (!redis) return;
  try {
    await redis.decr(researchDayKey());
    if (frisch) await redis.del(freshKey(email));
  } catch {
    // The slot stays taken: one research run fewer today, nothing worse.
  }
}
