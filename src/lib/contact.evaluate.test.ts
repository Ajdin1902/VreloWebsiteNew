// src/lib/contact.evaluate.test.ts
import { describe, it, expect } from "vitest";
import { buildContactEmail, evaluateSubmission, MIN_FILL_MS, type ContactFields } from "./contact";

const base: ContactFields = {
  name: "Aydin", email: "a@b.de", message: "Worum es geht.",
  company: "", consent: true, honeypot: "", renderedAt: 0,
};

describe("buildContactEmail", () => {
  it("builds subject, plain-text body and replyTo; omits empty Betrieb", () => {
    const e = buildContactEmail({ name: "Aydin", email: "a@b.de", message: "Hi", company: "" });
    expect(e.replyTo).toBe("a@b.de");
    expect(e.subject).toMatch(/Anfrage/);
    expect(e.text).toContain("Aydin");
    expect(e.text).toContain("Hi");
    expect(e.text).not.toContain("Betrieb:");
  });
  it("includes Betrieb when provided", () => {
    expect(buildContactEmail({ name: "A", email: "a@b.de", message: "Hi", company: "Bäckerei" }).text)
      .toContain("Betrieb: Bäckerei");
  });
});

describe("evaluateSubmission", () => {
  const now = 1_000_000 + MIN_FILL_MS + 1; // far enough past renderedAt:0

  it("drops when honeypot is filled", () => {
    expect(evaluateSubmission({ ...base, honeypot: "x" }, now)).toEqual({ action: "drop" });
  });
  it("rejects when submitted too fast", () => {
    const r = evaluateSubmission({ ...base, renderedAt: now }, now + 10);
    expect(r.action).toBe("reject");
  });
  it("returns invalid with errors for bad input", () => {
    const r = evaluateSubmission({ ...base, email: "nope" }, now);
    expect(r.action).toBe("invalid");
    if (r.action === "invalid") expect(r.errors.email).toBeTruthy();
  });
  it("returns send with the built email for a clean submission", () => {
    const r = evaluateSubmission(base, now);
    expect(r.action).toBe("send");
    if (r.action === "send") expect(r.email.replyTo).toBe("a@b.de");
  });
});
