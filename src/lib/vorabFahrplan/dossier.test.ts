import { describe, expect, it } from "vitest";
import { AREA_LABEL, type ParsedAnswers } from "@/lib/prozessCheck";
import { DOSSIER_UI } from "./blocks";
import { buildDossierMail } from "./dossier";
import { buildFallbackPlan } from "./fallback";
import type { ResearchResult } from "./research";

const answers: ParsedAnswers = {
  bereiche: ["anfragen", "rechnungen"],
  stunden: { anfragen: 3, rechnungen: 5 },
  nervt: "anfragen",
  kanaele: ["mail"],
  menge: "5bis20",
  wer: "buero",
  programmeChips: ["Outlook"],
  programmeText: "",
  programme: ["Outlook"],
  arbeitstag: "",
  abende: "nein",
  versucht: "nichts",
  branche: "handwerk",
  team: "2bis5",
  arbeitsort: "beides",
};
const contact = { name: "Max Muster", firma: "Muster <b>GmbH</b>", email: "max@muster.de", telefon: "0941 123456", anrufOk: true };
const plan = buildFallbackPlan(answers, contact, new Date("2026-11-23T10:00:00Z"));
const result: ResearchResult = {
  jobId: "j1",
  fallback: false,
  erlaubteQuellen: [],
  dossier: {
    programme: [{ name: "Outlook", befunde: "Graph API <script>", unbestaetigt: "Regeln per API?", blocker: "kein Zugang", n8n: "nativ", api: "ja" }],
    website: "Kontaktformular, kein Buchungstool",
    aufwand: [{ bereich: "rechnungen", groesse: "M" }],
    kartenStationen: ["Anfrage-Reaktion", "Belegablage"],
    fragen: ["Frage eins?", "Frage zwei?", "Frage drei?", "Frage vier?", "Frage fünf?"],
    kostenUsd: 0.4234,
    capsGetroffen: ["websuche"],
  },
};

describe("buildDossierMail", () => {
  const m = buildDossierMail({ contact, plan, result, verworfen: ["anfragen tipp (quelle): <i>x</i>"] });

  it("subject, replyTo", () => {
    expect(m.subject).toBe("Dossier: Muster <b>GmbH</b>");
    expect(m.replyTo).toBe("max@muster.de");
  });

  it("lists findings, effort, Karte, the five questions numbered, cost and caps", () => {
    for (const s of ["Regeln per API?", "kein Zugang", "nativ", "Kontaktformular, kein Buchungstool", "Anfrage-Reaktion", "Belegablage", "websuche"]) {
      expect(m.html).toContain(s);
      expect(m.text).toContain(s);
    }
    expect(m.text).toContain(`${AREA_LABEL.rechnungen}: M`);
    expect(m.html).toMatch(/<ol[^>]*>(\s*<li[^>]*>Frage [a-zü]+\?<\/li>){5}\s*<\/ol>/);
    expect(m.text).toContain("1. Frage eins?");
    expect(m.text).toContain("5. Frage fünf?");
    expect(m.text).toContain("0.42 USD");
  });

  it("escapes model and visitor text", () => {
    expect(m.html).not.toContain("<script>");
    expect(m.html).not.toContain("<b>GmbH");
    expect(m.html).not.toContain("<i>x</i>");
    expect(m.html).toContain("&lt;i&gt;x&lt;/i&gt;");
  });

  it("shows the grund as a banner and says when there is no dossier", () => {
    const f = buildDossierMail({ contact, plan, verworfen: [], grund: `${DOSSIER_UI.rechercheUnbrauchbar}: pdf.schritte: <bad>` });
    expect(f.html).toContain(`${DOSSIER_UI.rechercheUnbrauchbar}: pdf.schritte: &lt;bad&gt;`);
    expect(f.text).toContain(DOSSIER_UI.keinDossier);
    expect(f.text).toContain(DOSSIER_UI.festeBausteine);
  });

  it("without a plan still names the Firma", () => {
    const f = buildDossierMail({ contact, verworfen: [], grund: "x" });
    expect(f.subject).toBe("Dossier: Muster <b>GmbH</b>");
  });
});
