import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { hashIp } from "@/lib/demo/ratelimit";

export const CAPS = { proAdresseTage: 30, proIpTag: 3, proTag: 50 } as const;

const MAIL_SALT = process.env.PC_HASH_SALT || "vrelo-pc-mail-v1";

function hashMail(email: string): string {
  return createHash("sha256").update(`${MAIL_SALT}:${email.trim().toLowerCase()}`).digest("hex");
}

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
