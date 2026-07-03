import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(function (this: Record<string, unknown>, opts: { apiKey: string }) {
    this.apiKey = opts.apiKey;
  }),
}));

import { getAnthropic, DEMO_MODEL, DEMO_MAX_TOKENS } from "./anthropic";

afterEach(() => vi.unstubAllEnvs());

describe("getAnthropic", () => {
  it("returns null when no key is set", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(getAnthropic()).toBeNull();
  });
  it("constructs a client when the key is set", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    expect(getAnthropic()).not.toBeNull();
  });
  it("uses Haiku with a capped token budget", () => {
    expect(DEMO_MODEL).toContain("haiku");
    expect(DEMO_MAX_TOKENS).toBeLessThanOrEqual(1024);
  });
});
