// src/lib/legal/inline-links.ts
export type InlinePart =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

// Matches [label](https://href) — href must be http(s) and contain no
// whitespace or closing paren. Anything else stays literal text.
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

export function parseInlineLinks(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let lastIndex = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) parts.push({ type: "text", value: text.slice(lastIndex, start) });
    parts.push({ type: "link", label: m[1], href: m[2] });
    lastIndex = start + m[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });
  if (parts.length === 0) parts.push({ type: "text", value: "" });
  return parts;
}
