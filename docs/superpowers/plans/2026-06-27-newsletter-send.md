# Newsletter Send Mechanism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the founder author a weekly newsletter issue as a Markdown file in the repo and send it to the Resend audience with one command – preview, test-to-self, then broadcast.

**Architecture:** Issues are `.md` files in `content/newsletter/` (gray-matter frontmatter + a fixed-4-section body, mirroring the Ratgeber pattern). All send logic is **plain ESM `.mjs`** under `scripts/newsletter/` – because the runner is bare `node` (Node ≥ 22.9, no TS/`@`-alias resolution), and the existing repo convention is `scripts/*.mjs`. Pure functions (parse, Markdown→email-HTML render, build email, arg parsing) are unit-tested with Vitest; a thin orchestrator `scripts/send-newsletter.mjs` does the file/Resend I/O. Sending reuses the existing `NEWSLETTER_SEGMENT_ID` via Resend's Broadcasts API (`broadcasts.create({ segmentId, … })` → `broadcasts.send(id)`).

**Tech Stack:** Next.js 16, Vitest 4, Resend v6.12.4, gray-matter. Node ≥ 22.9 (`--env-file-if-exists`).

**Editorial source of truth:** `Knowledge/marketing/newsletter.md` (goal, voice, the 4 sections, the example issue). This plan builds only the *send mechanism*; copy rules come from there.

**Branch:** create and work on `feat/newsletter-send`.

---

## Why `.mjs` under `scripts/` (read before starting)

The send command runs as `node scripts/send-newsletter.mjs`. Bare Node cannot import `.ts` files or resolve the `@/*` path alias (that alias only exists for Next/Vitest). So the *send-side* logic lives as `.mjs` with **relative imports**. This is a deliberate split from `src/lib/email/newsletter-confirm.ts` (TS, imported by a Server Action). Don't try to share code across that boundary – duplicating the few brand hex values is correct here. Vitest's default test glob picks up `scripts/**/*.test.mjs`, so these stay fully tested.

**German typography (enforced everywhere):** German quotes „…" are U+201E (open) / U+201C (close); the Gedankenstrich is the **spaced en-dash** „ – " (U+2013), never `--` or an em-dash. The Write/Edit tools silently downgrade the closing curly quote and the en-dash – after writing any file with German copy, verify the bytes (a `node` check is shown where it matters).

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/newsletter/issue.mjs` | Parse + select issue `.md` files (pure `parseIssue`; fs helpers `getAllIssues`/`getIssueBySlug`). |
| `scripts/newsletter/markdown.mjs` | Pure Markdown-subset → email-safe HTML + plain-text renderer. |
| `scripts/newsletter/email.mjs` | Pure `buildIssueEmail(issue, {siteUrl})` → `{subject, html, text}` (branded Papier/petrol shell + unsubscribe token). |
| `scripts/newsletter/args.mjs` | Pure `parseSendArgs(argv)` + `assertSendable(issue)`. |
| `scripts/send-newsletter.mjs` | Thin I/O orchestrator (read file, preview/test/broadcast via Resend). |
| `content/newsletter/2026-06-30-der-kunde-um-22-uhr.md` | First issue (draft), seeded from the playbook example. |
| `src/app/newsletter/page.tsx` | Signup copy tweak (lead + meta description). |
| `package.json` | Add `"newsletter"` script. |
| `Website/CLAUDE.md` | Record the build + gotchas. |

---

## Task 1: Issue parser

**Files:**
- Create: `scripts/newsletter/issue.mjs`
- Test: `scripts/newsletter/issue.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// scripts/newsletter/issue.test.mjs
import { describe, it, expect } from "vitest";
import { parseIssue, selectIssues } from "./issue.mjs";

const raw = `---
subject: "Der Kunde, der um 22 Uhr schrieb"
previewText: "Eine Beobachtung, ein Tipp, ein Meme."
date: "2026-06-30"
draft: true
---
Intro-Absatz.

## Kurz aus der KI-Welt
Text.`;

describe("parseIssue", () => {
  it("parses frontmatter and strips it from the body", () => {
    const i = parseIssue("2026-06-30-der-kunde.md", raw);
    expect(i.slug).toBe("2026-06-30-der-kunde");
    expect(i.subject).toBe("Der Kunde, der um 22 Uhr schrieb");
    expect(i.previewText).toBe("Eine Beobachtung, ein Tipp, ein Meme.");
    expect(i.date).toBe("2026-06-30");
    expect(i.draft).toBe(true);
    expect(i.body.startsWith("Intro-Absatz.")).toBe(true);
    expect(i.body).not.toContain("subject:");
  });

  it("throws when subject is missing", () => {
    const bad = `---\ndate: "2026-06-30"\n---\nText.`;
    expect(() => parseIssue("x.md", bad)).toThrow(/subject/);
  });

  it("throws when date is missing", () => {
    const bad = `---\nsubject: "Hallo"\n---\nText.`;
    expect(() => parseIssue("x.md", bad)).toThrow(/date/);
  });

  it("defaults draft to false and previewText to empty string", () => {
    const min = `---\nsubject: "Hallo"\ndate: "2026-06-30"\n---\nText.`;
    const i = parseIssue("x.md", min);
    expect(i.draft).toBe(false);
    expect(i.previewText).toBe("");
  });
});

describe("selectIssues", () => {
  const issues = [
    { slug: "a", date: "2026-01-01", draft: false },
    { slug: "b", date: "2026-03-01", draft: true },
    { slug: "c", date: "2026-02-01", draft: false },
  ];
  it("hides drafts unless asked and sorts newest first", () => {
    expect(selectIssues(issues, { includeDrafts: false }).map((i) => i.slug)).toEqual(["c", "a"]);
    expect(selectIssues(issues, { includeDrafts: true }).map((i) => i.slug)).toEqual(["b", "c", "a"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/newsletter/issue.test.mjs`
Expected: FAIL – "Failed to resolve import ./issue.mjs".

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/newsletter/issue.mjs
// Parse + select newsletter issue files. Mirrors src/lib/ratgeber.ts, but plain
// ESM so bare `node` can import it. `parseIssue` is pure; the fs helpers wrap it.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** @typedef {{slug:string,subject:string,previewText:string,date:string,draft:boolean,body:string}} Issue */

/** @returns {Issue} */
export function parseIssue(filename, raw) {
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.md$/, "");
  const subject = String(data.subject ?? "").trim();
  const date = String(data.date ?? "").trim();
  if (!subject) throw new Error(`Newsletter issue "${slug}" is missing required frontmatter: subject`);
  if (!date) throw new Error(`Newsletter issue "${slug}" is missing required frontmatter: date`);
  return {
    slug,
    subject,
    previewText: String(data.previewText ?? "").trim(),
    date,
    draft: data.draft === true,
    body: content.trim(),
  };
}

export function selectIssues(issues, { includeDrafts }) {
  return issues
    .filter((i) => includeDrafts || !i.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

const ISSUE_DIR = path.join(process.cwd(), "content", "newsletter");

export function getAllIssues({ dir = ISSUE_DIR, includeDrafts = true } = {}) {
  if (!fs.existsSync(dir)) return [];
  const issues = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseIssue(f, fs.readFileSync(path.join(dir, f), "utf8")));
  return selectIssues(issues, { includeDrafts });
}

export function getIssueBySlug(slug, { dir = ISSUE_DIR } = {}) {
  const found = getAllIssues({ dir, includeDrafts: true }).find((i) => i.slug === slug);
  if (!found) throw new Error(`Newsletter issue not found: ${slug}`);
  return found;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/newsletter/issue.test.mjs`
Expected: PASS (8 assertions across 6 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/newsletter/issue.mjs scripts/newsletter/issue.test.mjs
git commit -m "feat(newsletter): issue .md parser + selector"
```

---

## Task 2: Markdown-subset → email renderer

**Files:**
- Create: `scripts/newsletter/markdown.mjs`
- Test: `scripts/newsletter/markdown.test.mjs`

Supported Markdown: blank-line-separated paragraphs, `## ` section headings, image-only blocks `![alt](src)`, and inline `**bold**`, `*italic*`, `[text](url)`. Brand words `Vrelo`/`Merak` auto-italicize (case-sensitive, so lowercase URLs like `vrelo-ki.de` are untouched). Text is HTML-escaped.

- [ ] **Step 1: Write the failing test**

```js
// scripts/newsletter/markdown.test.mjs
import { describe, it, expect } from "vitest";
import { escapeHtml, renderInline, renderBlocks, toPlainText } from "./markdown.mjs";

describe("escapeHtml", () => {
  it("escapes the three dangerous chars", () => {
    expect(escapeHtml("a < b & c > d")).toBe("a &lt; b &amp; c &gt; d");
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/newsletter/markdown.test.mjs`
Expected: FAIL – cannot resolve `./markdown.mjs`.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/newsletter/markdown.mjs
// Minimal, email-safe Markdown-subset renderer. Inline styles only (email needs
// them). Author copy is trusted, but we still escape <, >, & in text.
const PETROL = "#1b5063";
const INK = "#14181b";
const DEEP = "#0a2538";

export function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Applied to already-escaped text. Case-sensitive on capitalized brand words.
function brandword(s) {
  return s.replace(/\b(Vrelo|Merak)\b/g, '<em style="font-style:italic">$1</em>');
}

export function renderInline(text) {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${PETROL}">$1</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em style="font-style:italic">$1</em>');
  return brandword(s);
}

const IMG_ONLY = /^!\[([^\]]*)\]\(([^)]+)\)$/;

function absolutize(src, siteUrl) {
  return src.startsWith("/") ? `${siteUrl}${src}` : src;
}

export function renderBlocks(body, { siteUrl }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks
    .map((block) => {
      if (block.startsWith("## ")) {
        return `<h2 style="font-family:Georgia,'Times New Roman',serif;color:${DEEP};font-size:17px;margin:26px 0 8px">${renderInline(block.slice(3))}</h2>`;
      }
      const img = block.match(IMG_ONLY);
      if (img) {
        const alt = escapeHtml(img[1]);
        const src = absolutize(img[2], siteUrl);
        return `<img src="${src}" alt="${alt}" style="display:block;max-width:100%;height:auto;border-radius:8px;margin:10px 0" />`;
      }
      const lines = block.split("\n").map(renderInline).join("<br>");
      return `<p style="font-size:15px;line-height:1.7;color:${INK};margin:0 0 14px">${lines}</p>`;
    })
    .join("\n");
}

export function toPlainText(body) {
  return body
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt) => (alt ? alt : "[Bild]"))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^\s*##\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/newsletter/markdown.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/newsletter/markdown.mjs scripts/newsletter/markdown.test.mjs
git commit -m "feat(newsletter): markdown-subset email renderer"
```

---

## Task 3: Email builder (branded shell)

**Files:**
- Create: `scripts/newsletter/email.mjs`
- Test: `scripts/newsletter/email.test.mjs`

Brand palette (matches `src/lib/email/newsletter-confirm.ts`): Papier `#f4efe6`, tiefes-wasser `#0a2538`, petrol `#1b5063`, ink `#14181b`, muted `#7a7468`, hr `#e3dccc`. The Resend unsubscribe token `{{{RESEND_UNSUBSCRIBE_URL}}}` is substituted by Resend at broadcast time (it stays literal in preview/test – that's expected).

- [ ] **Step 1: Write the failing test**

```js
// scripts/newsletter/email.test.mjs
import { describe, it, expect } from "vitest";
import { buildIssueEmail } from "./email.mjs";

const issue = {
  slug: "2026-06-30-der-kunde",
  subject: "Der Kunde, der um 22 Uhr schrieb",
  previewText: "Eine Beobachtung, ein Tipp, ein Meme.",
  date: "2026-06-30",
  draft: false,
  body: `Intro mit Vrelo.

## Kurz aus der KI-Welt
Text.

![Meme](/images/newsletter/m.png)`,
};

describe("buildIssueEmail", () => {
  const mail = buildIssueEmail(issue, { siteUrl: "https://vrelo-ki.de" });

  it("uses the issue subject", () => {
    expect(mail.subject).toBe("Der Kunde, der um 22 Uhr schrieb");
  });
  it("renders sections as headings", () => {
    expect(mail.html).toMatch(/<h2[^>]*>Kurz aus der KI-Welt<\/h2>/);
  });
  it("includes the Resend unsubscribe token", () => {
    expect(mail.html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  });
  it("absolutizes the meme image", () => {
    expect(mail.html).toContain("https://vrelo-ki.de/images/newsletter/m.png");
  });
  it("includes a hidden preheader with previewText", () => {
    expect(mail.html).toContain("Eine Beobachtung, ein Tipp, ein Meme.");
  });
  it("produces a plain-text alternative without markdown", () => {
    expect(mail.text).toContain("Kurz aus der KI-Welt");
    expect(mail.text).not.toContain("##");
    expect(mail.text).toContain("Abmelden");
  });
  it("italicizes the brand word in the body", () => {
    expect(mail.html).toMatch(/<em[^>]*>Vrelo<\/em>/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/newsletter/email.test.mjs`
Expected: FAIL – cannot resolve `./email.mjs`.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/newsletter/email.mjs
// Wrap a rendered issue body in the branded Papier/petrol email shell.
import { renderBlocks, toPlainText } from "./markdown.mjs";

const UNSUB = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export function buildIssueEmail(issue, { siteUrl }) {
  const bodyHtml = renderBlocks(issue.body, { siteUrl });
  const preheader = issue.previewText
    ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0">${issue.previewText}</span>`
    : "";

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b">
    ${preheader}
    <div style="max-width:560px;margin:0 auto">
      <p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:20px;color:#0a2538;margin:0 0 22px">Vrelo</p>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e3dccc;margin:28px 0 16px" />
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:0">Du bekommst diese Mail, weil du dich beim <em style="font-style:italic">Vrelo</em>-Newsletter angemeldet hast. <a href="${UNSUB}" style="color:#1b5063">Abmelden</a>.</p>
    </div>
  </body>
</html>`;

  const text = `${toPlainText(issue.body)}\n\nDu bekommst diese Mail, weil du dich beim Vrelo-Newsletter angemeldet hast.\nAbmelden: ${UNSUB}`;

  return { subject: issue.subject, html, text };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/newsletter/email.test.mjs`
Expected: PASS (7 tests).

- [ ] **Step 5: Verify no em-dash crept in**

Run:
```bash
node -e 'const s=require("fs").readFileSync("scripts/newsletter/email.mjs","utf8");console.log("emdash",(s.match(/–/g)||[]).length)'
```
Expected: `emdash 0` (this module has no German prose and no dashes). If non-zero, a line was corrupted – fix via an `fs` replace, not the Edit tool.

- [ ] **Step 6: Commit**

```bash
git add scripts/newsletter/email.mjs scripts/newsletter/email.test.mjs
git commit -m "feat(newsletter): branded issue email builder"
```

---

## Task 4: CLI arg parsing + send guard

**Files:**
- Create: `scripts/newsletter/args.mjs`
- Test: `scripts/newsletter/args.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// scripts/newsletter/args.test.mjs
import { describe, it, expect } from "vitest";
import { parseSendArgs, assertSendable } from "./args.mjs";

describe("parseSendArgs", () => {
  it("parses preview mode", () => {
    expect(parseSendArgs(["--preview", "my-slug"])).toEqual({ mode: "preview", slug: "my-slug" });
  });
  it("parses test mode with an email", () => {
    expect(parseSendArgs(["--test", "me@x.de", "my-slug"])).toEqual({ mode: "test", slug: "my-slug", testEmail: "me@x.de" });
  });
  it("parses send mode with optional scheduledAt", () => {
    expect(parseSendArgs(["--send", "my-slug", "--at", "2026-07-01T08:00:00Z"])).toEqual({ mode: "send", slug: "my-slug", scheduledAt: "2026-07-01T08:00:00Z" });
  });
  it("throws without a mode", () => {
    expect(() => parseSendArgs(["my-slug"])).toThrow(/--preview|--test|--send/);
  });
  it("throws on two modes", () => {
    expect(() => parseSendArgs(["--preview", "--send", "s"])).toThrow(/one of/);
  });
  it("throws when --test has no email", () => {
    expect(() => parseSendArgs(["--test", "my-slug"])).toThrow(/email/i);
  });
  it("throws when slug is missing", () => {
    expect(() => parseSendArgs(["--preview"])).toThrow(/slug/i);
  });
});

describe("assertSendable", () => {
  it("rejects a draft issue", () => {
    expect(() => assertSendable({ slug: "s", draft: true })).toThrow(/draft/i);
  });
  it("allows a non-draft issue", () => {
    expect(() => assertSendable({ slug: "s", draft: false })).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/newsletter/args.test.mjs`
Expected: FAIL – cannot resolve `./args.mjs`.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/newsletter/args.mjs
// Pure CLI parsing for send-newsletter.mjs. argv = process.argv.slice(2).
const MODES = ["--preview", "--test", "--send"];

export function parseSendArgs(argv) {
  const modes = argv.filter((a) => MODES.includes(a));
  if (modes.length === 0) throw new Error(`Pick a mode: --preview, --test <email>, or --send.`);
  if (modes.length > 1) throw new Error(`Use exactly one of --preview / --test / --send.`);
  const mode = modes[0].slice(2);

  let testEmail;
  const rest = [];
  let scheduledAt;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (MODES.includes(a)) {
      if (mode === "test") {
        const next = argv[i + 1];
        if (!next || !next.includes("@")) throw new Error(`--test needs an email address: --test you@example.de <slug>`);
        testEmail = next;
        i++;
      }
      continue;
    }
    if (a === "--at") {
      scheduledAt = argv[i + 1];
      i++;
      continue;
    }
    rest.push(a);
  }

  const slug = rest[0];
  if (!slug) throw new Error(`Missing issue slug. Usage: --${mode} ${mode === "test" ? "<email> " : ""}<slug>`);

  const out = { mode, slug };
  if (mode === "test") out.testEmail = testEmail;
  if (mode === "send" && scheduledAt) out.scheduledAt = scheduledAt;
  return out;
}

export function assertSendable(issue) {
  if (issue.draft) {
    throw new Error(`Issue "${issue.slug}" is draft: true. Flip it to draft: false before broadcasting.`);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/newsletter/args.test.mjs`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/newsletter/args.mjs scripts/newsletter/args.test.mjs
git commit -m "feat(newsletter): cli arg parsing + send guard"
```

---

## Task 5: Orchestrator script + npm command

**Files:**
- Create: `scripts/send-newsletter.mjs`
- Modify: `package.json` (add one script line)

This file does I/O only; its logic is already tested in Tasks 1–4. No unit test – it's verified manually in Task 6.

- [ ] **Step 1: Write the orchestrator**

```js
// scripts/send-newsletter.mjs
// Author issues in content/newsletter/<slug>.md, then:
//   npm run newsletter -- --preview <slug>            # writes .preview/<slug>.html
//   npm run newsletter -- --test you@example.de <slug> # one test email to you
//   npm run newsletter -- --send <slug>                # broadcast to the segment
//   npm run newsletter -- --send <slug> --at 2026-07-01T08:00:00Z  # schedule
// Secrets load from .env.local via the npm script (--env-file-if-exists).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getIssueBySlug } from "./newsletter/issue.mjs";
import { buildIssueEmail } from "./newsletter/email.mjs";
import { parseSendArgs, assertSendable } from "./newsletter/args.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

let args;
try {
  args = parseSendArgs(process.argv.slice(2));
} catch (e) {
  fail(String(e.message));
}

const issue = getIssueBySlug(args.slug, { dir: resolve(root, "content/newsletter") });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vrelo-ki.de";
const mail = buildIssueEmail(issue, { siteUrl });

if (args.mode === "preview") {
  const out = resolve(root, ".preview", `newsletter-${issue.slug}.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, mail.html, "utf8");
  console.log(`Preview written: ${out}\nSubject: ${mail.subject}`);
  process.exit(0);
}

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.CONTACT_FROM;
if (!apiKey || !from) fail("Missing RESEND_API_KEY or CONTACT_FROM. Set them in .env.local.");

const { Resend } = await import("resend");
const resend = new Resend(apiKey);

if (args.mode === "test") {
  const { data, error } = await resend.emails.send({
    from,
    to: args.testEmail,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  if (error) fail(`Test send failed: ${JSON.stringify(error)}`);
  console.log(`Test sent to ${args.testEmail} (id ${data?.id}).`);
  process.exit(0);
}

// args.mode === "send"
assertSendable(issue);
const segmentId = process.env.NEWSLETTER_SEGMENT_ID;
if (!segmentId) fail("Missing NEWSLETTER_SEGMENT_ID. Set it in .env.local.");

const { data: created, error: createErr } = await resend.broadcasts.create({
  segmentId,
  from,
  replyTo: from,
  subject: mail.subject,
  name: issue.slug,
  previewText: issue.previewText || undefined,
  html: mail.html,
  text: mail.text,
});
if (createErr || !created) fail(`Broadcast create failed: ${JSON.stringify(createErr)}`);

const { error: sendErr } = await resend.broadcasts.send(
  created.id,
  args.scheduledAt ? { scheduledAt: args.scheduledAt } : undefined,
);
if (sendErr) fail(`Broadcast send failed (draft ${created.id} created): ${JSON.stringify(sendErr)}`);

console.log(`Broadcast ${created.id} ${args.scheduledAt ? `scheduled for ${args.scheduledAt}` : "sent"}.`);
```

- [ ] **Step 2: Add the npm script**

In `package.json`, under `"scripts"`, add after the `"optimize:videos"` line (keep valid JSON – add a comma):

```json
    "optimize:videos": "node scripts/optimize-videos.mjs",
    "newsletter": "node --env-file-if-exists=.env.local scripts/send-newsletter.mjs"
```

- [ ] **Step 3: Verify it loads and errors cleanly (no real send)**

Run: `npm run newsletter -- --send` 
Expected: prints "Missing issue slug…" and exits non-zero (arg parsing works, no Resend call).

- [ ] **Step 4: Commit**

```bash
git add scripts/send-newsletter.mjs package.json
git commit -m "feat(newsletter): preview/test/broadcast orchestrator script"
```

---

## Task 6: Seed the first issue + preview end-to-end

**Files:**
- Create: `content/newsletter/2026-06-30-der-kunde-um-22-uhr.md`
- Create: `public/images/newsletter/.gitkeep`

The issue is seeded from the playbook example (`Knowledge/marketing/newsletter.md` §8), `draft: true` so it can never be broadcast accidentally.

- [ ] **Step 1: Create the images folder placeholder**

```bash
mkdir -p public/images/newsletter && printf '' > public/images/newsletter/.gitkeep
```

- [ ] **Step 2: Write the issue file**

Create `content/newsletter/2026-06-30-der-kunde-um-22-uhr.md` with this exact content (German typography – verified in Step 3):

```markdown
---
subject: "Der Kunde, der um 22 Uhr schrieb"
previewText: "Eine kleine Beobachtung, ein Tipp – und ein Meme."
date: "2026-06-30"
draft: true
---
Diese Woche eine kleine Beobachtung aus der KI-Welt, ein Tipp zum Ausprobieren und – ganz unten – ein Meme, das mich zum Schmunzeln gebracht hat.

## Kurz aus der KI-Welt
Immer mehr Anbieter bauen KI direkt in Tabellen und Postfächer ein – also genau dort, wo du ohnehin schon arbeitest. Klingt nach Spielerei, heißt für dich aber etwas Konkretes: Aufgaben wie „fasse diese E-Mail zusammen“ oder „zieh die Rechnungsdaten heraus“ brauchen bald kein eigenes Werkzeug mehr. Mein Rat: nichts überstürzen. Warte, bis so eine Funktion in einem Programm landet, das du sowieso nutzt – dann ist sie es wert.

## Der Tipp der Woche
Wenn du jede Woche fast denselben Text tippst – Terminbestätigung, Nachfrage, Absage – dann lass ihn dir einmal von einem KI-Assistenten in drei sauberen Varianten schreiben und speichere sie als Textbausteine. Beim nächsten Mal wählst du die Vorlage, passt zwei Wörter an, fertig. Klingt banal. Aber zehn Minuten am Tag sind übers Jahr mehr als eine ganze Arbeitswoche.

## So nutzen wir es
Bei einem Kunden laufen alle Projektphasen über ein stilles System: Sobald ein Schritt fertig ist, legt sich die nächste Aufgabe mit der richtigen Frist von selbst an. Niemand muss mehr daran denken, was als Nächstes dran ist. Genau diese Art unsichtbaren Helfer baue ich am liebsten – man bemerkt ihn erst, wenn er einem fehlt.

## Meme der Woche
![Meme: „Ich automatisiere das schnell“ – darunter ein Kalender mit drei vergangenen Wochen](/images/newsletter/2026-06-30-meme.png)

Wenn du wissen willst, wo bei dir die erste Aufgabe wegfallen könnte: Schreib mir einfach auf diese Mail zurück. Ich schaue es mir in Ruhe an.

– Ajdin
```

- [ ] **Step 3: Verify German typography in the issue file**

Run:
```bash
node -e 'const s=require("fs").readFileSync("content/newsletter/2026-06-30-der-kunde-um-22-uhr.md","utf8");const o=(s.match(/„/g)||[]).length,c=(s.match(/“/g)||[]).length,em=(s.match(/–/g)||[]).length;console.log({open:o,close:c,emdash:em})'
```
Expected: `{ open: 3, close: 3, emdash: 0 }` (two „…" pairs in the KI-Welt section + one in the meme alt text; no em-dashes – all Gedankenstriche are spaced en-dashes U+2013). If `close` < `open` or `emdash` > 0, fix with a small `fs` replace script (do **not** re-Edit, the tool will re-downgrade) and re-run.

- [ ] **Step 4: Preview end-to-end**

Run: `npm run newsletter -- --preview 2026-06-30-der-kunde-um-22-uhr`
Expected: prints `Preview written: …/.preview/newsletter-2026-06-30-der-kunde-um-22-uhr.html` and the subject. Open that file in a browser: Papier background, italic „Vrelo" wordmark, four section headings, body at ~560px, the meme `img` shows a broken-image placeholder (PNG not created yet – expected), an „Abmelden" footer with the literal `{{{RESEND_UNSUBSCRIBE_URL}}}` href.

- [ ] **Step 5: Add `.preview/` to gitignore**

Append to `.gitignore` (if not already ignored):
```
.preview/
```

- [ ] **Step 6: Commit**

```bash
git add content/newsletter/2026-06-30-der-kunde-um-22-uhr.md public/images/newsletter/.gitkeep .gitignore
git commit -m "feat(newsletter): seed first issue (draft) + preview output ignore"
```

---

## Task 7: Signup copy tweak

**Files:**
- Modify: `src/app/newsletter/page.tsx` (the `description` in `metadata` and the `lead` prop)

Keep the three promises (jede Woche · ohne Hype · jederzeit abbestellbar) and hint at the four sections.

- [ ] **Step 1: Check nothing tests the old copy**

Run: `grep -rn "praktische Idee" src`
Expected: only `src/app/newsletter/page.tsx` (the strings we're about to change). If a test asserts it, update that test in this task too.

- [ ] **Step 2: Update the metadata description**

In `src/app/newsletter/page.tsx`, replace the `description` value:

```tsx
  description:
    "Jede Woche eine kurze Mail: eine Idee aus der KI-Welt, ein Tipp, wie ich es selbst nutze – und ein Meme. Ruhig erklärt, ohne Hype.",
```

- [ ] **Step 3: Update the hero lead**

Replace the `lead` prop on `<PageIntro>`:

```tsx
        lead="Jede Woche eine kurze Mail: eine Idee aus der KI-Welt, ein Tipp zum Ausprobieren, wie ich es selbst im Alltag nutze – und zum Schluss ein Meme. Ruhig erklärt, ohne Hype, jederzeit abbestellbar."
```

- [ ] **Step 4: Verify typography + tests**

Run:
```bash
node -e 'const s=require("fs").readFileSync("src/app/newsletter/page.tsx","utf8");console.log("emdash",(s.match(/–/g)||[]).length,"endash",(s.match(/–/g)||[]).length)'
```
Expected: `emdash 0 endash 2` (both new lines use the spaced en-dash). If `emdash` > 0, fix via `fs` replace.

Run: `npx vitest run`
Expected: PASS (all suites, including existing newsletter tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/newsletter/page.tsx
git commit -m "feat(newsletter): signup copy hints at the four sections"
```

---

## Task 8: Document the build

**Files:**
- Modify: `Website/CLAUDE.md`

- [ ] **Step 1: Add a Newsletter (send) note + gotchas**

In `Website/CLAUDE.md`, add a short subsection (place it near the other feature/gotcha notes; match the file's existing heading style). Content to add verbatim:

```markdown
### Newsletter (send)
Issues are `.md` files in `content/newsletter/` (frontmatter: `subject`, `previewText`, `date`, `draft`; body = the 4 fixed sections, see `Knowledge/marketing/newsletter.md`). Send via `npm run newsletter -- --preview <slug>` / `--test you@x.de <slug>` / `--send <slug>` (`--at <iso>` to schedule).
- **Logic is `.mjs` under `scripts/newsletter/`**, not `src/lib` – the runner is bare `node`, which can't import TS or the `@/` alias. Tested via Vitest's default `*.test.mjs` glob.
- **Broadcasts** target `NEWSLETTER_SEGMENT_ID` (Resend `broadcasts.create({segmentId,…})` → `broadcasts.send(id)`). `--send` refuses a `draft: true` issue.
- The unsubscribe link is the literal `{{{RESEND_UNSUBSCRIBE_URL}}}` token – Resend fills it on broadcast; it stays literal in preview/test (expected).
- Needs Node ≥ 22.9 (`--env-file-if-exists`). Secrets load from `.env.local`.
```

- [ ] **Step 2: Add a changelog line**

Add a dated line to the CLAUDE.md changelog (match existing format), e.g.:

```markdown
- 2026-06-27 – Newsletter send mechanism: repo-based issues (`content/newsletter/`) + `scripts/newsletter/*` + `npm run newsletter` (preview/test/broadcast via Resend segment). Signup copy now hints the 4 sections.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(newsletter): record send mechanism + gotchas"
```

---

## Final Verification

- [ ] `npx tsc --noEmit` – TS app code still compiles (the `.mjs` files are outside tsconfig include; this confirms the page.tsx edit is clean).
- [ ] `npm run lint` – ESLint passes (incl. the new `.mjs`).
- [ ] `npx vitest run` – all suites green (4 new `scripts/newsletter/*.test.mjs` + existing).
- [ ] `npm run newsletter -- --preview 2026-06-30-der-kunde-um-22-uhr` – preview renders; visually check at ~560px in a browser.
- [ ] Quote/dash byte-check passed on the issue file and `page.tsx` (Steps in Tasks 6 & 7).
- [ ] Then finish with **superpowers:finishing-a-development-branch** (merge `feat/newsletter-send` → main only on explicit founder approval; push to main auto-deploys to Vercel).

## Owner / env steps (not code – outside this plan, tracked in HQ §7)

These gate the first real `--test`/`--send`, not the build:
- Create the Resend **Audience + Segment**; set `NEWSLETTER_SEGMENT_ID`.
- Set `NEWSLETTER_SECRET`, `RESEND_API_KEY`, `CONTACT_FROM` in `.env.local` **and** Vercel.
- Produce the meme PNG → `public/images/newsletter/2026-06-30-meme.png` before sending issue #1.
- Flip the issue's `draft: true` → `false` only when it's ready to broadcast.

## Self-review notes (for the implementer)
- Types/shapes are consistent across tasks: the `Issue` shape (`slug, subject, previewText, date, draft, body`) defined in Task 1 is what Tasks 3 & 5 consume; `parseSendArgs` output (`mode, slug, testEmail?, scheduledAt?`) is what Task 5 consumes.
- `renderBlocks`/`toPlainText`/`buildIssueEmail` signatures match between Tasks 2, 3, and 5.
- No placeholders: every code step is complete and runnable.
