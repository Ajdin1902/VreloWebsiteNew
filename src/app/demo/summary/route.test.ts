import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { enforceLimits, create } = vi.hoisted(() => ({ enforceLimits: vi.fn(), create: vi.fn() }));

vi.mock("@/lib/demo/ratelimit", () => ({ enforceLimits }));
vi.mock("@/lib/demo/anthropic", () => ({
  getAnthropic: () => ({ messages: { create } }),
  DEMO_MODEL: "claude-haiku-4-5-20251001",
  DEMO_MAX_TOKENS: 512,
}));

import { POST } from "./route";
import { EMPTY_NOTIZ } from "@/lib/demo/summary";

const seed = { business: "Baufi", appointmentType: "baufinanzierung", tone: "locker" };
const messages = [
  { role: "user", content: "Hallo, ich heiße Alen" },
  { role: "assistant", content: "Willkommen, worum geht es?" },
];

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://vrelo-ki.de/demo/summary", {
    method: "POST",
    headers: { origin: "https://vrelo-ki.de", host: "vrelo-ki.de", "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  enforceLimits.mockReset().mockResolvedValue({ ok: true });
  create.mockReset().mockResolvedValue({
    content: [{ type: "text", text: '{"name":"Alen","anliegen":"Baufi","termin":"Mo 10:00","offenePunkte":["Unterlagen"]}' }],
  });
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /demo/summary", () => {
  it("returns the parsed Terminnotiz on success", async () => {
    const res = await POST(post({ seed, messages }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ name: "Alen", anliegen: "Baufi", termin: "Mo 10:00", offenePunkte: ["Unterlagen"] });
    expect(create).toHaveBeenCalledTimes(1);
    expect(enforceLimits).toHaveBeenCalledWith(expect.anything(), { charge: true });
  });

  it("returns EMPTY_NOTIZ (200) for an empty transcript without charging or calling the model", async () => {
    const res = await POST(post({ seed, messages: [] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(EMPTY_NOTIZ);
    expect(enforceLimits).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects cross-origin with 403", async () => {
    const res = await POST(post({ seed, messages }, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 400 on a bad body", async () => {
    const req = new Request("https://vrelo-ki.de/demo/summary", {
      method: "POST",
      headers: { origin: "https://vrelo-ki.de", host: "vrelo-ki.de", "content-type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 + does not call the model when budget is tripped", async () => {
    enforceLimits.mockResolvedValueOnce({ ok: false, reason: "budget" });
    const res = await POST(post({ seed, messages }));
    expect(res.status).toBe(429);
    expect(create).not.toHaveBeenCalled();
  });

  it("fails safe with EMPTY_NOTIZ (200) when the model throws", async () => {
    create.mockRejectedValueOnce(new Error("secret upstream detail"));
    const res = await POST(post({ seed, messages }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(EMPTY_NOTIZ);
    expect(JSON.stringify(json)).not.toContain("secret upstream detail");
  });
});
