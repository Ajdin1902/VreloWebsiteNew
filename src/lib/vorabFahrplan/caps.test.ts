import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const store = new Map<string, number>();
const ttls = new Map<string, number>();
const incr = vi.fn((k: string) => {
  const n = (store.get(k) ?? 0) + 1;
  store.set(k, n);
  return n;
});
const expire = vi.fn((k: string, t: number) => ttls.set(k, t));
// JS twin of CAPS_SCRIPT in caps.ts. It has no await inside, so like a Redis
// script it runs as one atomic step even when calls overlap.
const evalScript = vi.fn(async (_script: string, keys: string[], args: (string | number)[]) => {
  const n = keys.length;
  for (let i = 0; i < n; i++) if ((store.get(keys[i]) ?? 0) >= Number(args[i])) return i + 1;
  for (let i = 0; i < n; i++) {
    const c = incr(keys[i]);
    if (c === 1 || !ttls.has(keys[i])) expire(keys[i], Number(args[n + i]));
  }
  return 0;
});

const redisCmd = {
  incr: vi.fn(async (k: string) => incr(k)),
  decr: vi.fn(async (k: string) => {
    const n = (store.get(k) ?? 0) - 1;
    store.set(k, n);
    return n;
  }),
  ttl: vi.fn(async (k: string) => (!store.has(k) ? -2 : ttls.has(k) ? ttls.get(k)! : -1)),
  expire: vi.fn(async (k: string, t: number) => (expire(k, t), 1)),
  set: vi.fn(async (k: string, v: number, o: { nx?: boolean; ex?: number }) => {
    if (o.nx && store.has(k)) return null;
    store.set(k, v);
    if (o.ex) ttls.set(k, o.ex);
    return "OK";
  }),
  del: vi.fn(async (k: string) => (ttls.delete(k), store.delete(k) ? 1 : 0)),
};

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(function (this: Record<string, unknown>) {
    this.eval = evalScript;
    Object.assign(this, redisCmd);
  }),
}));

import { checkResearchCaps, checkSendCaps, CAPS, releaseResearch, RESEARCH_CAPS } from "./caps";

beforeEach(() => {
  store.clear();
  ttls.clear();
  evalScript.mockClear();
  incr.mockClear();
  expire.mockClear();
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
});
afterEach(() => vi.unstubAllEnvs());

describe("checkSendCaps", () => {
  it("exports the spec caps", () => {
    expect(CAPS).toEqual({ proAdresseTage: 30, proIpTag: 3, proTag: 50 });
  });

  it("allows the first send and sets TTLs", async () => {
    expect(await checkSendCaps({ ip: "1.2.3.4", email: "a@b.de" })).toEqual({ ok: true });
    expect(expire).toHaveBeenCalledTimes(3);
    expect(expire.mock.calls.map((c) => c[1])).toEqual([2592000, 86400, 93600]);
  });

  it("does not call expire again when a TTL exists", async () => {
    await checkSendCaps({ ip: "1.2.3.4", email: "a@b.de" });
    expire.mockClear();
    await checkSendCaps({ ip: "1.2.3.4", email: "c@b.de" });
    // only the address key is new; ip and day keys already have a TTL
    expect(expire).toHaveBeenCalledTimes(1);
  });

  it("re-applies a TTL to a key left without one", async () => {
    await checkSendCaps({ ip: "1.2.3.4", email: "a@b.de" });
    const ipKey = [...ttls.keys()].find((k) => k.startsWith("pc:ip:"))!;
    ttls.delete(ipKey);
    expire.mockClear();
    await checkSendCaps({ ip: "1.2.3.4", email: "c@b.de" });
    expect(expire).toHaveBeenCalledWith(ipKey, 86400);
  });

  it.each(["", "  ", "unknown"])("skips the IP cap for ip %j", async (ip) => {
    for (let i = 0; i < 4; i++) {
      expect(await checkSendCaps({ ip, email: `u${i}@b.de` })).toEqual({ ok: true });
    }
    expect([...store.keys()].some((k) => k.startsWith("pc:ip:"))).toBe(false);
  });

  it("blocks a second send to the same address (case/space-insensitive)", async () => {
    await checkSendCaps({ ip: "1.1.1.1", email: "a@b.de" });
    const r = await checkSendCaps({ ip: "2.2.2.2", email: "  A@B.de " });
    expect(r).toEqual({ ok: false, grund: "adresse" });
  });

  it("blocks the 4th send from one IP", async () => {
    for (let i = 0; i < 3; i++) {
      expect(await checkSendCaps({ ip: "1.2.3.4", email: `u${i}@b.de` })).toEqual({ ok: true });
    }
    expect(await checkSendCaps({ ip: "1.2.3.4", email: "u3@b.de" })).toEqual({ ok: false, grund: "ip" });
  });

  it("blocks the 51st send of the day", async () => {
    for (let i = 0; i < 50; i++) {
      expect(await checkSendCaps({ ip: `10.0.0.${i}`, email: `u${i}@b.de` })).toEqual({ ok: true });
    }
    expect(await checkSendCaps({ ip: "10.9.9.9", email: "x@b.de" })).toEqual({ ok: false, grund: "tag" });
  });

  it("does not count anything when blocked", async () => {
    await checkSendCaps({ ip: "1.1.1.1", email: "a@b.de" });
    incr.mockClear();
    await checkSendCaps({ ip: "2.2.2.2", email: "a@b.de" });
    expect(incr).not.toHaveBeenCalled();
  });

  it("allows when env is missing", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    expect(await checkSendCaps({ ip: "1.2.3.4", email: "a@b.de" })).toEqual({ ok: true });
  });

  it("fails open when the script call throws", async () => {
    evalScript.mockRejectedValueOnce(new Error("net"));
    expect(await checkSendCaps({ ip: "1.2.3.4", email: "a@b.de" })).toEqual({ ok: true });
  });

  it("parallel sends to one address: exactly one gets through", async () => {
    const r = await Promise.all(Array.from({ length: 5 }, (_, i) => checkSendCaps({ ip: `10.0.0.${i}`, email: "a@b.de" })));
    expect(r.filter((x) => x.ok)).toHaveLength(1);
    expect(r.filter((x) => !x.ok)).toEqual(Array(4).fill({ ok: false, grund: "adresse" }));
  });

  it("reports the first cap in the order adresse, ip, tag", async () => {
    for (let i = 0; i < 3; i++) await checkSendCaps({ ip: "1.2.3.4", email: `u${i}@b.de` });
    // address and IP both over: adresse wins
    expect(await checkSendCaps({ ip: "1.2.3.4", email: "u0@b.de" })).toEqual({ ok: false, grund: "adresse" });
  });

  it("never puts the raw e-mail or IP in a key", async () => {
    await checkSendCaps({ ip: "203.0.113.7", email: "Max@Firma.de" });
    const keys = evalScript.mock.calls.flatMap((c) => c[1]).map(String);
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) {
      expect(k).not.toContain("203.0.113.7");
      expect(k.toLowerCase()).not.toContain("firma");
    }
    expect(keys.some((k) => /^pc:mail:[0-9a-f]{64}$/.test(k))).toBe(true);
  });
});

describe("checkResearchCaps", () => {
  const dayKey = () => `pc:research:${new Date().toISOString().slice(0, 10)}`;

  it("exports the spec caps", () => {
    expect(RESEARCH_CAPS).toEqual({ proTag: 25, frischTage: 30 });
  });

  it("the first run is fresh, sets the day TTL and the 30-day fresh key", async () => {
    expect(await checkResearchCaps("a@b.de")).toEqual({ research: true, frisch: true });
    expect(ttls.get(dayKey())).toBe(93600);
    const fresh = [...store.keys()].find((k) => k.startsWith("pc:fresh:"))!;
    expect(fresh).toMatch(/^pc:fresh:[0-9a-f]{64}$/);
    expect(ttls.get(fresh)).toBe(2592000);
  });

  it("a second run from the same address within 30 days is not fresh", async () => {
    await checkResearchCaps("a@b.de");
    expect(await checkResearchCaps("  A@B.de ")).toEqual({ research: true, frisch: false });
  });

  it("the 26th research of the day is refused with grund tag and not counted", async () => {
    for (let i = 0; i < 25; i++) expect((await checkResearchCaps(`u${i}@b.de`)).research).toBe(true);
    expect(await checkResearchCaps("x@b.de")).toEqual({ research: false, frisch: false, grund: "tag" });
    expect(store.get(dayKey())).toBe(25);
    // A refused run leaves no fresh key behind.
    expect(await checkResearchCaps("x@b.de")).toMatchObject({ research: false });
  });

  it("re-applies a TTL to a day key left without one", async () => {
    await checkResearchCaps("a@b.de");
    ttls.delete(dayKey());
    await checkResearchCaps("c@b.de");
    expect(ttls.get(dayKey())).toBe(93600);
  });

  it("fails closed: no Upstash or a Redis error means no research", async () => {
    redisCmd.incr.mockRejectedValueOnce(new Error("net"));
    expect(await checkResearchCaps("a@b.de")).toEqual({ research: false, frisch: false, grund: "speicher" });
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    expect(await checkResearchCaps("a@b.de")).toEqual({ research: false, frisch: false, grund: "speicher" });
  });

  it("gives the slot back when a step after INCR throws", async () => {
    redisCmd.set.mockRejectedValueOnce(new Error("net"));
    expect(await checkResearchCaps("a@b.de")).toEqual({ research: false, frisch: false, grund: "speicher" });
    expect(store.get(dayKey())).toBe(0);
  });

  it("releaseResearch gives back the day slot and, if it was set, the fresh key", async () => {
    await checkResearchCaps("a@b.de");
    await releaseResearch("a@b.de", true);
    expect(store.get(dayKey())).toBe(0);
    expect([...store.keys()].some((k) => k.startsWith("pc:fresh:"))).toBe(false);
    expect(await checkResearchCaps("a@b.de")).toEqual({ research: true, frisch: true });
    // Not fresh: the older fresh key stays.
    await checkResearchCaps("a@b.de");
    await releaseResearch("a@b.de", false);
    expect([...store.keys()].some((k) => k.startsWith("pc:fresh:"))).toBe(true);
  });

  it("never puts the raw e-mail in a key", async () => {
    await checkResearchCaps("Max@Firma.de");
    for (const k of store.keys()) expect(k.toLowerCase()).not.toContain("firma");
  });
});
