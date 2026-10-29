// src/lib/elektroBauplanTemplate.test.ts
// Copy guards on the Elektro-Bauplan PDF template (content/bauplan/elektro-bauplan.html).
// Spec: docs/superpowers/specs/2026-10-29-elektro-bauplan-pdf-design.md (§4 content, §6 facts).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { findCopyIssues } from "./ratgeberCopy";
import { partHeadings, templateText } from "./bauplanTemplateText";

const html = readFileSync("content/bauplan/elektro-bauplan.html", "utf8");
const text = templateText(html);

const PAGE = '<section class="page';
const secondPage = html.indexOf(PAGE, html.indexOf(PAGE) + 1);
const page1Html = secondPage > 0 ? html.slice(0, secondPage) : html;
const page1 = templateText(page1Html);

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
  it("has five pages", () => {
    expect((html.match(/<section class="page/g) ?? []).length).toBe(5);
  });
});

describe("page 1", () => {
  it("carries the landing-page parts in order", () => {
    expectInOrder(page1, [
      "Bauplan für Elektrobetriebe",
      "Mehr Büro als Baustelle?",
      "Heute",
      "Mit dem Büroassistenten",
      "61 %",
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
    expect(page1).toContain("Preise rechnet ein fester Rechenschritt, nicht die KI.");
    expect(page1).toContain("Alles läuft auf deinen Namen.");
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
  it("closes with ownership, proof and one soft next step", () => {
    for (const line of [
      "Alles gehört dir",
      "Hörst du mit mir auf, läuft es weiter.",
      "Für einen Hausmeisterservice läuft ein Sprachassistent nach diesem Muster.",
      "Wenn du magst, schauen wir zusammen, welche Stufe bei dir zuerst dran ist.",
      "ajdin@vrelo-ki.de",
      "0176 4380 6085",
    ]) {
      expect(text, `missing: ${line}`).toContain(line);
    }
  });
});

describe("whole document", () => {
  it("follows the house typography", () => {
    expect(findCopyIssues(text)).toEqual([]);
  });
  it("names no price and no duration", () => {
    expect(text).not.toMatch(/€|\bEuro\b|\bnetto\b|\bWochen\b|\bTagen?\b|\bMonate?n?\b/);
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
