// src/lib/leadCheckEmail.test.ts
import { describe, it, expect } from "vitest";
import { evaluateLeadCheckSubmission, type LeadCheckFields } from "./leadCheckEmail";
import type { LeadCheckAnswers } from "./leadCheck";

const answers: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};

const good: LeadCheckFields = { email: "makler@example.de", honeypot: "", renderedAt: 0, answers };

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
