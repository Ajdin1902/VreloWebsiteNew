// src/lib/leadCheckEmail.test.ts
import { describe, it, expect } from "vitest";
import { buildLeadSummaryEmail, evaluateLeadCheckSubmission, type LeadCheckFields } from "./leadCheckEmail";
import { computeResult, type LeadCheckAnswers } from "./leadCheck";

const answers: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};

const good: LeadCheckFields = { email: "makler@example.de", honeypot: "", renderedAt: 0, answers };

// -> 50 % loss, 42 Abschluesse, 168.000 EUR, score "langsam"; provision defaulted
const SLOW_ANSWERS: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
};

// -> score "schnell"
const FAST_ANSWERS: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "unter5min",
  abendsWochenende: "immer",
  imTermin: "automatisch",
  nachfassen: "mehrmals",
};

describe("evaluateLeadCheckSubmission", () => {
  it("drops a honeypot hit", () => {
    expect(evaluateLeadCheckSubmission({ ...good, honeypot: "x" }, 999999).action).toBe("drop");
  });

  it("rejects a too-fast submission", () => {
    const d = evaluateLeadCheckSubmission({ ...good, renderedAt: 1000 }, 1500);
    expect(d.action).toBe("reject");
  });

  it("flags an invalid email", () => {
    const d = evaluateLeadCheckSubmission({ ...good, email: "nope" }, 999999);
    expect(d.action).toBe("invalid");
  });

  it("builds the email with the recomputed result and answers", () => {
    const d = evaluateLeadCheckSubmission(good, 999999);
    expect(d.action).toBe("send");
    if (d.action === "send") {
      expect(d.email.replyTo).toBe("makler@example.de");
      expect(d.email.text).toContain("Score: langsam");
      expect(d.email.text).toContain("168000");
      expect(d.email.text).toContain("Reaktionszeit: selberTag");
    }
  });
});

describe("buildLeadSummaryEmail", () => {
  const CAL = "https://cal.eu/vrelo/15min";

  it("puts the money figures central for a slow score (html + text)", () => {
    const m = buildLeadSummaryEmail({ email: "max@beispiel.de", result: computeResult(SLOW_ANSWERS), calUrl: CAL });
    expect(m.to).toBe("max@beispiel.de");
    expect(m.subject).toBe("Dein Ergebnis: Lead-Reaktions-Check");
    expect(m.html).toContain("42 Abschl");
    expect(m.html).toContain("168.000");
    expect(m.html).toContain("50\u00A0%");
    expect(m.text).toContain("168.000");
    expect(m.html).toContain(CAL);
  });

  it("shows the default-provision fine print only when provision was defaulted", () => {
    const def = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(SLOW_ANSWERS), calUrl: CAL });
    expect(def.html).toContain("Branchenschnitt");
    const custom = buildLeadSummaryEmail({
      email: "a@b.de",
      result: computeResult({ ...SLOW_ANSWERS, provision: 2500 }),
      calUrl: CAL,
    });
    expect(custom.html).not.toContain("Branchenschnitt");
    expect(custom.html).toContain("2.500");
  });

  it("makes no money promise for a fast score", () => {
    const m = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(FAST_ANSWERS), calUrl: CAL });
    expect(m.html).toContain("Du reagierst schon schnell.");
    expect(m.html).not.toContain("€");
    expect(m.text).not.toContain("€");
    expect(m.html).toContain("Tempo absichern");
    expect(m.html).toContain(CAL); // CTA band stays
  });

  it("falls back to a reply line when no calUrl is configured", () => {
    const m = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(SLOW_ANSWERS) });
    expect(m.html).not.toContain("<a ");
    expect(m.html).toContain("Antworte einfach auf diese E-Mail");
  });

  it("contains no site links", () => {
    const m = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(SLOW_ANSWERS), calUrl: CAL });
    expect(m.html).not.toContain("vercel.app");
    expect(m.text).not.toContain("vercel.app");
  });
});
