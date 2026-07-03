import { describe, it, expect } from "vitest";
import { parseNotes, transcriptToText, buildSummarySystem, EMPTY_NOTIZ } from "./summary";
import type { DemoSeed } from "./seed";
import type { ChatMessage } from "./prompt";

const seed: DemoSeed = { business: "Baufi für Familien", appointmentType: "baufinanzierung", tone: "locker" };

describe("parseNotes", () => {
  it("extracts fields from a clean JSON string", () => {
    const n = parseNotes('{"name":"Alen","anliegen":"Baufi","termin":"Mo 10:00","offenePunkte":["Unterlagen"]}');
    expect(n).toEqual({ name: "Alen", anliegen: "Baufi", termin: "Mo 10:00", offenePunkte: ["Unterlagen"] });
  });

  it("tolerates surrounding prose", () => {
    const n = parseNotes('Hier: {"name":"Alen","anliegen":"","termin":"","offenePunkte":[]} fertig');
    expect(n.name).toBe("Alen");
  });

  it("returns EMPTY_NOTIZ on garbage / no-brace input", () => {
    expect(parseNotes("kein JSON hier")).toEqual(EMPTY_NOTIZ);
    expect(parseNotes("")).toEqual(EMPTY_NOTIZ);
  });

  it("returns EMPTY_NOTIZ on invalid JSON between braces", () => {
    expect(parseNotes("{ not valid json }")).toEqual(EMPTY_NOTIZ);
  });

  it("caps overly long string fields", () => {
    const long = "x".repeat(1000);
    const n = parseNotes(JSON.stringify({ name: long, anliegen: long, termin: long, offenePunkte: [] }));
    expect(n.name.length).toBe(120);
    expect(n.anliegen.length).toBe(300);
    expect(n.termin.length).toBe(120);
  });

  it("caps offenePunkte length to 6 and each item to 200", () => {
    const items = Array.from({ length: 20 }, () => "y".repeat(500));
    const n = parseNotes(JSON.stringify({ name: "", anliegen: "", termin: "", offenePunkte: items }));
    expect(n.offenePunkte.length).toBe(6);
    expect(n.offenePunkte.every((s) => s.length === 200)).toBe(true);
  });

  it("coerces a non-array offenePunkte to []", () => {
    const n = parseNotes(JSON.stringify({ name: "A", anliegen: "", termin: "", offenePunkte: "nope" }));
    expect(n.offenePunkte).toEqual([]);
  });

  it("coerces non-string offenePunkte items via String()", () => {
    const n = parseNotes('{"offenePunkte":[{"a":1},null,"echt"]}');
    expect(n.offenePunkte).toEqual(["[object Object]", "null", "echt"]);
  });
});

describe("transcriptToText", () => {
  it("labels Kunde and Assistent", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "Hallo" },
      { role: "assistant", content: "Willkommen" },
    ];
    const text = transcriptToText(messages);
    expect(text).toBe("Kunde: Hallo\nAssistent: Willkommen");
  });

  it("caps at 4000 chars", () => {
    const messages: ChatMessage[] = [{ role: "user", content: "z".repeat(10000) }];
    expect(transcriptToText(messages).length).toBe(4000);
  });
});

describe("buildSummarySystem", () => {
  it("embeds the delimited business context", () => {
    const s = buildSummarySystem(seed);
    expect(s).toContain("<geschaeftskontext>");
    expect(s).toContain("Baufi für Familien");
    expect(s).toContain("</geschaeftskontext>");
  });

  it("falls back to (keine Angabe) when business is empty", () => {
    const s = buildSummarySystem({ ...seed, business: "" });
    expect(s).toContain("(keine Angabe)");
  });
});
