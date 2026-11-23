import { describe, expect, it } from "vitest";
import type { ParsedAnswers } from "@/lib/prozessCheck";
import { CONSENT_TEXT, CONSENT_VERSION, FORM_UI } from "./blocks";
import { buildLeadMail, buildVisitorMail, MAIL_UI } from "./mails";
import type { VorabFahrplan } from "./content";

const plan: VorabFahrplan = {
  firma: "Muster GmbH",
  name: "Max Muster",
  datum: "24.11.2026",
  stundenZeile: "Rund 9 Stunden pro Woche · 52 Arbeitstage im Jahr",
  zeitVerteilung: [],
  aufgabeZeile: "kommt per Mail rein · 20 bis 50 pro Woche · macht das Büro",
  schritte: [{ rang: "Zuerst", bereich: "anfragen", titel: "Anfragen beantworten", idee: "x", quellen: [] }],
  programme: [],
  quellen: [],
  recherchiert: false,
};

const answers: ParsedAnswers = {
  bereiche: ["anfragen", "rechnungen"],
  stunden: { anfragen: 5, rechnungen: 4 },
  nervt: "anfragen",
  kanaele: ["mail", "telefon"],
  menge: "20bis50",
  wer: "buero",
  programmeChips: ["Outlook"],
  programmeText: "",
  programme: ["Outlook", "<i>Foo</i>"],
  arbeitstag: "Morgens <script>x</script> Mails",
  abende: "abundzu",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
  website: "https://muster.de",
};
const contact = { name: "Max Muster", firma: "Muster GmbH", email: "max@muster.de", telefon: "+49941123456", anrufOk: true };
const lead = (o: object = {}) =>
  buildLeadMail({ contact, answers, source: "brief-handwerk", submittedAt: new Date("2026-11-23T23:30:00Z"), status: "recherche", ...o });

describe("buildVisitorMail", () => {
  it("has the Vrelo look, the signature, the Zuerst title and no €", () => {
    const m = buildVisitorMail(plan);
    expect(m.subject).toBe("Dein Vorab-Fahrplan, Muster GmbH");
    for (const c of ["#f4efe6", "#0a2538", "#1b5063", "#d4a24c"]) expect(m.html).toContain(c);
    for (const part of [m.html, m.text]) {
      expect(part).toContain("Ajdin Dzafic");
      expect(part).toContain("Vorab-Fahrplan");
      expect(part).toContain("Anfragen beantworten");
      expect(part).toContain("Hallo Max,");
      expect(part).toContain("rund 9 Stunden pro Woche");
      expect(part).not.toContain("€");
    }
  });
  it("shows the Cal.com button only with calUrl", () => {
    const cal = "https://cal.com/x/30min";
    const a = buildVisitorMail(plan, cal);
    expect(a.html).toContain(`href="${cal}"`);
    expect(a.text).toContain(cal);
    const b = buildVisitorMail(plan);
    expect(b.html).not.toContain("cal.com");
    expect(b.html).not.toContain("Termin buchen");
    expect(b.text).not.toContain("Termin");
  });
  it("escapes visitor values in html", () => {
    const m = buildVisitorMail({ ...plan, firma: "<b>X</b>", name: "<i>Max</i> M" });
    expect(m.html).not.toContain("<b>X");
    expect(m.html).toContain("&lt;b&gt;X&lt;/b&gt;");
    expect(m.html).not.toContain("<i>Max");
  });
});

describe("buildLeadMail", () => {
  it("lists every answer, contact, consent proof, source and status", () => {
    const m = lead();
    expect(m.subject).toBe("Neuer Lead: Muster GmbH · Anfragen beantworten und Termine ausmachen");
    expect(m.replyTo).toBe("max@muster.de");
    for (const part of [m.html, m.text]) {
      for (const s of [
        CONSENT_VERSION,
        CONSENT_TEXT,
        "+49941123456",
        "brief-handwerk",
        "Recherche läuft",
        "Rechnungen, Belege und Mahnungen",
        "Telefon",
        "20 bis 50",
        "Das Büro",
        "Outlook",
        "Ab und zu",
        "Noch nichts",
        "Handwerk",
        "2 bis 5",
        "Beides",
        "https://muster.de",
        "24.11.2026, 00:30",
      ]) expect(part).toContain(s.replace(/'/g, part === m.html ? "&#39;" : "'"));
    }
    expect(CONSENT_VERSION).toBe("pc-call-2026-11-23");
  });
  it("escapes visitor values", () => {
    const m = lead({ contact: { ...contact, firma: "<b>X</b>" } });
    expect(m.html).not.toContain("<b>X");
    expect(m.html).not.toContain("<script>");
    expect(m.html).not.toContain("<i>Foo");
    expect(m.html).toContain("&lt;script&gt;");
  });
  it("flags a mail that was not sent, with the reason", () => {
    const m = lead({ status: "nicht-versendet", grund: "Limit pro Adresse" });
    for (const part of [m.html, m.text]) {
      expect(part).toContain("nicht versendet");
      expect(part).toContain("Limit pro Adresse");
    }
  });
  it("names the fallback reason", () => {
    expect(lead({ status: "fallback", grund: "n8n Timeout" }).text).toContain("Fallback, weil n8n Timeout");
  });
});

describe("copy guards", () => {
  const strings = [...Object.values(MAIL_UI), ...Object.values(FORM_UI), CONSENT_TEXT];
  it("fixed strings follow the German punctuation rules", () => {
    for (const s of strings) {
      expect(s).not.toMatch(/["–—€]/);
      expect(s).not.toContain(", und");
    }
  });
  it("rendered visitor mail too", () => {
    const m = buildVisitorMail(plan, "https://cal.com/x");
    expect(m.text).not.toMatch(/[–—€]|, und/);
  });
});
