// Typography guard for the German Ratgeber articles. Pure: no filesystem, no
// parsing of frontmatter values - it only needs the prose body.
//
// Scope note: this enforces the MECHANICAL brand rules only. The judgement
// rules (one water-metaphor concept, Merak landing warm, no CTA close, varied
// cadence) stay in the ratgeber-article skill's human self-check, because a
// hard threshold produces false failures on legitimate copy - the existing
// "durcheinander-oder-saubere-quelle" uses the word Quelle four times by design.

export type CopyIssue = { kind: string; detail: string };

// Codepoint escapes on purpose, never literal characters: the Write/Edit tools
// silently downgrade U+201C to U+201D, which would turn this guard into a
// detector that can never fire.
const EM_DASH = "\u2014"; // the em-dash, forbidden in German copy
const EN_DASH = "\u2013"; // the en-dash (Gedankenstrich), retired site-wide 2026-08-16
const OPEN_QUOTE = "\u201E"; // the opening German quote
const CLOSE_QUOTE = "\u201C"; // the correct closing German quote
const WRONG_CLOSE = "\u201D"; // the wrong closing quote tools downgrade to

// Feminine plurals we actually use. An open /\w+innen/ rule would flag
// "drinnen", "Spinnen" and "von innen", so the list is explicit on purpose.
const FEMININE_PLURALS = [
  "Kundinnen",
  "Inhaberinnen",
  "Kolleginnen",
  "Maklerinnen",
  "Beraterinnen",
  "Unternehmerinnen",
];

/** Remove a leading YAML frontmatter block. A later `---` (horizontal rule) is left alone. */
export function stripFrontmatter(raw: string): string {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(raw);
  return match ? raw.slice(match[0].length) : raw;
}

function snippet(body: string, index: number): string {
  const start = Math.max(0, index - 40);
  return body.slice(start, index + 40).replace(/\s+/g, " ").trim();
}

export function findCopyIssues(body: string): CopyIssue[] {
  const issues: CopyIssue[] = [];

  const em = body.indexOf(EM_DASH);
  if (em !== -1) {
    issues.push({
      kind: "em-dash",
      detail: `no Gedankenstrich: use a comma, period or colon instead: ...${snippet(body, em)}...`,
    });
  }

  const en = body.indexOf(EN_DASH);
  if (en !== -1) {
    issues.push({
      kind: "en-dash",
      detail: `no Gedankenstrich: use a comma, period or colon instead: ...${snippet(body, en)}...`,
    });
  }

  const ascii = body.indexOf('"');
  if (ascii !== -1) {
    issues.push({
      kind: "ascii-quote",
      detail: `use German quotes instead: ...${snippet(body, ascii)}...`,
    });
  }

  const wrong = body.indexOf(WRONG_CLOSE);
  if (wrong !== -1) {
    issues.push({
      kind: "wrong-closing-quote",
      detail: `closing quote must be U+201C, not U+201D: ...${snippet(body, wrong)}...`,
    });
  }

  const open = (body.match(new RegExp(OPEN_QUOTE, "g")) ?? []).length;
  const close = (body.match(new RegExp(CLOSE_QUOTE, "g")) ?? []).length;
  if (open !== close) {
    issues.push({
      kind: "unbalanced-quotes",
      detail: `${open} opening vs ${close} closing German quotes`,
    });
  }

  const punctuated = /[a-zäöüß][:*_]innen\b/i.exec(body);
  if (punctuated) {
    issues.push({
      kind: "gendered-form",
      detail: `generic masculine only: ...${snippet(body, punctuated.index)}...`,
    });
  }

  for (const word of FEMININE_PLURALS) {
    const at = body.indexOf(word);
    if (at !== -1) {
      issues.push({
        kind: "gendered-form",
        detail: `generic masculine only: ...${snippet(body, at)}...`,
      });
      break;
    }
  }

  return issues;
}
