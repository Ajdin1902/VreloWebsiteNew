// src/lib/bauplanTemplateText.ts
// Shared decoding for the Bauplan PDF templates (content/bauplan/*.html).
// The templates keep all non-ASCII as HTML entities (kit convention), so the
// copy guards decode every entity a template uses before checking the real text.
// A template that needs a new entity gets it here first.

export const ENTITIES: Record<string, string> = {
  "&#8222;": "„",
  "&#8220;": "“",
  "&auml;": "ä",
  "&ouml;": "ö",
  "&uuml;": "ü",
  "&Auml;": "Ä",
  "&Ouml;": "Ö",
  "&Uuml;": "Ü",
  "&szlig;": "ß",
  "&#183;": "·",
  "&#167;": "§",
  "&#8594;": "→",
  "&#8250;": "›",
  "&#160;": " ",
  "&nbsp;": " ",
  "&amp;": "&",
};

const decode = (s: string) => s.replace(/&#?\w+;/g, (e) => ENTITIES[e] ?? e);

/** Visible text of a template: comments, styles and tags removed, entities decoded. */
export function templateText(html: string): string {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");
  return decode(stripped);
}

/** Decoded text of every <h2 class="part"> heading, in document order. */
export function partHeadings(html: string): string[] {
  return [...html.matchAll(/<h2 class="part">([\s\S]*?)<\/h2>/g)].map((m) =>
    decode(m[1].replace(/<[^>]+>/g, "")),
  );
}
