import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const limit = vi.fn();
const incr = vi.fn();
const expire = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(function (this: Record<string, unknown>) {
    this.incr = incr;
    this.expire = expire;
  }),
}));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    vi.fn(function (this: Record<string, unknown>) {
      this.limit = limit;
    }),
    { slidingWindow: vi.fn(() => ({})) },
  ),
}));

import { enforceLimits, hashIp } from "./ratelimit";

beforeEach(() => {
  limit.mockReset().mockResolvedValue({ success: true });
  incr.mockReset().mockResolvedValue(1);
  expire.mockReset().mockResolvedValue(1);
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
  vi.stubEnv("DEMO_DAILY_BUDGET", "500");
});
afterEach(() => vi.unstubAllEnvs());

describe("enforceLimits", () => {
  it("allows a normal request", async () => {
    const r = await enforceLimits("1.2.3.4", { charge: true });
    expect(r.ok).toBe(true);
  });
  it("keys the limiter by the hashed IP, never the raw address", async () => {
    await enforceLimits("1.2.3.4", { charge: true });
    expect(limit).toHaveBeenCalledWith(hashIp("1.2.3.4"));
    expect(limit).not.toHaveBeenCalledWith("1.2.3.4");
  });
  it("blocks when the per-IP limiter is exhausted", async () => {
    limit.mockResolvedValueOnce({ success: false });
    const r = await enforceLimits("1.2.3.4", { charge: true });
    expect(r).toEqual({ ok: false, reason: "rate" });
  });
  it("blocks when the daily budget ceiling is exceeded", async () => {
    incr.mockResolvedValueOnce(501);
    const r = await enforceLimits("1.2.3.4", { charge: true });
    expect(r).toEqual({ ok: false, reason: "budget" });
  });
  it("does not charge the budget when charge is false (extract pre-check)", async () => {
    await enforceLimits("1.2.3.4", { charge: false });
    expect(incr).not.toHaveBeenCalled();
  });
  it("fails open (allows) if Upstash is unreachable, so the demo never hard-breaks", async () => {
    limit.mockRejectedValueOnce(new Error("network"));
    const r = await enforceLimits("1.2.3.4", { charge: true });
    expect(r.ok).toBe(true);
  });
});

describe("hashIp", () => {
  it("returns a 64-char hex SHA-256 digest", () => {
    expect(hashIp("203.0.113.7")).toMatch(/^[0-9a-f]{64}$/);
  });
  it("is deterministic — the same IP maps to the same key (counting still works)", () => {
    expect(hashIp("203.0.113.7")).toBe(hashIp("203.0.113.7"));
  });
  it("maps different IPs to different keys", () => {
    expect(hashIp("203.0.113.7")).not.toBe(hashIp("203.0.113.8"));
  });
  it("never leaks the raw IP into the key", () => {
    expect(hashIp("203.0.113.7")).not.toContain("203.0.113.7");
  });
});
