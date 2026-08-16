// src/lib/leadCheckEmail.test.ts
import { describe, it, expect } from "vitest";
import {
  buildLeadCheckEmail,
  buildLeadSummaryEmail,
  evaluateLeadCheckSubmission,
  type LeadCheckFields,
} from "./leadCheckEmail";
import { computeResult, type LeadCheckAnswers } from "./leadCheck";

const answers: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};

const good: LeadCheckFields = { email: "makler@example.de", honeypot: "", renderedAt: 0, answers, kontaktErlaubt: true };

// -> 50 % loss, 12 Abschluesse, 48.000 EUR, score "langsam"; provision defaulted
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

  it("returns both payloads with the calUrl threaded into the lead email", () => {
    const d = evaluateLeadCheckSubmission(good, 999999, "https://cal.eu/vrelo/15min");
    expect(d.action).toBe("send");
    if (d.action === "send") {
      expect(d.leadEmail.to).toBe("makler@example.de");
      expect(d.leadEmail.html).toContain("https://cal.eu/vrelo/15min");
      expect(d.internalEmail.replyTo).toBe("makler@example.de");
      expect(d.internalEmail.text).toContain("Score: langsam");
    }
  });
});

describe("booking duration", () => {
  it("promises the same call length as /makler", async () => {
    // /makler says "30 Minuten" twice; the lead-check email used to say
    // "15-Minuten-Gespräch", so a prospect who saw both was told two different
    // things about the same booking. (Rams audit 2026-08-08, M1.)
    const { makler } = await import("./makler");
    const m = buildLeadSummaryEmail({
      email: "a@b.de",
      result: computeResult(SLOW_ANSWERS),
      calUrl: "https://cal.eu/vrelo/x",
    });
    expect(makler.cta.note).toContain("30 Minuten");
    expect(makler.close.title).toContain("30 Minuten");
    expect(m.html).toContain("30-Minuten-Gespräch");
    expect(m.text).toContain("30-Minuten-Gespräch");
    expect(m.html).not.toContain("15-Minuten");
  });
});

describe("buildLeadCheckEmail (internal)", () => {
  it("carries score and € potential in the subject for a slow lead", () => {
    const m = buildLeadCheckEmail({
      email: "max@beispiel.de",
      answers: SLOW_ANSWERS,
      result: computeResult(SLOW_ANSWERS),
      kontaktErlaubt: true,
    });
    expect(m.subject).toBe("Lead-Check: max@beispiel.de, langsam · 48.000 €");
    expect(m.replyTo).toBe("max@beispiel.de");
  });

  it("tells Ajdin plainly when the lead did not consent to being contacted", () => {
    // The result form used to promise "ich melde mich, wenn du magst" with no
    // control behind it. The checkbox is that control; the internal mail is
    // where it has to be impossible to miss.
    const m = buildLeadCheckEmail({
      email: "max@beispiel.de",
      answers: SLOW_ANSWERS,
      result: computeResult(SLOW_ANSWERS),
      kontaktErlaubt: false,
    });
    expect(m.html).toContain("nicht anschreiben");
    expect(m.text).toContain("Kontakt erlaubt: NEIN");
  });

  it("marks an opted-in lead as contactable", () => {
    const m = buildLeadCheckEmail({
      email: "max@beispiel.de",
      answers: SLOW_ANSWERS,
      result: computeResult(SLOW_ANSWERS),
      kontaktErlaubt: true,
    });
    expect(m.text).toContain("Kontakt erlaubt: JA");
    expect(m.html).not.toContain("nicht anschreiben");
  });
  it("omits the € from the subject for a fast lead", () => {
    const m = buildLeadCheckEmail({ email: "a@b.de", answers: FAST_ANSWERS, result: computeResult(FAST_ANSWERS) , kontaktErlaubt: true });
    expect(m.subject).toBe("Lead-Check: a@b.de, schnell");
  });

  it("renders KPI tiles and German answer labels in the html", () => {
    const m = buildLeadCheckEmail({
      email: "max@beispiel.de",
      answers: SLOW_ANSWERS,
      result: computeResult(SLOW_ANSWERS),
      kontaktErlaubt: true,
    });
    expect(m.html).toContain("48.000");
    expect(m.html).toContain("am selben Tag");
    expect(m.html).toContain("wartet, bis ich Zeit habe");
    expect(m.html).toContain("(Standard)");
  });

  it("escapes the lead email in the html", () => {
    const m = buildLeadCheckEmail({
      email: 'x"<img>@b.de',
      answers: SLOW_ANSWERS,
      result: computeResult(SLOW_ANSWERS),
      kontaktErlaubt: true,
    });
    expect(m.html).not.toContain("<img>");
    expect(m.html).toContain("&lt;img&gt;");
  });
});

describe("buildLeadSummaryEmail", () => {
  const CAL = "https://cal.eu/vrelo/15min";

  it("puts the money figures central for a slow score (html + text)", () => {
    const m = buildLeadSummaryEmail({ email: "max@beispiel.de", result: computeResult(SLOW_ANSWERS), calUrl: CAL });
    expect(m.to).toBe("max@beispiel.de");
    expect(m.subject).toBe("Dein Ergebnis: Lead-Reaktions-Check");
    expect(m.html).toContain("12 Abschl");
    expect(m.html).toContain("48.000");
    expect(m.html).toContain("50\u00A0%");
    expect(m.text).toContain("48.000");
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
