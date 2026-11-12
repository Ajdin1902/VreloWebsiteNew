import { GARANTIE } from "./garantie";
import { wartungPreisPunkte } from "./wartung";
import { describe, it, expect } from "vitest";
import { faqGroups } from "./faq";
import { findCopyIssues } from "./ratgeberCopy";

const all = faqGroups.flatMap((g) => g.entries);
const entry = (q: string) => all.find((e) => e.question === q);

describe("faq data", () => {
  it("has three themed groups in order", () => {
    expect(faqGroups.map((g) => g.theme)).toEqual([
      "Zusammenarbeit",
      "Technik & Sicherheit",
      "Kosten & Ablauf",
    ]);
  });

  // Ajdin 2026-11-12: every answer is a short bullet list, concrete, no decoration.
  it("answers every question with at least two short bullets", () => {
    for (const e of all) {
      expect(e.answer.length, e.question).toBeGreaterThanOrEqual(2);
      for (const b of e.answer) {
        expect(b, e.question).toMatch(/\S/);
        expect(b.length, b).toBeLessThanOrEqual(130);
        expect(findCopyIssues(b), b).toEqual([]);
      }
    }
  });

  it("has unique questions across all groups", () => {
    const questions = all.map((e) => e.question);
    expect(new Set(questions).size).toBe(questions.length);
  });

  // Ajdin 2026-11-12: fewer questions.
  it("drops the questions Ajdin cut", () => {
    for (const q of [
      "Ersetzt die Automatisierung mich oder meine Mitarbeiter?",
      "Arbeitest du auch remote?",
      "Für welche Betriebe baust du?",
      "Ist der Prozess-Check wirklich kostenlos?",
    ])
      expect(entry(q), q).toBeUndefined();
  });

  it("answers what happens after the project (the long-term-partner cue)", () => {
    const after = entry("Was passiert nach dem Projekt?")!;
    expect(after.answer.join(" ")).toMatch(/erreichbar/);
    expect(after.answer.join(" ")).not.toMatch(/vollen Betrag|zurück/);
  });

  it("explains the 2-week guarantee with its conditions (2026-11-11)", () => {
    expect(entry(GARANTIE.faqFrage)?.answer).toEqual(GARANTIE.faqAntwort);
  });

  it("names the running costs and the Wartung tiers from the one source", () => {
    const kosten = entry("Fallen laufende Kosten an?")!.answer;
    expect(kosten[0]).toBe("Server: rund 30 Euro im Monat, direkt beim Anbieter und auf deinen Namen");
    for (const p of wartungPreisPunkte()) expect(kosten).toContain(p);
    expect(kosten.join(" ")).not.toMatch(/219|420|1\.019|nach Absprache|9\.?900/);
  });

  it("promises first results within the first two weeks", () => {
    expect(entry("Wie lange dauert die Umsetzung?")!.answer[0]).toBe(
      "Erste Ergebnisse siehst du in den ersten zwei Wochen nach dem Onboarding",
    );
  });

  it("starts people with the Vorlagen, then the talk and the free Fahrplan", () => {
    expect(entry("Wie fange ich an?")!.answer).toEqual([
      "Schau dir die kostenlosen Vorlagen an",
      "Geh die Vorlage für deine Branche durch",
      "Dann vereinbarst du ein Gespräch mit mir und wir erstellen deinen Fahrplan",
      "Alles kostenlos",
    ]);
  });
});

// Ajdin 2026-11-12: AVV + Telegram in the FAQ; every build on the client's own server.
describe("data protection answers", () => {
  it("answers the AVV question right after the data question", () => {
    const i = all.findIndex((e) => e.question === "Was passiert mit meinen Daten?");
    expect(all[i + 1].question).toBe("Unterschreibst du einen Vertrag zur Auftragsverarbeitung?");
    expect(all[i + 1].answer.join(" ")).toMatch(/Art\. 28 DSGVO/);
    expect(all[i + 1].answer.join(" ")).toMatch(/Telegram nur, wenn du es willst/);
  });

  it("keeps Claude out of the data answer", () => {
    expect(entry("Was passiert mit meinen Daten?")!.answer.join(" ")).not.toMatch(/Claude|Anthropic|Amazon|Google/);
  });

  it("never offers a cloud account instead of the client's own server", () => {
    expect(JSON.stringify(faqGroups)).not.toMatch(/Cloud-Lösung|n8n Cloud/);
  });
});
