// src/lib/legal/inline-links.test.ts
import { describe, it, expect } from "vitest";
import { parseInlineLinks } from "./inline-links";

describe("parseInlineLinks", () => {
  it("returns a single text part for plain text", () => {
    expect(parseInlineLinks("Hallo Welt")).toEqual([{ type: "text", value: "Hallo Welt" }]);
  });

  it("splits text around one markdown link", () => {
    expect(parseInlineLinks("vor [Vrelo](https://vrelo-ki.de) nach")).toEqual([
      { type: "text", value: "vor " },
      { type: "link", label: "Vrelo", href: "https://vrelo-ki.de" },
      { type: "text", value: " nach" },
    ]);
  });

  it("handles multiple links", () => {
    const parts = parseInlineLinks("[a](https://a.de) und [b](https://b.de)");
    expect(parts.filter((p) => p.type === "link")).toHaveLength(2);
  });

  it("leaves a bracket without a link target as literal text", () => {
    expect(parseInlineLinks("ein [Hinweis] ohne Link")).toEqual([
      { type: "text", value: "ein [Hinweis] ohne Link" },
    ]);
  });

  it("does NOT linkify non-http schemes (mailto/javascript)", () => {
    expect(parseInlineLinks("[x](mailto:a@b.de)")).toEqual([
      { type: "text", value: "[x](mailto:a@b.de)" },
    ]);
    expect(parseInlineLinks("[x](javascript:alert(1))")).toEqual([
      { type: "text", value: "[x](javascript:alert(1))" },
    ]);
  });

  it("preserves newlines in surrounding text", () => {
    const parts = parseInlineLinks("Zeile1\n[L](https://x.de)\nZeile2");
    expect(parts[0]).toEqual({ type: "text", value: "Zeile1\n" });
    expect(parts[2]).toEqual({ type: "text", value: "\nZeile2" });
  });

  it("returns one empty text part for an empty string", () => {
    expect(parseInlineLinks("")).toEqual([{ type: "text", value: "" }]);
  });
});
