import { describe, expect, it } from "vitest";
import type { ParsedAnswers } from "@/lib/prozessCheck";
import { AREA_IDEE, CAP_GRUND, CONSENT_TEXT, CONSENT_VERSION, FORM_ERRORS, FORM_FIELDS, FORM_UI, LEAD_STATUS, PDF_FEHLER_GRUND, VERSAND_FEHLER_GRUND } from "./blocks";
import { buildLeadMail, buildVisitorMail, MAIL_UI } from "./mails";
import type { VorabFahrplan } from "./content";

const plan: VorabFahrplan = {
  firma: "Muster GmbH",
  name: "Max Muster",
  datum: "24.11.2026",
  stundenZeile: "Rund 9 Stunden pro Woche · 52 Arbeitstage im Jahr",
  stundenProWoche: 9,
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
      expect(part).toContain("Mein erster Schritt wäre: Anfragen beantworten.");
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
    expect(CONSENT_VERSION).toBe("pc-call-2026-11-24");
    // Plan 1 runs no research: the stored consent proof names no KI (C1).
    expect(CONSENT_TEXT).not.toMatch(/\bKI\b|recherchiert/);
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
  it("makes „nicht versendet“ unmissable: subject prefix and a bold banner above the table", () => {
    const m = lead({ status: "nicht-versendet", grund: "Limit pro Adresse" });
    expect(m.subject).toBe("[nicht versendet] Neuer Lead: Muster GmbH · Anfragen beantworten und Termine ausmachen");
    const banner = m.html.indexOf("<strong");
    expect(banner).toBeGreaterThan(-1);
    expect(banner).toBeLessThan(m.html.indexOf("<table"));
    expect(m.html.slice(banner, m.html.indexOf("<table"))).toContain("Limit pro Adresse");
    expect(m.text.split(/\r?\n/)[0]).toContain("nicht versendet");
    // Other statuses keep the plain subject and no banner.
    expect(lead().subject).toMatch(/^Neuer Lead/);
    expect(lead().html).not.toContain("<strong");
  });
  it("names the fallback plainly, with its reason", () => {
    const m = lead({ status: "fallback" });
    expect(m.text).toContain(`Status: ${LEAD_STATUS.fallback}`);
    expect(m.text).not.toContain("Fallback");
    expect(m.subject).toMatch(/^Neuer Lead/);
    expect(lead({ status: "fallback", grund: "n8n Timeout" }).text).toContain(`${LEAD_STATUS.fallback}, weil n8n Timeout`);
  });
  it("a capped lead says „gesperrt“, never „Schick ihn von Hand“", () => {
    const m = lead({ status: "gesperrt", grund: CAP_GRUND.ip });
    expect(m.subject).toMatch(/^\[nicht versendet\] /);
    for (const part of [m.html, m.text]) {
      expect(part).toContain(LEAD_STATUS.gesperrt);
      expect(part).toContain(CAP_GRUND.ip);
      expect(part).not.toContain(LEAD_STATUS.vonHand);
    }
    expect(lead({ status: "nicht-versendet", grund: "x" }).text.split("\n")[0]).toContain(LEAD_STATUS.vonHand);
  });
  it("prints the raw input as „Original-Eingabe“, escaped, only when given", () => {
    const m = lead({ raw: { firma: "<b>Roh</b> www.x.de", arbeitstag: "", programmeText: "crm.example.com" } });
    expect(m.text).toContain("Original-Eingabe Firma: <b>Roh</b> www.x.de");
    expect(m.text).toContain("Original-Eingabe Programme: crm.example.com");
    expect(m.html).toContain("&lt;b&gt;Roh&lt;/b&gt;");
    expect(m.html).not.toContain("<b>Roh");
    expect(lead().text).not.toContain("Original-Eingabe");
  });
});

describe("copy guards", () => {
  const strings = [...Object.values(MAIL_UI), ...Object.values(FORM_UI), ...Object.values(FORM_FIELDS), ...Object.values(FORM_ERRORS), ...Object.values(CAP_GRUND), ...Object.values(LEAD_STATUS), PDF_FEHLER_GRUND, VERSAND_FEHLER_GRUND, CONSENT_TEXT];
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

describe("visitor headline", () => {
  it("comes from stundenProWoche, not from stundenZeile", () => {
    const h = (n: number) => buildVisitorMail({ ...plan, stundenProWoche: n, stundenZeile: "egal" }).text;
    expect(h(1)).toContain("Muster GmbH: rund 1 Stunde pro Woche");
    expect(h(9)).toContain("Muster GmbH: rund 9 Stunden pro Woche");
  });
  it("the Zuerst sentence works with every area title", () => {
    for (const { titel } of Object.values(AREA_IDEE)) {
      expect(buildVisitorMail({ ...plan, schritte: [{ ...plan.schritte[0], titel }] }).text).toContain(`Mein erster Schritt wäre: ${titel}.`);
    }
  });
});
