import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { enforceLimits, safeFetchText, create } = vi.hoisted(() => ({
  enforceLimits: vi.fn(),
  safeFetchText: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/demo/ratelimit", () => ({ enforceLimits }));
vi.mock("@/lib/demo/fetchGuard", async (orig) => ({ ...(await orig<object>()), safeFetchText }));
vi.mock("@/lib/demo/anthropic", () => ({
  getAnthropic: () => ({ messages: { create } }),
  DEMO_MODEL: "claude-haiku-4-5-20251001",
  DEMO_MAX_TOKENS: 512,
}));

import { POST } from "./route";

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://vrelo-ki.de/demo/extract", {
    method: "POST",
    headers: { origin: "https://vrelo-ki.de", host: "vrelo-ki.de", "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  enforceLimits.mockReset().mockResolvedValue({ ok: true });
  safeFetchText.mockReset().mockResolvedValue("Baufinanzierung für junge Familien in Regensburg.");
  create.mockReset().mockResolvedValue({
    content: [{ type: "text", text: JSON.stringify({ business: "Baufinanzierung für Familien", appointmentType: "baufinanzierung", tone: "locker" }) }],
  });
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /demo/extract", () => {
  it("returns a sanitized partial seed on success", async () => {
    const res = await POST(post({ url: "https://kunde.de" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.appointmentType).toBe("baufinanzierung");
    expect(json.business).toContain("Baufinanzierung");
  });
  it("rejects cross-origin", async () => {
    const res = await POST(post({ url: "https://kunde.de" }, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });
  it("returns 429 when rate-limited", async () => {
    enforceLimits.mockResolvedValueOnce({ ok: false, reason: "rate" });
    const res = await POST(post({ url: "https://kunde.de" }));
    expect(res.status).toBe(429);
  });
  it("returns a soft empty seed (200) when the fetch is blocked/weak, so the UI falls back", async () => {
    safeFetchText.mockRejectedValueOnce(new Error("blocked-ip"));
    const res = await POST(post({ url: "http://169.254.169.254" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.business).toBe("");
  });
  it("never leaks the model error body to the client", async () => {
    create.mockRejectedValueOnce(new Error("secret upstream detail"));
    const res = await POST(post({ url: "https://kunde.de" }));
    const json = await res.json();
    expect(JSON.stringify(json)).not.toContain("secret upstream detail");
  });
});
