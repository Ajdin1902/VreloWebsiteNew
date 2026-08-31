import { describe, it, expect } from "vitest";
import {
  validateEmail,
  buildSummaryEmail,
  buildInternalEmail,
  evaluateSubmission,
  type ProzessCheckFields,
} from "./prozessCheckEmail";
import type { ProzessCheckAnswers } from "./prozessCheck";

const answers: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "6bis20",
  stunden: { anfragen: 3, rechnungen: 5, daten: 1, erinnern: 0, orga: 0 },
  nervt: "rechnungen",
  abende: "staendig",
  versucht: "toolBrach",
};

describe("validateEmail", () => {
  it("rejects a malformed address", () => {
    expect(validateEmail("nope")).toBeTruthy();
  });
  it("accepts a valid address", () => {
    expect(validateEmail("a@b.de")).toBeUndefined();
  });
});

describe("buildSummaryEmail", () => {
  it("puts the summed hours in the summary and links only the Cal URL", () => {
    const m = buildSummaryEmail({ email: "a@b.de", answers, calUrl: "https://cal.eu/x" });
    expect(m.to).toBe("a@b.de");
    expect(m.html).toContain("9"); // 3+5+1
    expect(m.html).toContain("https://cal.eu/x");
    expect(m.html).not.toContain("€"); // no price ever
    expect(m.text).toContain("9");
  });
  it("falls back to a reply line when no Cal URL is configured", () => {
    const m = buildSummaryEmail({ email: "a@b.de", answers });
    expect(m.html).not.toContain("http");
  });
});

describe("buildInternalEmail", () => {
  it("shows the answers and the contact flag", () => {
    const m = buildInternalEmail({ email: "a@b.de", answers, kontaktErlaubt: true });
    expect(m.replyTo).toBe("a@b.de");
    expect(m.html).toContain("JA");
    const blocked = buildInternalEmail({ email: "a@b.de", answers, kontaktErlaubt: false });
    expect(blocked.html).toContain("nicht anschreiben");
  });
  it("escapes the lead address in HTML", () => {
    const m = buildInternalEmail({ email: '<x>@b.de', answers, kontaktErlaubt: false });
    expect(m.html).not.toContain("<x>@b.de");
  });
});

describe("evaluateSubmission", () => {
  const fields = (over: Partial<ProzessCheckFields> = {}): ProzessCheckFields => ({
    email: "a@b.de",
    honeypot: "",
    renderedAt: 0,
    answers,
    kontaktErlaubt: false,
    ...over,
  });

  it("drops a honeypot hit", () => {
    expect(evaluateSubmission(fields({ honeypot: "bot" }), 10_000).action).toBe("drop");
  });
  it("rejects a too-fast submit", () => {
    expect(evaluateSubmission(fields({ renderedAt: 9_999 }), 10_000).action).toBe("reject");
  });
  it("invalidates a bad email", () => {
    expect(evaluateSubmission(fields({ email: "nope" }), 10_000).action).toBe("invalid");
  });
  it("sends both mails on a clean submission", () => {
    const d = evaluateSubmission(fields(), 10_000, "https://cal.eu/x");
    expect(d.action).toBe("send");
    if (d.action === "send") {
      expect(d.leadEmail.to).toBe("a@b.de");
      expect(d.internalEmail.replyTo).toBe("a@b.de");
    }
  });
});
