# Vrelo Phase 5 — Legal & polish + custom-domain prep · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make legal-page links clickable (Markdown-style inline links + tested parser), make `siteUrl` env-driven with a `canonical()` helper so the vrelo-ki.de cutover is a config toggle, and do a focused SEO pass (Twitter/X cards + per-page canonicals).

**Architecture:** A pure, tested `parseInlineLinks` parser drives a thin renderer change in `LegalPage`. `siteUrl` gains a pure `normalizeBase` helper (env-driven, trailing-slash-safe) plus a `canonical(path)` helper reused across every route's metadata. The actual domain DNS flip + lawyer legal copy stay owner steps (documented in CLAUDE.md), not code.

**Tech Stack:** Next.js 16 (App Router, RSC, Metadata API) · TypeScript · Vitest + React Testing Library.

**Spec:** [docs/superpowers/specs/2026-06-06-vrelo-phase5-legal-polish-design.md](../specs/2026-06-06-vrelo-phase5-legal-polish-design.md)

**Branch:** `feat/phase5-legal-polish` (already checked out). Commit after every task; messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## Conventions (read once)

- **Commands:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`. Single file: `npx vitest run <path>`.
- **Brand:** colors only via Tailwind `@theme` tokens — links use `text-vrelo-petrol underline underline-offset-2`. „Vrelo“/„Merak“ via `<BrandWord>`. German typographic quotes `„…“` = U+201E/U+201C (verify bytes after editing German copy).
- **Path alias:** `@/` → `src/`.
- **Next 16:** route `params`/`searchParams` are Promises; per-page `metadata` merges over the root layout's.
- **Testability gotchas:**
  - `siteUrl` is a module-level const evaluated at import — do NOT try to re-evaluate it with different env in the same test. Test the pure `normalizeBase(value?)` helper instead.
  - Do NOT import `src/app/layout.tsx` in a Vitest test — it imports `./globals.css` and the Vitest config has no Tailwind plugin, so it may fail to transform. Verify the Twitter card via `npm run build` + a `grep` in the gate task, not a unit import. Route page modules (e.g. `leistungen/page.tsx`) do NOT import globals.css, so importing their `metadata` in a test is fine.

## File overview

**Create**
- `src/lib/legal/inline-links.ts` — `InlinePart` type + `parseInlineLinks`.
- `src/lib/legal/inline-links.test.ts`.

**Modify**
- `src/components/legal/LegalPage.tsx` + `…/LegalPage.test.tsx` — render bodies through `parseInlineLinks`.
- `src/lib/legal/impressum.ts` + `src/lib/legal/legal.test.ts` — linkify the EU OS URL.
- `src/lib/site.ts` + `src/lib/site.test.ts` — `normalizeBase`, env-driven `siteUrl`, `canonical()`.
- `.env.example` — document `NEXT_PUBLIC_SITE_URL`.
- `src/app/layout.tsx` — Twitter card metadata.
- `src/app/page.tsx`, `src/app/leistungen/page.tsx`, `src/app/ueber-mich/page.tsx`, `src/app/faq/page.tsx`, `src/app/ratgeber/page.tsx`, `src/app/kontakt/page.tsx`, `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`, `src/app/newsletter/page.tsx` — add `alternates.canonical` via `canonical()`.
- `src/app/ratgeber/[slug]/page.tsx` — use `canonical()` (behavior unchanged).
- `src/app/canonical.metadata.test.ts` (new test) — assert a representative page's canonical.
- `CLAUDE.md` — status/roadmap + Phase 5 owner go-live todos (final task).

---

## Task 1: parseInlineLinks parser

**Files:** Create `src/lib/legal/inline-links.ts`; Test `src/lib/legal/inline-links.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/legal/inline-links.test.ts` → FAIL (cannot find module).

- [ ] **Step 3: Implement**

```ts
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
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/legal/inline-links.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/legal/inline-links.ts src/lib/legal/inline-links.test.ts
git commit -m "feat: add parseInlineLinks (markdown-style inline link parser)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: LegalPage renders inline links

**Files:** Modify `src/components/legal/LegalPage.tsx`, `src/components/legal/LegalPage.test.tsx`

- [ ] **Step 1: Add the failing test**

Add these cases inside the existing `describe("LegalPage", …)` in `src/components/legal/LegalPage.test.tsx`:
```tsx
  it("renders a markdown link in a section body as an external anchor", () => {
    render(
      <LegalPage
        doc={{
          title: "T",
          intro: "i",
          sections: [{ heading: "H", body: "siehe [Vrelo](https://example.de) hier" }],
        }}
      />,
    );
    const link = screen.getByRole("link", { name: "Vrelo" });
    expect(link).toHaveAttribute("href", "https://example.de");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("still renders plain bodies as text (no link)", () => {
    render(
      <LegalPage doc={{ title: "T", intro: "i", sections: [{ heading: "H", body: "nur Text" }] }} />,
    );
    expect(screen.getByText("nur Text")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/components/legal/LegalPage.test.tsx` → FAIL (no anchor rendered).

- [ ] **Step 3: Implement**

Replace the body paragraph in `src/components/legal/LegalPage.tsx`. Add the import at the top:
```tsx
import { parseInlineLinks } from "@/lib/legal/inline-links";
```
Replace this:
```tsx
              <p className="mt-2 whitespace-pre-line leading-relaxed text-tinte/90">{s.body}</p>
```
with:
```tsx
              <p className="mt-2 whitespace-pre-line leading-relaxed text-tinte/90">
                {parseInlineLinks(s.body).map((part, i) =>
                  part.type === "link" ? (
                    <a
                      key={i}
                      href={part.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vrelo-petrol underline underline-offset-2"
                    >
                      {part.label}
                    </a>
                  ) : (
                    <span key={i}>{part.value}</span>
                  ),
                )}
              </p>
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/components/legal/LegalPage.test.tsx` → PASS. Then `npx tsc --noEmit && npm run lint` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/legal/LegalPage.tsx src/components/legal/LegalPage.test.tsx
git commit -m "feat: render markdown inline links in LegalPage bodies" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Linkify the EU OS-Plattform URL in the Impressum

**Files:** Modify `src/lib/legal/impressum.ts`, `src/lib/legal/legal.test.ts`

- [ ] **Step 1: Add the failing test**

Add this case inside the existing `describe("legal content", …)` in `src/lib/legal/legal.test.ts`:
```ts
  it("impressum links the EU OS-Plattform URL with markdown syntax", () => {
    const os = impressum.sections.find((s) => /EU-Streitschlichtung/i.test(s.heading));
    expect(os).toBeDefined();
    expect(os!.body).toContain("[https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr)");
  });
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/legal/legal.test.ts` → FAIL.

- [ ] **Step 3: Implement**

In `src/lib/legal/impressum.ts`, in the `EU-Streitschlichtung` section, replace the bare URL `https://ec.europa.eu/consumers/odr` with the markdown form. The body becomes:
```ts
      body: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr). Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/legal/legal.test.ts` → PASS.

- [ ] **Step 5: Verify German quotes unchanged**

Run:
```bash
python -c "import io;t=io.open('src/lib/legal/impressum.ts',encoding='utf-8').read();print('201E',t.count(chr(0x201e)),'201C',t.count(chr(0x201c)))"
```
Expected: both `0` (impressum has no typographic quotes — only ß/ü). If non-zero they must be equal.

- [ ] **Step 6: Commit**

```bash
git add src/lib/legal/impressum.ts src/lib/legal/legal.test.ts
git commit -m "content: linkify the EU OS-Plattform URL in the Impressum" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Env-driven siteUrl + canonical() helper

**Files:** Modify `src/lib/site.ts`, `src/lib/site.test.ts`, `.env.example`

- [ ] **Step 1: Write the failing test**

Replace the contents of `src/lib/site.test.ts` with:
```ts
import { describe, it, expect } from "vitest";
import { siteUrl, siteName, canonical, normalizeBase } from "./site";

describe("site constants", () => {
  it("exposes an https base URL with no trailing slash", () => {
    expect(siteUrl).toMatch(/^https:\/\//);
    expect(siteUrl.endsWith("/")).toBe(false);
  });

  it("names the site Vrelo", () => {
    expect(siteName).toBe("Vrelo");
  });
});

describe("normalizeBase", () => {
  it("falls back to the Vercel URL when unset", () => {
    expect(normalizeBase(undefined)).toBe("https://vrelo-website.vercel.app");
  });
  it("uses a provided value", () => {
    expect(normalizeBase("https://vrelo-ki.de")).toBe("https://vrelo-ki.de");
  });
  it("strips trailing slashes", () => {
    expect(normalizeBase("https://vrelo-ki.de/")).toBe("https://vrelo-ki.de");
    expect(normalizeBase("https://vrelo-ki.de///")).toBe("https://vrelo-ki.de");
  });
});

describe("canonical", () => {
  it("builds an absolute URL from a path", () => {
    expect(canonical("/faq")).toBe(`${siteUrl}/faq`);
  });
  it("returns the bare origin for the homepage", () => {
    expect(canonical("")).toBe(siteUrl);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/lib/site.test.ts` → FAIL (`normalizeBase`/`canonical` not exported).

- [ ] **Step 3: Implement**

Replace `src/lib/site.ts` with:
```ts
// Single source for the public base URL. Set NEXT_PUBLIC_SITE_URL in Vercel
// (e.g. "https://vrelo-ki.de") to switch the production base; unset falls back
// to the Vercel deployment URL. NEXT_PUBLIC_* is inlined at build, so canonicals,
// OG, sitemap and robots all follow automatically.
const FALLBACK_BASE = "https://vrelo-website.vercel.app";

export function normalizeBase(value: string | undefined): string {
  return (value ?? FALLBACK_BASE).replace(/\/+$/, "");
}

export const siteUrl = normalizeBase(process.env.NEXT_PUBLIC_SITE_URL);
export const siteName = "Vrelo";

export function canonical(path: string): string {
  return `${siteUrl}${path}`;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/site.test.ts` → PASS.

- [ ] **Step 5: Document the env var**

Append to `.env.example`:
```bash

# Public production base URL (e.g. https://vrelo-ki.de). Unset → falls back to
# the Vercel deployment URL. Drives canonicals, OG, sitemap and robots.
NEXT_PUBLIC_SITE_URL=
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/site.ts src/lib/site.test.ts .env.example
git commit -m "feat: make siteUrl env-driven + add canonical() helper" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Twitter/X card metadata

**Files:** Modify `src/app/layout.tsx`

- [ ] **Step 1: Implement**

In `src/app/layout.tsx`, add a `twitter` block to the `metadata` object (after the `openGraph` block):
```tsx
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Vrelo — Durchdachte Automatisierung für kleine Betriebe",
      template: "%s — Vrelo",
    },
    description:
      "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
  },
```

- [ ] **Step 2: Verify (build + grep — do NOT import layout in a unit test)**

Run: `npx tsc --noEmit` → PASS.
Run:
```bash
grep -n "summary_large_image" src/app/layout.tsx
```
Expected: one match. The build in Task 7 confirms the metadata compiles.

- [ ] **Step 3: Verify German quotes unchanged**

Run:
```bash
python -c "import io;t=io.open('src/app/layout.tsx',encoding='utf-8').read();print('201E',t.count(chr(0x201e)),'201C',t.count(chr(0x201c)))"
```
Expected: both `0`.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Twitter/X summary_large_image card metadata" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Per-page canonical via canonical()

**Files:** Modify the 9 route pages + the article page; Test `src/app/canonical.metadata.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/app/canonical.metadata.test.ts
import { describe, it, expect } from "vitest";
import { metadata as leistungen } from "./leistungen/page";
import { metadata as faq } from "./faq/page";
import { metadata as home } from "./page";
import { canonical } from "@/lib/site";

describe("per-page canonical", () => {
  it("leistungen sets its canonical via canonical()", () => {
    expect(leistungen.alternates?.canonical).toBe(canonical("/leistungen"));
  });
  it("faq sets its canonical", () => {
    expect(faq.alternates?.canonical).toBe(canonical("/faq"));
  });
  it("home sets the origin as its canonical", () => {
    expect(home.alternates?.canonical).toBe(canonical(""));
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run src/app/canonical.metadata.test.ts` → FAIL (`home` has no `metadata` export / `alternates` undefined).

- [ ] **Step 3: Implement — home page (new metadata export)**

`src/app/page.tsx` currently has no `metadata` export (it inherits title/description from the layout). Add an import and a metadata export that ONLY sets the canonical (title/description keep inheriting). At the top of `src/app/page.tsx`, add:
```tsx
import type { Metadata } from "next";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("") },
};
```
(If `page.tsx` already imports other things, place these alongside the existing imports; keep the existing default-exported component unchanged.)

- [ ] **Step 4: Implement — the 8 pages with existing metadata**

For each page below, (a) ensure `canonical` is imported from `@/lib/site` (add the import, or extend an existing `@/lib/site` import), and (b) add `alternates: { canonical: canonical("<path>") },` into the existing `metadata` object.

- `src/app/leistungen/page.tsx` → `canonical("/leistungen")`
- `src/app/ueber-mich/page.tsx` → `canonical("/ueber-mich")`
- `src/app/faq/page.tsx` → `canonical("/faq")`
- `src/app/ratgeber/page.tsx` → `canonical("/ratgeber")`
- `src/app/kontakt/page.tsx` → `canonical("/kontakt")`
- `src/app/impressum/page.tsx` → `canonical("/impressum")`
- `src/app/datenschutz/page.tsx` → `canonical("/datenschutz")`
- `src/app/newsletter/page.tsx` → `canonical("/newsletter")`

Example shape (for `leistungen/page.tsx`):
```tsx
import { canonical } from "@/lib/site";
// ...
export const metadata: Metadata = {
  title: "Leistungen",
  description: "…unchanged…",
  alternates: { canonical: canonical("/leistungen") },
};
```

- [ ] **Step 5: Implement — refactor the article page to use canonical()**

In `src/app/ratgeber/[slug]/page.tsx`:
- add `canonical` to the existing `@/lib/site` import: `import { siteUrl, canonical } from "@/lib/site";`
- replace `alternates: { canonical: \`${siteUrl}/ratgeber/${article.slug}\` },` with `alternates: { canonical: canonical(\`/ratgeber/${article.slug}\`) },`
- leave the rest (including any other `siteUrl` use) unchanged.

- [ ] **Step 6: Run, verify pass**

Run: `npx vitest run src/app/canonical.metadata.test.ts` → PASS. Then `npx tsc --noEmit && npm run lint` → PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/app/leistungen/page.tsx src/app/ueber-mich/page.tsx src/app/faq/page.tsx src/app/ratgeber/page.tsx src/app/kontakt/page.tsx src/app/impressum/page.tsx src/app/datenschutz/page.tsx src/app/newsletter/page.tsx src/app/ratgeber/[slug]/page.tsx src/app/canonical.metadata.test.ts
git commit -m "feat: add explicit per-page canonical URLs via canonical()" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Full gate + docs

**Files:** Modify `CLAUDE.md`

- [ ] **Step 1: Full suite + types + lint + build**

Run: `npm test` → all pass. `npx tsc --noEmit && npm run lint && npm run build` → PASS. The build route list is unchanged; `/newsletter/bestaetigt` stays dynamic (`ƒ`), everything else static (`○`).

- [ ] **Step 2: Confirm canonical + twitter present in built output**

Run:
```bash
grep -rn "summary_large_image" src/app/layout.tsx
grep -rn "canonical(" src/app/page.tsx src/app/faq/page.tsx
```
Expected: the twitter card line and the `canonical()` calls are present.

- [ ] **Step 3: Update CLAUDE.md**

- Status: add a Phase 5 line — legal links clickable, `siteUrl` env-driven (`NEXT_PUBLIC_SITE_URL`), per-page canonicals + Twitter cards; built on `feat/phase5-legal-polish`.
- Resume: point at finishing-a-development-branch → merge, then the **owner go-live cutover** (connect vrelo-ki.de + set env) and the **end-stage design-skills pass** (Ideas.md #6).
- Roadmap: mark Phase 5 built (pending review + merge).
- Add a **Phase 5 owner go-live todos** block (checkboxes): connect `vrelo-ki.de` (+ `www`) in Vercel + DNS + SSL; set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de` + redeploy; optionally 308-redirect the `*.vercel.app` URL to the apex; founder/lawyer replace every `[Platzhalter]` (the OS link now renders clickable); resubmit `https://vrelo-ki.de/sitemap.xml` in Search Console.

- [ ] **Step 4: Verify German typographic quotes balance in CLAUDE.md**

Run:
```bash
python -c "import io;t=io.open('CLAUDE.md',encoding='utf-8').read();print('201E',t.count(chr(0x201e)),'201C',t.count(chr(0x201c)))"
```
Expected: `201C` is exactly one greater than `201E` (the single intentional counter-example on the „German typographic quotes“ key-decisions line). Any other imbalance must be fixed.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark Phase 5 (legal links + env-driven siteUrl + SEO) built; owner cutover todos" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Done

After Task 7, use **superpowers:finishing-a-development-branch** to merge `feat/phase5-legal-polish` into `main` (auto-deploys; the live site keeps using the Vercel URL because `NEXT_PUBLIC_SITE_URL` stays unset). Then the **owner** connects vrelo-ki.de + sets `NEXT_PUBLIC_SITE_URL` (cutover), and the founder/lawyer finalizes the legal copy. Final remaining work: the **end-stage frontend design-skills polish pass** (Ideas.md #6).
