# Vrelo Phase 5 — Legal & polish + custom-domain prep · Design Spec

> Date: 2026-06-06 · Branch: `feat/phase5-legal-polish`
> Builds on: Phases 1–4 (all shipped + live) · [main design spec](2026-06-01-vrelo-website-design.md) · [Brand.md](../../../Brand.md) · [CLAUDE.md](../../../CLAUDE.md)
> Client-facing copy is **German**; code/comments **English**. German quotes: „…“ = U+201E + U+201C.

## 1. Goal

Close the codeable gaps before the custom-domain launch: make legal-page links clickable, make `siteUrl` env-driven so connecting **vrelo-ki.de** is a config toggle rather than a code change, and do a focused code-level SEO pass (per-page canonicals + Twitter/X cards). The heavy, owner-gated parts of Phase 5 — the lawyer-reviewed legal text, the DNS cutover, the Resend sending-domain verification — are **out of scope as code** and handed off as documented owner steps.

## 2. Context & readiness (locked in brainstorming)

| # | Decision |
|---|---|
| D1 | **Custom domain `vrelo-ki.de` is owned but not connected.** Prepare the code now; do **not** flip the live site to a dead domain. The cutover is an owner step (DNS + Vercel env), documented in CLAUDE.md. |
| D2 | **Legal content is still pending** (founder/lawyer). Build the **code enabler only** — clickable inline links in legal pages — and keep the `[Platzhalter]` drafts. |
| D3 | **Perf/SEO = focused code-level pass.** The foundation (metadataBase, OG, JSON-LD, sitemap, robots, article canonicals) already shipped in Phase 3; this closes the remaining gaps without churn. |
| D4 | **Twitter/X cards: include them** (cheap, completeness) even though OG already covers previews on most platforms. No account/posts needed — passive metadata. |
| D5 | **`siteUrl` becomes env-driven** (`NEXT_PUBLIC_SITE_URL` with a safe fallback) so the domain flip is a Vercel env change + redeploy, zero code edits. |

## 3. Codeable scope

Three small, independent, testable workstreams. No decomposition needed — they share the theme "polish before custom-domain launch."

### 3.1 Clickable links in legal pages

The `LegalPage` renderer currently emits each section body as a single plain `<p className="whitespace-pre-line">{body}</p>` — so URLs in the Impressum (notably the EU OS-Plattform link) render as dead text.

- Keep `LegalSection.body` as a **plain string**, but allow **Markdown-style inline links** `[label](url)` inside it.
- Add a pure, tested parser `parseInlineLinks(text: string): InlinePart[]` in a new module `src/lib/legal/inline-links.ts`:
  - `type InlinePart = { type: "text"; value: string } | { type: "link"; label: string; href: string };`
  - Splits on the pattern `[label](href)`. Text outside matches is preserved verbatim (including newlines). Malformed fragments (a `[` with no following `(...)`) are left as literal text.
  - Only `http(s)` hrefs are linkified; any other scheme is left as literal text (defensive — avoids `javascript:` etc.).
- `LegalPage` maps each section body through `parseInlineLinks` and renders text parts in a `whitespace-pre-line` wrapper and link parts as `<a href target="_blank" rel="noopener noreferrer">` styled with brand tokens (`text-vrelo-petrol underline underline-offset-2`).
- Update `src/lib/legal/impressum.ts`: the EU-Streitschlichtung body becomes `…(OS) bereit: [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr). …` so it renders as a real link. No other legal copy changes (still `[Platzhalter]`).

### 3.2 Env-driven `siteUrl`

- `src/lib/site.ts`:
  ```ts
  export const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://vrelo-website.vercel.app"
  ).replace(/\/+$/, "");
  export const siteName = "Vrelo";
  export function canonical(path: string): string {
    return `${siteUrl}${path}`;
  }
  ```
  - `NEXT_PUBLIC_*` is inlined at build, so `metadataBase`, sitemap, robots, JSON-LD, OG images and all canonicals follow automatically.
  - The trailing-slash strip prevents `//` when a value is set with a trailing `/`.
  - `canonical("")` → the bare origin (home); `canonical("/faq")` → `${siteUrl}/faq`.
- `.env.example`: document `NEXT_PUBLIC_SITE_URL` (public; the production base URL, e.g. `https://vrelo-ki.de`; unset → falls back to the Vercel URL).
- **No flip in this phase** — the env stays unset so production keeps using the Vercel URL until the owner connects the domain.

### 3.3 Focused SEO pass

- **Twitter/X cards** — add to root `metadata` in `src/app/layout.tsx`:
  ```ts
  twitter: {
    card: "summary_large_image",
    title: { default: "Vrelo — Durchdachte Automatisierung für kleine Betriebe", template: "%s — Vrelo" },
    description:
      "Maßgeschneiderte Automatisierungen für kleine Betriebe. Du gewinnst Zeit, Ruhe und einen freien Kopf zurück.",
  },
  ```
  Inherits to every page; reuses the generated OG image automatically (the `opengraph-image` route also serves Twitter).
- **Per-page canonical** — add `alternates: { canonical: canonical("<path>") }` to the `metadata` of the routes that lack it: `/` (`""`), `/leistungen`, `/ueber-mich`, `/faq`, `/ratgeber`, `/kontakt`, `/impressum`, `/datenschutz`, `/newsletter`. Use the new `canonical()` helper (DRY).
  - The Ratgeber article pages (`/ratgeber/[slug]`) already set `alternates.canonical`; refactor them to use `canonical()` for consistency (behavior unchanged).
  - `/newsletter/bestaetigt` keeps `robots: { index: false }` and gets **no** canonical (transactional).
- **Perf** — verify only; no speculative changes. The site is static, fonts are self-hosted via `next/font` (auto-preloaded), there are no raster `<img>` in the render path (only the decorative `LazyVideo` poster with `alt=""`+`aria-hidden`), and video is lazy (`preload="none"`). Apply a quick win only if the audit reveals a concrete one; otherwise record "verified, no change needed".

## 4. Files

**Create**
- `src/lib/legal/inline-links.ts` — `InlinePart` type + `parseInlineLinks`.
- `src/lib/legal/inline-links.test.ts`.

**Modify**
- `src/components/legal/LegalPage.tsx` — render bodies via `parseInlineLinks` (text + `<a>` parts).
- `src/components/legal/LegalPage.test.tsx` — assert an `[label](url)` body renders an `<a href>`.
- `src/lib/legal/impressum.ts` — linkify the EU OS-Plattform URL.
- `src/lib/legal/legal.test.ts` — assert the OS URL is present in `[…](…)` form.
- `src/lib/site.ts` — env-driven `siteUrl` + `canonical()` helper.
- `src/lib/site.test.ts` — fallback when unset; env value wins + trailing slash stripped; `canonical()` builds paths.
- `src/app/layout.tsx` — Twitter card metadata.
- `src/app/{page,leistungen/page,ueber-mich/page,faq/page,ratgeber/page,kontakt/page,impressum/page,datenschutz/page,newsletter/page}.tsx` — add `alternates.canonical` via `canonical()`.
- `src/app/ratgeber/[slug]/page.tsx` — use `canonical()` (behavior unchanged).
- `.env.example` — document `NEXT_PUBLIC_SITE_URL`.
- `CLAUDE.md` — status/roadmap + Phase 5 owner go-live todos (final task).

## 5. Testing & verification

Follows the existing TDD + per-task-commit workflow; full gate green at each task.

- **Pure (`parseInlineLinks`):** plain text → single text part; one `[label](url)` → text+link+text parts; multiple links; a `[` with no `(...)` → literal text; a non-http scheme (e.g. `mailto:` / `javascript:`) → not linkified; href and label captured correctly.
- **`LegalPage`:** a section body with `[Vrelo](https://example.de)` renders an `<a href="https://example.de">` with `target="_blank"` + `rel="noopener noreferrer"`; plain bodies still render as text (regression).
- **Impressum:** render/content test asserts the OS URL appears as a link (`<a href="https://ec.europa.eu/consumers/odr">`).
- **`site.ts`:** `siteUrl` falls back to the Vercel URL when `NEXT_PUBLIC_SITE_URL` is unset; a set value wins and a trailing slash is stripped; `canonical("/faq")` → `${siteUrl}/faq`. (Use `vi.stubEnv` — but note: `siteUrl` is a module-level const evaluated at import, so test the normalization logic via a small exported pure helper `normalizeBase(value?: string)` that `siteUrl` uses, to keep it testable without module-reset gymnastics.)
- **Metadata:** assert root `metadata.twitter.card === "summary_large_image"`; spot-check one page's `alternates.canonical`.
- **Gate:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build` — all green; sitemap/robots/OG/canonicals all derive from `siteUrl`; build route list unchanged.

## 6. Owner go-live steps (not code — handed off, documented in CLAUDE.md)

1. **Connect the domain:** add `vrelo-ki.de` (+ `www`) to the Vercel project → set the DNS records Vercel shows at the registrar → wait for SSL.
2. **Flip the base URL:** set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de` in Vercel → redeploy. Canonicals/OG/sitemap follow automatically.
3. **Redirects:** keep the `*.vercel.app` URL reachable; optionally 308-redirect it to the apex via Vercel domain settings.
4. **Legal sign-off:** founder/lawyer replace every `[Platzhalter]` in `src/lib/legal/{impressum,datenschutz}.ts` with real data and verified wording (the OS link now renders clickable).
5. **Conversion env (carried from Phase 4):** set the Kontakt + Newsletter env vars and verify the Resend sending domain (SPF/DKIM) for `vrelo-ki.de`.
6. **Post-cutover:** resubmit the sitemap (`https://vrelo-ki.de/sitemap.xml`) in Google Search Console.

## 7. Risks & notes

- **Don't flip `siteUrl` early** — pointing the live site's canonicals/OG/sitemap at an unconnected `vrelo-ki.de` would harm SEO. The env stays unset until the domain is verified live (D1).
- **Inline-link parser is defensive** — only `http(s)` is linkified, links open in a new tab with `rel="noopener noreferrer"`. Legal text is still a draft pending lawyer review (D2).
- **No ranking promises** — Twitter cards and canonicals are correctness/hygiene, not ranking levers; the real ranking work is the German Ratgeber content (Phase 3, ongoing).
- **Out of scope:** lawyer-reviewed legal copy, the DNS cutover + env flip, Resend domain verification (all owner steps in §6), and the end-stage visual/animation polish (Ideas.md #6, intentionally after this).
- **Brand discipline:** `@theme` tokens only, „Vrelo“/„Merak“ via `<BrandWord>`, German typographic quotes (U+201E/U+201C) in any client-facing copy (verify bytes — the Edit-tool downgrade gotcha).
