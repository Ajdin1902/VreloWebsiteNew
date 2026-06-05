# Ideas.md — Vrelo enhancement backlog

Unscheduled ideas to consider for a future polish/design phase (likely after the core pages exist). Not committed to any phase yet. Each item notes the relevant files, brand tokens, and things to watch so a future session can pick it up without re-deriving context. See [Brand.md](Brand.md) for the rules every idea must respect (70/20/10 palette, `<BrandWord>` italics, outcome-over-mechanism voice).

---

## 1. Add the logo throughout the site

Put the brand mark in the **header**, **footer**, and anywhere else it earns its place (favicon, OG image, loading states).

- **Assets exist:** `public/logo/` has 7 SVG variants — pick by background:
  - On **dark/cool** surfaces (Hero, Footer if cool): `vrelo-symbol-paper-amber.svg` or `vrelo-symbol-navy-amber.svg`.
  - On **Papier** surfaces (Header): `vrelo-symbol-petrol-amber.svg` or a mono `vrelo-symbol-mono-navy.svg` / `vrelo-symbol-mono-ink.svg`.
  - `merak-submark-amber.svg` — **only** for emotional/Merak contexts, never as a replacement for the full Vrelo logo.
- **Files to touch:** `src/components/Header.tsx`, `src/components/Footer.tsx`.
- **Brand rules (Brand.md §logo):** drop **always points up** — never rotate/distort/shadow/hollow it; clear space ≥ drop height, min 80px height; the wordmark „Vrelo“ is **live Fraunces Italic text** (use `<BrandWord>`), not part of the outlined SVG. So: logo symbol = SVG, wordmark beside it = `<BrandWord>Vrelo</BrandWord>`.
- **Consider:** also wire `app/icon` (favicon) + an OG image once we're here.

## 2. Stronger amber drop + ripple effect on the Hero

The Hero already has a glowing amber drop (`src/components/Hero.tsx`, the `motion-safe:animate-drop-glow` element). Idea: make it more present and add a **ripple** emanating from where the drop "lands" — literalizing „Vrelo errichtet die Quelle“.

- **Files:** `src/components/Hero.tsx`; keyframes live in `src/app/globals.css` (alongside `drop-glow`).
- **Approach options:** CSS-only expanding ring(s) (`@keyframes` scaling + fading concentric circles) gated behind `motion-safe:`; or a small SVG/canvas ripple. Prefer CSS-only first (cheap, no JS, no LCP risk).
- **Watch:** Hero is the **LCP** surface — keep it GPU-cheap (transform/opacity only), honor `prefers-reduced-motion` (no ripple when reduced), and don't add a second competing focal point (Brand.md: one drop, one focal point).
- **Amber token:** `--color-amber #d4a24c` (the drop colour). Glow already uses it.

## 3. Use the term „KI“ (Künstliche Intelligenz) — carefully

Introduce „KI“ / „Künstliche Intelligenz“ where it aids clarity or SEO.

- **Tension to resolve first:** Brand.md positions the audience as *intimidated by „Tech“/„KI“* and the voice is **outcome over mechanism**. So „KI“ should appear sparingly and reassuringly (e.g. „KI-gestützte Automatisierung, die du nicht verstehen musst“) — never as hype. Likely homes: a Leistungen sub-line, an FAQ entry („Brauche ich KI-Kenntnisse?“ → no), and SEO metadata/keywords.
- **Files:** `src/lib/{leistungen,faq}.ts`, page `metadata`, future Ratgeber copy.
- **Decide with the founder** whether „KI“ is on-brand front-and-center or stays a quiet supporting term.

## 4. Bring more of the darker brand colours onto the landing page

The homepage is mostly Papier after the Hero. Idea: reintroduce the **deep/cool** end of the palette below the fold for depth and rhythm — without breaking the „calm Papier“ spine.

- **Dark/cool tokens:** `--color-tiefes-wasser #0a2538`, `--color-vrelo-petrol #1b5063` (utilities `bg-tiefes-wasser`, `text-gletscher`, `bg-vrelo-petrol`). `Section tone="cool"` already renders deep water.
- **Where:** e.g. a single cool `Section` (Proof/Vertrauen or Steps) as a tonal anchor, or a cool Footer. Keep **70/20/10** — Petrol leads cool moments, Amber only accents; don't let dark dominate the page or fight the Hero's role.
- **Files:** `src/app/page.tsx`, the `home/` sections, `src/components/Section.tsx` (`tone` prop already supports `cool`).
- **Watch:** contrast/a11y on dark sections; keep the Hero as the dominant deep-water moment so a mid-page cool band doesn't upstage it.

## 5. Position Vrelo as a long-term automation partner — implicitly

Let the sense „das ist jemand, mit dem ich auch in Zukunft arbeiten kann“ build quietly across the site, without ever saying it. The reader should *finish* the site trusting Vrelo as a lasting partner — not be *told* it on any single screen.

- **Tension to resolve first (read this before writing a word):** the audience is *intimidated by „Tech“/„KI“* and the voice is **Ruhe vor Hype / Mensch vor Marke** (Brand.md §3). So this must NEVER become future-/scale-/agency-pitch language — no „zukunftssicher“, „mit uns skalieren“, „die Zukunft ist KI“, „dein Partner für morgen“. Those are exactly the hype registers the brand bans, and they repel this audience. Partnership is **felt, not claimed** — like the *Merak*-Effekt itself.
- **The on-brand lever:** the brand vocabulary already implies longevity — **dokumentiert · stabil · wartbar · sauber gebaut · still im Hintergrund**. A system „das bleibt“ *is* the partnership promise. So convey it two ways: (a) **durability** — what's built keeps working and can grow with the business; (b) **„ich bleibe da“** — a human who stays reachable after the project, not an agency that ships and vanishes. Founder-as-craftsman, not vendor.
- **Subtle levers, by surface (pick a few, don't do all — repetition kills subtlety):**
  - **Über mich** (`src/lib/ueber-mich.ts`): one line in the founder story signalling he stays — builds relationships, not one-off projects.
  - **Leistungen** (`src/lib/leistungen.ts`): frame deliverables as „sauber dokumentiert, damit es auch in einem Jahr noch läuft“ — durability as a feature, not a sales line.
  - **FAQ** (`src/lib/faq.ts`): the single most natural home — e.g. „Was passiert nach dem Projekt?“ → „Du bist nicht allein; ich bleibe erreichbar und das System lässt sich anpassen, wenn sich etwas ändert.“ Quiet, factual, reassuring.
  - **Merak-close / homepage end** (`src/components/home/MerakClose.tsx`): at most a faint note of continuity — the *beginning* of a calm working relationship, not a CTA shout.
- **Files:** `src/lib/{ueber-mich,leistungen,faq}.ts`, `src/app/ueber-mich/page.tsx`, `src/components/home/MerakClose.tsx`; SEO metadata only if it reads naturally.
- **Watch:** **one** such cue per page, max — the whole effect dies if it's everywhere (that's the „annoying“ failure mode the founder flagged). Mind the **≤1 water metaphor** rule if reaching for „die Quelle wächst mit dir“ (evocative, but it spends the page's one water metaphor). Keep `du`-voice, first person, no urgency. Verify any new claim („ich bleibe erreichbar“, ongoing support) is one the founder will actually honor before shipping — same drafts-to-verify discipline as the 2b copy.

## 6. End-stage frontend polish pass — run the design skills

Once the content/conversion/legal phases are in, do a dedicated **frontend upgrade pass** by invoking the design skills together, so the whole site levels up cohesively (not page-by-page drift):
- **`frontend_design_kowalski`** — UI polish, component craft, animation/interaction detail (the invisible details that make it feel great).
- **`design-taste-frontend`** (the "taste skill") — anti-slop, audit-first redesign; removes templated/generic AI aesthetics.
- **`impeccable`** — visual hierarchy, spacing, typography, motion, micro-interactions, a11y, design-system/token hardening.

- **How to run it:** brainstorm the design direction first (one cohesive vision), then apply the three skills as a single polish pass — ideally folding in the other Ideas here (logo everywhere, hero ripple, darker palette, implicit partner framing) so they're considered together rather than competing.
- **Non-negotiables to preserve:** brand `@theme` tokens only (no hand-rolled hex), `<BrandWord>` for „Vrelo“/„Merak“, `prefers-reduced-motion` on every animation, German typographic quotes „…“ (U+201E/U+201C), Hero stays the LCP focal point, calm-over-loud per Brand.md.
- **Schedule:** end-stage (after Phase 4 conversion + Phase 5 legal), as the final design pass before/with custom-domain launch.

---

### Cross-cutting notes
- All of these are **design polish** — schedule after Phase 2c (and probably after the conversion/legal phases), as a dedicated „design pass“ so they're considered together (they interact: darker colours + ripple both compete for attention).
- Respect existing enforcement: `<BrandWord>` for „Vrelo“/„Merak“, brand `@theme` tokens only (no hand-rolled hex except where already established), `prefers-reduced-motion` for every animation.
- German typographic quotes „…“ = U+201E/U+201C in any client-facing copy these ideas produce.
