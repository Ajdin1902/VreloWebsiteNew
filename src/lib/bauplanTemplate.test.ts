// src/lib/bauplanTemplate.test.ts
// Copy guards on the PDF template (content/bauplan/agentur-bauplan.html).
// The template keeps all non-ASCII as HTML entities (kit convention), so the
// guard decodes every entity the template uses before checking the real text.
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { findCopyIssues } from "./ratgeberCopy";
import { partHeadings, templateText } from "./bauplanTemplateText";

const html = readFileSync("content/bauplan/agentur-bauplan.html", "utf8");
const text = templateText(html);

it("decodes every entity the template uses", () => {
  expect(text.match(/&#?\w+;/g) ?? []).toEqual([]);
});
it("carries the eight parts in order", () => {
  const order = ["Das Fundament", "Prinzip 1", "Prinzip 2", "Prinzip 3", "Prinzip 4", "Der ganze Weg"];
  const headings = partHeadings(html);
  const idx = order.map((h) => headings.findIndex((t) => t.startsWith(h)));
  expect(idx.every((i) => i >= 0)).toBe(true);
  expect([...idx].sort((a, b) => a - b)).toEqual(idx);
});
it("has blank worksheets", () => {
  expect((html.match(/class="blank"/g) ?? []).length).toBeGreaterThanOrEqual(4);
});
it("follows the house typography and names no tool or client", () => {
  expect(findCopyIssues(text)).toEqual([]);
  expect(text).not.toMatch(/ClickUp|HubSpot|sevDesk|Notion|Asana|Zapier|Velp|Alen|€/);
  expect(text).not.toMatch(/\bMake\b/);
});
it("carries the cover rule and the back page", () => {
  expect(text).toContain("Fang mit einer Station an, nicht mit allen auf einmal.");
  expect(text).toContain("Wenn du magst, leg ich den Bauplan mit dir neben deinen Ablauf.");
  expect(text).toContain("ajdin@vrelo-ki.de");
  expect(text).toContain("vrelo-ki.de/datenschutz");
});
