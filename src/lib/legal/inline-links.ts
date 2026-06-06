// src/lib/legal/inline-links.ts
export type InlinePart =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

// Matches [label](https://href) — href must be http(s). The label excludes
// newlines; the href stops at whitespace or `)` (so URLs containing `)` would
// truncate — fine for our links). Anything else stays literal text.
// The /g flag is required by matchAll(), which clones the regex internally, so
// LINK_RE.lastIndex is never mutated across calls.
const LINK_RE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;

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
