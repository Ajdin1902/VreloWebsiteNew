// src/lib/elektroBauplanTemplate.test.ts
// Copy guards on the Elektro-Bauplan PDF template (content/bauplan/elektro-bauplan.html).
// Spec: docs/superpowers/specs/2026-10-29-elektro-bauplan-pdf-design.md (§4 content, §6 facts).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { findCopyIssues } from "./ratgeberCopy";
import { partHeadings, templateText } from "./bauplanTemplateText";
import { elektroBauplanPage } from "./elektroBauplanPage";

const html = readFileSync("content/bauplan/elektro-bauplan.html", "utf8");
const text = templateText(html);

const PAGE = '<section class="page';
const secondPage = html.indexOf(PAGE, html.indexOf(PAGE) + 1);
const page1Html = secondPage > 0 ? html.slice(0, secondPage) : html;
const page1 = templateText(page1Html);
// Page 7 is the offer (Ajdin 2026-10-30); pages 1 to 6 stay a free guideline.
const pages = html.split(PAGE);
const guide = templateText(pages.slice(0, 7).join(PAGE));
const page7Html = pages[7] ?? "";
const page7 = templateText(page7Html);
const { angebot } = elektroBauplanPage;

const HWK_URL =
  "https://www.hwk-do.de/wp-content/uploads/2023/10/HWK-Pressedienst-57-Konjunktur-Sonderumfrage_Buerokratiebelastungen-im-Handwerk.pdf";

function expectInOrder(haystack: string, needles: string[]) {
  const idx = needles.map((n) => haystack.indexOf(n));
  needles.forEach((n, i) => expect(idx[i], `missing: ${n}`).toBeGreaterThanOrEqual(0));
  expect([...idx].sort((a, b) => a - b)).toEqual(idx);
}

describe("template", () => {
  it("decodes every entity", () => {
    expect(text.match(/&#?\w+;/g) ?? []).toEqual([]);
  });
  it("stays ASCII", () => {
    expect(/[^\x00-\x7F]/.test(html)).toBe(false);
  });
  it("has seven pages: overview, one per stage, the offer", () => {
    expect((html.match(/<section class="page/g) ?? []).length).toBe(7);
  });
});

describe("page 1", () => {
  it("carries the landing-page parts in order", () => {
    expectInOrder(page1, [
      "Bauplan für Elektrobetriebe",
      "Mehr Büro als Baustelle?",
      "61 %",
      "Heute",
      "Mit dem Büroassistenten",
      "Der Weg in fünf Stufen",
      "Drei Regeln, die immer gelten",
    ]);
  });
  it("labels the statistic as Bürokratie and links its source", () => {
    expect(page1).toContain("der befragten Handwerksbetriebe");
    expect(page1).toContain("Durch Bürokratie bleibt weniger Zeit für die Aufträge.");
    expect(page1).toContain("Handwerkskammer Dortmund");
    expect(page1).toContain("hwk-do.de");
    expect(page1Html).toContain(`href="${HWK_URL}"`);
  });
  it("states the three rules", () => {
    expect(page1).toContain("Nichts Verbindliches ohne deine Freigabe.");
    expect(page1).toContain("Preise rechnet ein fester Rechenschritt, nicht der Assistent.");
    expect(page1).toContain("Alles läuft auf deinen Namen.");
  });
  it("shows the pain as its own band right under the headline", () => {
    expect(page1Html).toContain('class="schmerz"');
    expectInOrder(page1Html, ["Mehr B&uuml;ro als Baustelle?", 'class="schmerz"', 'class="sub"']);
  });
  it("shows the solution as its own band between the pain and Heute | Mit", () => {
    expectInOrder(page1Html, ['class="schmerz"', 'class="bauplan-titel"', 'class="loesung"', 'class="vergleich"']);
    expect(page1).toContain("Dein Bauplan zum Selbstbau: der eigene Büroassistent");
  });
  it("lists the stages instead of cards", () => {
    expect(page1Html).toContain("<ol");
    expect(page1Html).not.toContain('class="tiles"');
  });
});

describe("pages 2 to 5", () => {
  it("has the parts in order", () => {
    const order = ["So arbeitet der Assistent", "Stufe 1", "Stufe 2", "Stufe 3", "Stufe 4", "Stufe 5"];
    const headings = partHeadings(html);
    const idx = order.map((h) => headings.findIndex((t) => t.startsWith(h)));
    order.forEach((h, i) => expect(idx[i], `missing heading: ${h}`).toBeGreaterThanOrEqual(0));
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });
  it("names the reader's tools", () => {
    for (const name of [
      "sevDesk", "Lexware", "Label", "TopKontor", "ELDIS", "Sonepar", "Rexel", "Obeta",
      "FEGA & Schmitt", "Alexander Bürkle", "Datanorm", "IDS Connect", "OpenMasterData",
    ]) {
      expect(text, `missing: ${name}`).toContain(name);
    }
  });
  it("gives every stage page its own next steps", () => {
    const stages = pages.slice(2, 7);
    expect(stages).toHaveLength(5);
    stages.forEach((p, i) => {
      expect(p, `stage page ${i + 1}`).toContain('class="vorgehen"');
      expect(templateText(p), `stage page ${i + 1}`).toContain("So gehst du vor");
    });
  });
  it("promises the invoicing connection only where an interface exists", () => {
    expect(text).not.toContain("Genauso geht es mit Lexware");
    expect(text).toContain("wenn sie eine Schnittstelle haben");
  });
  it("states § 35a precisely: only the labour share", () => {
    expect(text).toContain("Arbeitsanteil");
    expect(text).not.toContain("die Handwerkerleistung von der Steuer absetzen");
  });
  it("keeps DSGVO and approval visible", () => {
    expect(text).toContain("innerhalb der EU");
    expect(text).toMatch(/Telegram[^.]*keinen? Auftragsverarbeitungsvertrag/);
    expect(text).toContain("Freigeben");
  });
  it("discloses the phone assistant as AI", () => {
    expect(text).toMatch(/meldet sich als KI-Assistent/);
    expect(text).toContain("KI-Verordnung");
  });
  it("closes the guide with ownership and proof", () => {
    for (const line of [
      "Alles gehört dir",
      "egal wer es baut oder betreut",
      "Für einen Hausmeisterservice läuft ein Sprachassistent nach diesem Muster.",
    ]) {
      expect(guide, `missing: ${line}`).toContain(line);
    }
  });
});

// Each needle searched after the previous one ("Geld-zurück-Garantie" is in the headline too).
function expectSequence(haystack: string, needles: string[]) {
  let from = 0;
  for (const n of needles) {
    const at = haystack.indexOf(n, from);
    expect(at, `missing after position ${from}: ${n}`).toBeGreaterThanOrEqual(0);
    from = at + n.length;
  }
}

describe("page 7: the offer", () => {
  it("carries the landing page's offer word for word", () => {
    expectSequence(page7, [
      angebot.heading,
      angebot.beweis,
      ...angebot.schritte.flatMap((s) => [s.titel, s.text]),
      angebot.garantie.titel,
      angebot.garantie.text,
      angebot.knappheit,
      angebot.frage,
    ]);
  });
  it("shows the proof as its own band right under the headline", () => {
    expect(page7Html).toMatch(/<\/h2>\s*<p class="angebot-beweis">/);
  });
  it("links the booking page with its own source, then the contact details", () => {
    expect(page7Html).toContain('href="https://vrelo-ki.de/kontakt?src=bauplan-elektro-pdf"');
    expectInOrder(page7, [angebot.frage, "vrelo-ki.de/kontakt", "ajdin@vrelo-ki.de", "0176 4380 6085"]);
  });
});

describe("whole document", () => {
  it("ends with the contact details", () => {
    expect(text.trim().endsWith("0176 4380 6085")).toBe(true);
  });
  it("reads as a free guideline up to page 6", () => {
    expect(guide).not.toMatch(
      /\b[Mm]it mir\b|\bohne mich\b|binde ich|richte ich|baue ich|wir zusammen|prüfen wir|klären wir|schauen wir|nehmen wir|legen wir|Wenn du magst/,
    );
  });
  it("follows the house typography", () => {
    expect(findCopyIssues(text)).toEqual([]);
  });
  it("names no price anywhere and no duration beyond the offer's 2 days", () => {
    expect(text).not.toMatch(/€|\bEuro\b|\bnetto\b|\bWochen\b|\bMonate?n?\b/);
    expect(guide).not.toMatch(/\bTagen?\b/);
    expect(page7.match(/\bTagen?\b/g)).toEqual(["Tagen"]);
  });
  it("names no client and no Power-Connect specifics", () => {
    expect(text).not.toMatch(
      /Power-Connect|Öksüz|\bMDZ\b|Velp|\bAlen\b|Bergisch|Benetics|Vodafone|\bSEO\b|Frankfurt/,
    );
  });
  it("never claims every wholesaler", () => {
    expect(text).not.toMatch(/\b(alle|jeder|jedem)\s+(Elektro)?[Gg]roßhändler/);
  });
});
