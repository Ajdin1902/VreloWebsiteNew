// scripts/newsletter/markdown.test.mjs
import { describe, it, expect } from "vitest";
import { escapeHtml, renderInline, renderBlocks, toPlainText } from "./markdown.mjs";

describe("escapeHtml", () => {
  it("escapes the three dangerous chars", () => {
    expect(escapeHtml("a < b & c > d")).toBe("a &lt; b &amp; c &gt; d");
  });
  it("escapes double quotes", () => {
    expect(escapeHtml('sag "hallo"')).toBe("sag &quot;hallo&quot;");
  });
});

describe("renderInline", () => {
  it("renders bold, italic and links", () => {
    expect(renderInline("**fett** und *kursiv*")).toContain("<strong");
    expect(renderInline("**fett** und *kursiv*")).toContain("<em");
    expect(renderInline("[hier](https://x.de)")).toContain('href="https://x.de"');
  });
  it("auto-italicizes the brand words but not lowercase urls", () => {
    expect(renderInline("Mit Vrelo zum Merak.")).toMatch(/<em[^>]*>Vrelo<\/em>/);
    expect(renderInline("Mit Vrelo zum Merak.")).toMatch(/<em[^>]*>Merak<\/em>/);
    expect(renderInline("Besuch vrelo-ki.de")).not.toContain("<em");
  });
  it("swallows a stray inline image to its alt text (no broken link)", () => {
    const out = renderInline("Text ![Bild](/x.png) mehr");
    expect(out).toContain("Bild");
    expect(out).not.toContain("<a");
    expect(out).not.toContain("!<");
  });
});

describe("renderBlocks", () => {
  const body = `Intro-Absatz mit Vrelo.

## Kurz aus der KI-Welt
Erste Zeile.

![Meme: ein Entwickler](/images/newsletter/m.png)`;
  it("turns ## into an h2 and paragraphs into p", () => {
    const html = renderBlocks(body, { siteUrl: "https://vrelo-ki.de" });
    expect(html).toMatch(/<h2[^>]*>Kurz aus der KI-Welt<\/h2>/);
    expect(html).toMatch(/<p[^>]*>Intro-Absatz/);
  });
  it("absolutizes relative image srcs with siteUrl", () => {
    const html = renderBlocks(body, { siteUrl: "https://vrelo-ki.de" });
    expect(html).toContain('src="https://vrelo-ki.de/images/newsletter/m.png"');
    expect(html).toContain('alt="Meme: ein Entwickler"');
  });
  it("renders an image directly under a heading in the same block", () => {
    const meme = `## Meme der Woche\n![Meme: x](/images/newsletter/m.png)`;
    const html = renderBlocks(meme, { siteUrl: "https://vrelo-ki.de" });
    expect(html).toMatch(/<h2[^>]*>Meme der Woche<\/h2>/);
    expect(html).toContain('<img src="https://vrelo-ki.de/images/newsletter/m.png"');
    expect(html).not.toMatch(/<p[^>]*>!\[/);
  });
  it("matches an image line that has a trailing space", () => {
    const html = renderBlocks("## H\n![a](/x.png) ", { siteUrl: "https://vrelo-ki.de" });
    expect(html).toContain('<img src="https://vrelo-ki.de/x.png"');
  });
  it("escapes & in an image src", () => {
    const html = renderBlocks("![a](/x.png?u=1&v=2)", { siteUrl: "https://s" });
    expect(html).toContain("u=1&amp;v=2");
  });
});

describe("toPlainText", () => {
  it("strips markdown tokens and headings", () => {
    const body = `## Tipp\n**Wichtig**: [Link](https://x.de) und ![Bild](/a.png)`;
    const t = toPlainText(body);
    expect(t).toContain("Tipp");
    expect(t).not.toContain("##");
    expect(t).not.toContain("**");
    expect(t).toContain("Link");
    expect(t).not.toContain("https://x.de)"); // url markup removed
  });
});
