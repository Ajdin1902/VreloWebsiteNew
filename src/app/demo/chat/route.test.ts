import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { enforceLimits, stream } = vi.hoisted(() => ({ enforceLimits: vi.fn(), stream: vi.fn() }));

vi.mock("@/lib/demo/ratelimit", () => ({ enforceLimits }));
vi.mock("@/lib/demo/anthropic", () => ({
  getAnthropic: () => ({ messages: { stream } }),
  DEMO_MODEL: "claude-haiku-4-5-20251001",
  DEMO_MAX_TOKENS: 512,
}));

import { POST } from "./route";

const seed = { business: "Baufi", appointmentType: "baufinanzierung", tone: "locker" };
function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://vrelo-ki.de/demo/chat", {
    method: "POST",
    headers: { origin: "https://vrelo-ki.de", host: "vrelo-ki.de", "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
// A minimal fake of the SDK's streaming helper: a ReadableStream of text deltas.
function fakeStream() {
  return new ReadableStream({
    start(c) {
      c.enqueue("Hallo");
      c.close();
    },
  });
}

beforeEach(() => {
  enforceLimits.mockReset().mockResolvedValue({ ok: true });
  stream.mockReset().mockReturnValue({ toReadableStream: () => fakeStream() });
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /demo/chat", () => {
  it("streams a reply and calls Haiku with the seeded system prompt", async () => {
    const res = await POST(post({ seed, messages: [{ role: "user", content: "Hallo" }] }));
    expect(res.status).toBe(200);
    expect(stream).toHaveBeenCalledTimes(1);
    const arg = stream.mock.calls[0][0];
    expect(arg.system).toContain("Baufi");
    expect(arg.model).toContain("haiku");
  });
  it("rejects cross-origin with 403", async () => {
    const res = await POST(post({ seed, messages: [{ role: "user", content: "x" }] }, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
  it("returns 429 + does not call the model when budget is tripped", async () => {
    enforceLimits.mockResolvedValueOnce({ ok: false, reason: "budget" });
    const res = await POST(post({ seed, messages: [{ role: "user", content: "x" }] }));
    expect(res.status).toBe(429);
    expect(stream).not.toHaveBeenCalled();
  });
  it("returns a 200 stop message (not the model) once the turn cap is hit", async () => {
    const messages = Array.from({ length: 7 }, () => ({ role: "user", content: "x" }));
    const res = await POST(post({ seed, messages }));
    expect(res.status).toBe(200);
    expect(stream).not.toHaveBeenCalled();
  });
});
