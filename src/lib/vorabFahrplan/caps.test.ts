import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const store = new Map<string, number>();
const get = vi.fn(async (k: string) => store.get(k) ?? null);
const incr = vi.fn(async (k: string) => {
  const n = (store.get(k) ?? 0) + 1;
  store.set(k, n);
  return n;
});
const ttls = new Map<string, number>();
const expire = vi.fn(async (k: string, t: number) => {
  ttls.set(k, t);
  return 1;
});
const ttl = vi.fn(async (k: string) => ttls.get(k) ?? -1);

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(function (this: Record<string, unknown>) {
    this.get = get;
    this.incr = incr;
    this.expire = expire;
    this.ttl = ttl;
  }),
}));

import { checkSendCaps, CAPS } from "./caps";

beforeEach(() => {
  store.clear();
  ttls.clear();
  ttl.mockClear();
  get.mockClear();
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

  it("fails open when incr throws", async () => {
    incr.mockRejectedValueOnce(new Error("net"));
    expect(await checkSendCaps({ ip: "1.2.3.4", email: "a@b.de" })).toEqual({ ok: true });
  });

  it("never puts the raw e-mail or IP in a key", async () => {
    await checkSendCaps({ ip: "203.0.113.7", email: "Max@Firma.de" });
    const keys = [...incr.mock.calls, ...get.mock.calls].map((c) => String(c[0]));
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) {
      expect(k).not.toContain("203.0.113.7");
      expect(k.toLowerCase()).not.toContain("firma");
    }
    expect(keys.some((k) => /^pc:mail:[0-9a-f]{64}$/.test(k))).toBe(true);
  });
});
