import { GARANTIE } from "./garantie";
import { wartungPreisSatz } from "./wartung";
import { describe, it, expect } from "vitest";
import { faqGroups } from "./faq";
import { questionCountPhrase } from "./prozessCheckCta";
import { STEPS } from "./prozessCheck";

describe("faq data", () => {
  it("has three themed groups in order", () => {
    expect(faqGroups.map((g) => g.theme)).toEqual([
      "Zusammenarbeit",
      "Technik & Sicherheit",
      "Kosten & Ablauf",
    ]);
  });

  it("gives every group at least one entry with question and answer", () => {
    for (const g of faqGroups) {
      expect(g.entries.length).toBeGreaterThanOrEqual(1);
      for (const e of g.entries) {
        expect(e.question).toMatch(/\S/);
        expect(e.answer).toMatch(/\S/);
      }
    }
  });

  it("has unique questions across all groups", () => {
    const questions = faqGroups.flatMap((g) => g.entries.map((e) => e.question));
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("answers what happens after the project (the long-term-partner cue)", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const after = all.find((e) => /Was passiert nach dem Projekt/i.test(e.question));
    expect(after).toBeDefined();
    expect(after!.answer).toMatch(/erreichbar|anpass/i);
  });

  it("explains the 2-week guarantee with its conditions (2026-11-11)", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const g = all.find((e) => e.question === GARANTIE.faqFrage);
    expect(g?.answer).toBe(GARANTIE.faqAntwort);
    const after = all.find((e) => /Was passiert nach dem Projekt/i.test(e.question))!;
    expect(after.answer).not.toMatch(/vollen Betrag|zurück/);
  });

  it("names the Wartung tiers from the one source (2026-11-11)", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const kosten = all.find((e) => e.question === "Fallen laufende Kosten an?")!;
    expect(kosten.answer).toContain(wartungPreisSatz());
    expect(kosten.answer).not.toMatch(/219|420|1\.019|nach Absprache/);
  });

  it("starts people with the Prozess-Check", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const start = all.find((e) => e.question === "Wie fange ich an?");
    expect(start!.answer).toMatch(/^Mit dem Prozess-Check/);
    // Review: the FAQ repeats the question count; it must follow the quiz.
    expect(start!.answer).toContain(questionCountPhrase(STEPS.length));
  });

  it("answers whether the Prozess-Check is really free", () => {
    const all = faqGroups.flatMap((g) => g.entries);
    const free = all.find((e) => e.question === "Ist der Prozess-Check wirklich kostenlos?");
    expect(free).toBeDefined();
    expect(free!.answer).toMatch(/^Ja\./);
  });
});

// Ajdin 2026-11-12: AVV + Telegram in the FAQ; every build on the client's own server.
describe("data protection answers", () => {
  const all = faqGroups.flatMap((g) => g.entries);
  it("answers the AVV question right after the data question", () => {
    const i = all.findIndex((e) => e.question === "Was passiert mit meinen Daten?");
    expect(all[i + 1].question).toBe("Unterschreibst du einen Vertrag zur Auftragsverarbeitung?");
    expect(all[i + 1].answer).toBe(
      "Ja. Verarbeitet dein System personenbezogene Daten, etwa von Kunden oder Mitarbeitern, schließen wir vor dem Start einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO. Telegram nutze ich nur, wenn du es willst. Für sensible Daten läuft dein System über E-Mail oder einen Kanal, den dein Betrieb schon nutzt.",
    );
  });
  it("never offers a cloud account instead of the client's own server", () => {
    expect(JSON.stringify(faqGroups)).not.toMatch(/Cloud-Lösung|n8n Cloud/);
  });
});
