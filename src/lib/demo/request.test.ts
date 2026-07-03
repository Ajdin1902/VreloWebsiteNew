import { describe, it, expect } from "vitest";
import { isSameOrigin, clientIp } from "./request";

function req(headers: Record<string, string>): Request {
  return new Request("https://vrelo-ki.de/demo/chat", { method: "POST", headers });
}

describe("isSameOrigin", () => {
  it("accepts a same-origin request", () => {
    expect(isSameOrigin(req({ origin: "https://vrelo-ki.de", host: "vrelo-ki.de" }))).toBe(true);
  });
  it("rejects a cross-origin request", () => {
    expect(isSameOrigin(req({ origin: "https://evil.example", host: "vrelo-ki.de" }))).toBe(false);
  });
  it("accepts when origin is absent but referer matches host (older clients)", () => {
    expect(isSameOrigin(req({ referer: "https://vrelo-ki.de/demo", host: "vrelo-ki.de" }))).toBe(true);
  });
  it("rejects when neither origin nor referer is present", () => {
    expect(isSameOrigin(req({ host: "vrelo-ki.de" }))).toBe(false);
  });
});

describe("clientIp", () => {
  it("reads the first x-forwarded-for hop", () => {
    expect(clientIp(req({ "x-forwarded-for": "9.9.9.9, 10.0.0.1", host: "x" }))).toBe("9.9.9.9");
  });
  it("falls back to a constant when absent", () => {
    expect(clientIp(req({ host: "x" }))).toBe("unknown");
  });
});
