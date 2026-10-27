// src/lib/bauplanPage.test.ts
import { describe, it, expect } from "vitest";
import { bauplanPage } from "./bauplanPage";
import { findCopyIssues } from "./ratgeberCopy";

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(bauplanPage);

describe("/bauplan copy", () => {
  it("has five stations in the spec order", () => {
    expect(bauplanPage.stationen.items.map((s) => s.name)).toEqual(["Angebot", "Onboarding", "Skripte", "Texte", "Projektdoku"]);
  });
  it("ends on six Merak points", () => {
    expect(bauplanPage.merak.punkte).toHaveLength(6);
  });
  it("follows the house typography in every string", () => {
    expect(all.flatMap((s) => findCopyIssues(s).map((i) => `${i.kind}: ${s}`))).toEqual([]);
  });
  it("names no price, tool or client", () => {
    expect(all.filter((s) => /€|\bEUR\b|ClickUp|HubSpot|sevDesk|\b(Velp|Alen)\b/i.test(s))).toEqual([]);
  });
  it("asks for nothing but the PDF", () => {
    expect(all.filter((s) => /Prozess-Check|buchen|Termin vereinbaren|Termin wählen|30 Minuten|melde dich|schreib mir/i.test(s))).toEqual([]);
  });
  it("names the origin agency only by shape", () => {
    expect(bauplanPage.herkunft).toMatch(/Videoagentur in Regensburg/);
    expect(bauplanPage.herkunft).toMatch(/konzipiert/);
  });
});
