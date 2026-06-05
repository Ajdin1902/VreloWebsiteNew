// src/lib/newsletter.evaluate.test.ts
import { describe, it, expect } from "vitest";
import { evaluateSignup, type NewsletterFields } from "./newsletter";
import { MIN_FILL_MS } from "./contact";

const base: NewsletterFields = { email: "a@b.de", consent: true, honeypot: "", renderedAt: 0 };

describe("evaluateSignup", () => {
  const now = 1_000_000 + MIN_FILL_MS + 1;

  it("drops when honeypot filled", () => {
    expect(evaluateSignup({ ...base, honeypot: "x" }, now)).toEqual({ action: "drop" });
  });
  it("rejects when too fast", () => {
    expect(evaluateSignup({ ...base, renderedAt: now }, now + 10).action).toBe("reject");
  });
  it("invalid for bad email / missing consent", () => {
    const r = evaluateSignup({ ...base, email: "nope", consent: false }, now);
    expect(r.action).toBe("invalid");
    if (r.action === "invalid") {
      expect(r.errors.email).toBeTruthy();
      expect(r.errors.consent).toBeTruthy();
    }
  });
  it("send with the trimmed email for a clean signup", () => {
    const r = evaluateSignup({ ...base, email: " a@b.de " }, now);
    expect(r).toEqual({ action: "send", email: "a@b.de" });
  });
});
