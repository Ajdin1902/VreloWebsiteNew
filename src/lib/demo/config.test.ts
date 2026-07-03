import { describe, it, expect, afterEach, vi } from "vitest";
import { isDemoConfigured, dailyBudget } from "./config";

afterEach(() => vi.unstubAllEnvs());

describe("isDemoConfigured", () => {
  it("is false without an API key", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(isDemoConfigured()).toBe(false);
  });
  it("is true with an API key", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    expect(isDemoConfigured()).toBe(true);
  });
});

describe("dailyBudget", () => {
  it("defaults to 500 when unset or invalid", () => {
    vi.stubEnv("DEMO_DAILY_BUDGET", "");
    expect(dailyBudget()).toBe(500);
  });
  it("reads a numeric override", () => {
    vi.stubEnv("DEMO_DAILY_BUDGET", "1200");
    expect(dailyBudget()).toBe(1200);
  });
});
