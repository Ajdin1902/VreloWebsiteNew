// src/lib/bauplanTemplate.test.ts
// Copy guards on the PDF template (content/bauplan/agentur-bauplan.html).
// The template keeps all non-ASCII as HTML entities (kit convention), so the
// guard decodes every entity the template uses before checking the real text.
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { findCopyIssues } from "./ratgeberCopy";

const html = readFileSync("content/bauplan/agentur-bauplan.html", "utf8");

const ENTITIES: Record<string, string> = {
  "&#8222;": "\u201E",
  "&#8220;": "\u201C",
  "&auml;": "\u00E4",
  "&ouml;": "\u00F6",
  "&uuml;": "\u00FC",
  "&Auml;": "\u00C4",
  "&Ouml;": "\u00D6",
  "&Uuml;": "\u00DC",
  "&szlig;": "\u00DF",
  "&#183;": "\u00B7",
  "&#8594;": "\u2192",
  "&#8250;": "\u203A",
  "&#160;": " ",
  "&nbsp;": " ",
  "&amp;": "&",
};

const stripped = html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<[^>]+>/g, " ");
const text = stripped.replace(/&#?\w+;/g, (e) => ENTITIES[e] ?? e);

it("decodes every entity the template uses", () => {
  expect(text.match(/&#?\w+;/g) ?? []).toEqual([]);
});
it("carries the eight parts in order", () => {
  const order = ["Das Fundament", "Prinzip 1", "Prinzip 2", "Prinzip 3", "Prinzip 4", "Der ganze Weg"];
  const headings = [...html.matchAll(/<h2 class="part">([\s\S]*?)<\/h2>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").replace(/&#?\w+;/g, (e) => ENTITIES[e] ?? e),
  );
  const idx = order.map((h) => headings.findIndex((t) => t.startsWith(h)));
  expect(idx.every((i) => i >= 0)).toBe(true);
  expect([...idx].sort((a, b) => a - b)).toEqual(idx);
});
it("has blank worksheets", () => {
  expect((html.match(/class="blank"/g) ?? []).length).toBeGreaterThanOrEqual(4);
});
it("follows the house typography and names no tool or client", () => {
  expect(findCopyIssues(text)).toEqual([]);
  expect(text).not.toMatch(/ClickUp|HubSpot|sevDesk|Notion|Asana|Zapier|Velp|Alen|\u20AC/);
  expect(text).not.toMatch(/\bMake\b/);
});
it("carries the cover rule and the back page", () => {
  expect(text).toContain("Fang mit einer Station an, nicht mit allen auf einmal.");
  expect(text).toContain("Wenn du magst, leg ich den Bauplan mit dir neben deinen Ablauf.");
  expect(text).toContain("ajdin@vrelo-ki.de");
  expect(text).toContain("vrelo-ki.de/datenschutz");
});
