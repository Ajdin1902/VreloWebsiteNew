# Ideas.md — Vrelo enhancement backlog

Unscheduled ideas for future polish/design phases. Not committed to any phase. Each open item notes the relevant files, brand tokens, and things to watch so a future session can pick it up without re-deriving context. See [Brand.md](Brand.md) for the rules every idea must respect (70/20/10 palette, `<BrandWord>` italics, outcome-over-mechanism voice) and [CLAUDE.md](CLAUDE.md) for current state + gotchas.

> **Status (2026-06-08):** the site is built, merged & live; refining post-launch. Most of the original backlog has shipped (see below). Open: #3 („KI“ wording), the partner-framing principle (ongoing), and the remaining design-skill pass (Kontakt/Newsletter/legal). New post-launch ideas at the bottom.

---

## Landing-page principles (apply when adjusting the hero / top part)

A conversion framework for the homepage **top fold** (`src/components/Hero.tsx` + its copy). Each element earns its place by doing one job — read top to bottom, every line should make the next one more believable. Keep within the brand voice (outcome over mechanism, calm over hype, generic masculine, `<BrandWord>` italics, German typography „…“ + en-dash). These four are the **structure**; the [Brand.md](Brand.md) voice rules are the **tone** — both apply.

1. **Headline — grab attention with a clear outcome or their problem.** Promise the result the owner wants, or name the repetitive task that eats their day, directly. Not the mechanism („Automatisierung mit n8n“) but the payoff/pain („Du verbringst jeden Tag eine Stunde mit immer derselben Aufgabe.“ → or the outcome version). One idea, said plainly.
2. **Subheadline — clarify the promise, add the useful context.** Answer the „wie/für wen/was genau“ the headline raises: who it's for, what changes, why it's safe (no big project, nothing to learn/maintain). This is where „KI-gestützt, das du nicht verstehen musst“-type reassurance can live (see #1 below).
3. **Image — prove it by visualising the outcome / what they get.** The hero image should make the promise concrete — show the *result* (a clear head / an empty to-do list / the work running itself), not decoration. ⚠️ Today the hero is the `RippleImage` WebGL water panel (atmosphere, not proof) and it's the **LCP** — any change must keep the static `<img>` as LCP and the reduced-motion/no-WebGL fallback (see CLAUDE.md → Gotchas). Treat „make the image prove the outcome“ as a design question to resolve before swapping it.
4. **CTA — say what they get and how.** Spell out the next step and its payoff, not a bare „Senden“. E.g. „Kostenloses Erstgespräch buchen — wir finden die eine Aufgabe, die dir am meisten Zeit kostet.“ The button states the *what*; a sub-line or the surrounding copy can state the *how*.

> These principles describe the **target**, not the current state. Schedule the hero rework as one cohesive pass (copy + image + CTA interact) via brainstorming → a plan — not piecemeal drift.

---

## ✅ Shipped (kept for the record)
Implementation detail now lives in the code + CLAUDE.md; specs in `docs/superpowers/specs/`.
- **Logo everywhere** — `BrandLockup` in Header + Footer, favicon `src/app/icon.svg`, branded OG images; full-screen `MobileNav` drawer.
- **Hero ripple** — interactive **WebGL water panel** (`RippleImage`): static `<img>` is the LCP, the amber drop *seeds* the ripple; degrades to the still on reduced-motion / no-WebGL.
- **Darker palette on the homepage** — petrol bands (`WasIchBaue` + `Steps` as one `tone="petrol"` block); deep-water Hero + Footer.
- **CTA effect** — sheen + slight lift on hover (`.cta-fx`, primary only; `filter: drop-shadow` so the focus ring survives). Spec: `2026-06-06-vrelo-cta-effect-design.md`.
- **Hero text reveal** — staggered fade-up, LCP-safe (H1 transform-only). Spec: `2026-06-06-vrelo-hero-text-reveal-design.md`.
- **Homepage scroll-reveal** — two-way staggered reveal via the shared **`Reveal`** primitive (`html.reveal-ready`-gated so no-JS shows everything). Spec: `2026-06-06-vrelo-scroll-reveal-design.md`. *(Reusable on other pages if ever wanted — kept homepage-only for now.)*
- **Design-skill pass** — homepage + Leistungen / Über-mich / FAQ / Ratgeber (taste → high-end-visual-design → impeccable, redesign-preserve). **Remaining: Kontakt / Newsletter / legal** (tracked in CLAUDE.md → Next session, after that content is finalized).
- **Ratgeber reading surface** — article pages use a deeper `lesepapier #ece3d2` (`Section tone="reading"`) + 18px body; marketing pages keep `papier #f4efe6`.

---

## Open ideas

### 1. Use the term „KI“ (Künstliche Intelligenz) — carefully
Introduce „KI“ / „Künstliche Intelligenz“ where it aids clarity or SEO.
- **Tension to resolve first:** the audience is *intimidated by „Tech“/„KI“* and the voice is **outcome over mechanism**. So „KI“ should appear sparingly and reassuringly (e.g. „KI-gestützte Automatisierung, die du nicht verstehen musst“) — never as hype. Likely homes: a Leistungen sub-line, an FAQ entry („Brauche ich KI-Kenntnisse?“ → no), SEO metadata.
- **Files:** `src/lib/{leistungen,faq}.ts`, page `metadata`, Ratgeber copy.
- **Decide with the founder** whether „KI“ is on-brand front-and-center or stays a quiet supporting term.

### 2. Partner framing — keep it implicit (ongoing principle)
Largely applied (Über-mich tone, Merak-close), but keep this rule for all future copy: let „jemand, mit dem ich auch in Zukunft arbeiten kann“ build quietly — never claimed. **No** „zukunftssicher“ / „mit uns skalieren“ / „dein Partner für morgen“ (banned hype registers). Partnership is **felt** through the brand's durability words (dokumentiert · stabil · wartbar · still im Hintergrund) and a human who stays reachable. **Max one such cue per page.** Verify any support claim („ich bleibe erreichbar“) is one the founder will honor.

### 3. Article header seam (Ratgeber)
On `/ratgeber/[slug]` the sticky header is `papier/90 + blur` while the reading surface is the deeper `lesepapier` → a faint seam at the top. Accepted as minor for now. If it bothers later: make the header route-aware and tint it to `lesepapier` on article routes for a seamless reading zone (adds route-awareness to the shared Header — weigh the complexity).

### 4. Ratgeber index as a darker reading zone (optional)
Currently `/ratgeber` (index) stays light `papier`; only articles are `lesepapier`. Option: give the index the reading surface too, so the whole Ratgeber section feels like one calm zone (then only the index→article step is seamless). Trade-off: the index loses the brighter marketing energy. Decide by eye if it ever feels disjointed.

### 5. Long-article reading rhythm
For 6-min reads, the body can run long between subheads. Add a second `>` pull-quote or a hairline section divider to give the eye a rest (Ratgeber analysis finding D4, deferred P3). `src/components/Prose.tsx`. Keep ≤1 water metaphor and the calm register.

### 6. Newsletter sending — automate Resend Broadcasts
4b only **collects + confirms** subscribers (double-opt-in → Resend Audience). Composing/sending an issue is currently a manual Resend **Broadcast**. A future phase could automate Broadcasts (compose from MDX, schedule, managed unsubscribe). See CLAUDE.md → Owner cutover → Newsletter.

### 7. Grow the Ratgeber (SEO engine)
Use the project skill **`.claude/skills/ratgeber-article/`** to publish new articles regularly — it scaffolds frontmatter + a brand-voice draft + the cover prompt. Each needs a cover WebP (`image_prompt.md` §9 motifs) before `npm test` passes / publishing. The Ratgeber is the long-tail organic-search play.

---

### Cross-cutting notes
- Respect existing enforcement: `<BrandWord>` for „Vrelo“/„Merak“, brand `@theme` tokens only (no hand-rolled hex), `prefers-reduced-motion` on every animation.
- German typographic quotes „…“ = U+201E/U+201C and the en-dash „ – “ (U+2013, not the em-dash) in any client-facing copy.
- Schedule design ideas as cohesive passes (they interact — e.g. header tint + reading-zone both touch the Ratgeber surface), not piecemeal drift.
