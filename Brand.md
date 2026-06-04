# Brand.md — Vrelo Brand Brief

The working brand brief for the Vrelo website, distilled from the canonical brand docs. When any brand/design/copy decision arises, follow this. The full source of truth lives in `C:\Users\ajdin\OneDrive\AJ19\ADZ\Brand\` (`Vrelo-Brand.md`, `vrelo-brand-voice.md`, `vrelo-brand-cheatsheet.md`, `vrelo-brand-summary.md`).

> Edition 01 · Mai 2026 · DACH market. All **client-facing copy is German**; code comments / internal notes in English.

---

## 1. The brand in one breath

**Vrelo** is an AI-automation agency for German-speaking small businesses (DACH Solo-Selbstständige & Kleinunternehmer). The brand runs on a **two-part duality** — honor it in every design and copy decision:

| | ***Vrelo*** (the source) | ***Merak*-Effekt** (the outcome) |
|---|---|---|
| Meaning | "Spring/source" (Bosnian) | "Quiet joy of a simple, beautiful moment" (Bosnian) |
| Role | The agency, infrastructure, what gets built | What the client *feels* — the emotional payoff |
| Tone | Cool, grounded, technical, premium | Warm, human, poetic, quiet |
| Visual | Deep water → petrol → stone, clean lines | Amber drop, honey, sunlight, warm paper |
| Sells | Architecture | A feeling |

**Core promise:** *Vrelo errichtet die Quelle. Du erlebst den Merak-Effekt.*
**Essence (EN):** Vrelo builds the calm. The *Merak*-Effekt is what it feels like.
**Copy always flows cool source → warm outcome, and usually lands on the feeling.**

Pronunciation: **VREH-lo**. Origin: Vrelo Bosne, the turquoise spring near Sarajevo; founder (Ajdin) is Bosnian — the story is ownable and uncopyable.

---

## 2. Messaging — ready to use

| Slot | Line |
|---|---|
| **Primary tagline** | *Vrelo errichtet die Quelle. Du erlebst den Merak-Effekt.* |
| **Descriptor** (what-is-this) | **Durchdachte Automatisierung für kleine Betriebe.** |
| **Headline variant** | *Maßgeschneiderte Automatisierung für kleine Betriebe.* |
| **Positioning** | *Die Quelle deiner Automatisierung. Das Ergebnis: Merak-Effekt.* |
| CTA | **Quelle erkunden** (alt: „Unverbindlich kennenlernen", „Zeig mir, was möglich ist") |

**Website hero:**
- H1: *Vrelo* errichtet die Quelle. Du erlebst den *Merak*-Effekt.
- Sub: Maßgeschneiderte Automatisierungen für kleine Betriebe. Sie übernehmen den wiederkehrenden Kleinkram — du gewinnst Zeit, Ruhe und einen freien Kopf zurück.
- CTA: **Quelle erkunden**

**Service blurb ("Was wir tun"):** *Vrelo* baut maßgeschneiderte Automatisierungssysteme für kleine Betriebe im DACH-Raum. Wir schauen uns deinen Arbeitsalltag an, finden die Aufgaben, die dich täglich Zeit kosten — Termine, Nachfass-Mails, Dateneingabe, wiederkehrende Kommunikation — und bauen daraus eine saubere, dokumentierte Quelle, aus der diese Arbeit von selbst fließt. Keine Vorlagen von der Stange, kein Technik-Kauderwelsch. Nur ein ruhiges, verlässliches System im Hintergrund. Das ist der *Merak*-Effekt.

Other approved taglines: *Die Quelle. Der Merak-Effekt.* · *Aus der Quelle in den Fluss.* · *Wo dein Workflow entspringt.*

> **Descriptor rules:** keep `du`-voice OUT of the descriptor (it's a targeting line). The audience tag „kleine Betriebe" is a *swappable slot* — never fuse the descriptor into the logo; keep it as separate text. Variants: *für Selbstständige* / **für kleine Betriebe (current)** / *für kleine Unternehmen*.

---

## 3. Voice — four governing principles

1. **Klarheit vor Cleverness** — say it so plainly no one rereads. No jargon, no buzzwords.
2. **Ruhe vor Hype** — never loud, urgent, or salesy. No „!!!", no rocket emojis, no fake scarcity.
3. **Ergebnis vor Mechanik** — talk about the outcome (Zeit, Ruhe, Kopffreiheit), not the tech.
4. **Mensch vor Marke** — sound like a human who wants to help, not an agency selling. First person, „du" address.

- ✅ **Words:** Quelle · Fluss · Architektur · sauber · durchdacht · dokumentiert · stabil · Handwerk · Leichtigkeit · Ruhe · Kopffreiheit · Zeit zurückgewinnen · maßgeschneidert · still im Hintergrund · *Merak*-Effekt
- ❌ **Never:** skalieren · disrupten · KI-Magie · Game-Changer · Synergien · 10× Wachstum · revolutionär · KI/AI buzzword soup · „Workflow-Flickenteppich" (as self-description) · hype / hard sell / false urgency
- **Water metaphor:** at most ONE per piece (Quelle/Fluss) — evocative, not flooded.
- *Merak*-Effekt is a **feeling, never a product/package name**. Always paired with Vrelo (Quelle → Effekt), always warm register.

---

## 4. Visual identity — implement exactly, don't reinvent

### Colour — dual palette, **70 / 20 / 10** (cool / warm / neutral)
Never weight Petrol and Amber equally — one leads, the other accents. Vrelo content (how it works) → cool. Merak content (the feeling, results, testimonials) → warm.

```
/* Vrelo — cool (~70%) */
--tiefes-wasser: #0A2538;  /* headlines, footer, primary dark */
--vrelo-petrol:  #1B5063;  /* signature accent, links, highlights */
--stein:         #A8B5BA;  /* dividers, subtitles */
--gletscher:     #DCE7EB;  /* cool tint, card backgrounds */

/* Merak — warm (~20%) */
--ember:         #8B5E2C;  /* deep warm accent, italic quotes */
--amber:         #D4A24C;  /* THE drop colour, CTAs, Merak accents */
--honig:         #E8B86B;  /* hover states */
--sonnenlicht:   #F4E4C1;  /* Merak cards, warm backgrounds */

/* Neutral (~10%) */
--tinte:  #14181B;  /* body-text black */
--papier: #F4EFE6;  /* DEFAULT background — warm off-white, NOT pure white */
--faden:  #D4CCBC;  /* hairlines, dividers */
--stumm:  #7A7468;  /* labels, secondary text */
```

> In code these are Tailwind v4 `@theme` tokens in `src/app/globals.css` → utilities `bg-papier`, `text-tiefes-wasser`, `bg-amber`, etc.

### Typography
- **Plus Jakarta Sans** — everything (headlines, body, UI, labels). Weights 300/400/500/600/700. Fallbacks: Inter, Geist, Manrope. ([Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans))
- **Fraunces** — ONLY three uses: (1) the words **„Vrelo"** and **„Merak"** — **always italic, even in body text**; (2) pull-quotes / manifest; (3) large display logotype. Variable axes opsz 9–144, wght 300–900, SOFT 0–100, ital. ([Google Fonts](https://fonts.google.com/specimen/Fraunces))

```css
body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
.brand-word { font-family: 'Fraunces', serif; font-style: italic; }
```

> In code, fonts are self-hosted via `next/font` (`src/lib/fonts.ts`), and the `<BrandWord>` component (`src/components/BrandWord.tsx`) enforces the Fraunces-italic rule for „Vrelo"/„Merak".

### Logo — "Wellspring V"
Filled V-funnel + drop (the Merak-Effekt) above + thin water surface below. Drop **always points up** — never rotate, distort, shadow, or hollow-outline. Clear space ≥ drop height; min 80 px (8 mm) height. The wordmark "Vrelo" is **live text in Fraunces Italic**, not an outlined SVG.

All assets live in the repo at `public/logo/` (served at `/logo/…`). Source originals: `C:\Users\ajdin\OneDrive\AJ19\Vrelo\Brand\Logo\`, with a browsable gallery at `…\Logo\html\index.html` (open in a browser to preview/download every variant — gallery is source-only, not committed/served).

**Symbol — vector (SVG), a11y-labelled (`role="img"` + `<title>`); prefer these on the site:**
- `vrelo-symbol-navy-amber.svg` — **standard**, on light/Papier backgrounds
- `vrelo-symbol-petrol-amber.svg` — signature, on petrol surfaces
- `vrelo-symbol-paper-amber.svg` — reverse, on petrol/navy/ink backgrounds
- `vrelo-symbol-mono-{navy,paper,ink}.svg` — mono variants
- `merak-submark-amber.svg` — sub-mark for emotional contexts, **never a replacement for the Vrelo logo**
- `vrelo-symbol-navy.png` — raster fallback of the standard symbol (transparent, 440×480)

**Lockups — symbol + Fraunces „Vrelo" wordmark baked into one transparent PNG:**
- `vrelo-lockup-navy.png` — **standard lockup**, on light/Papier backgrounds (767×285)
- `vrelo-lockup-paper.png` — reverse lockup, on petrol/navy/dark surfaces
- `vrelo-lockup-navy-tagline.png` — lockup **with the tagline/claim** baked in

> **When to use a lockup vs. live text:** reach for a lockup when you need the symbol + „Vrelo" as a single flat image — social avatars, OG/share images, email signatures, slide decks. **On the website itself**, prefer the live-text rule (symbol SVG + Fraunces italic „Vrelo", see §3/§4-Typography) so the wordmark stays selectable, scalable text. Lockup wordmark spec: **Fraunces** opsz 144, weight 400, SOFT 100.

### Visual principles
Generous breathing room · clean lines, no clutter · calm + clarity · cool water meeting warm light. Never busy, never loud, never salesy.

---

## 5. Audience
Primary: DACH Solo-Selbstständige & Kleinunternehmer drowning in manual work — admin, follow-ups, scheduling, data entry, repetitive comms. Intimidated by "tech"/"KI". They want: calm over complexity, time back, control, lightness (the *Merak*-Effekt). Define the *market* wide; aim the *descriptor* narrow (currently „kleine Betriebe").

---

## 6. Pre-ship compliance checklist
- [ ] Reads like a human (first person, „du"), simple, no jargon
- [ ] Calm, never salesy — no urgency/hype/„!!!"/scarcity
- [ ] Outcome over mechanism; lands on the *Merak*-Effekt where it fits
- [ ] Duality correct: Vrelo = source/work, Merak-Effekt = felt result (never a package name)
- [ ] ≤1 water metaphor; official descriptor used, no `du` in it
- [ ] 70/20/10 colour weighting; Petrol ≠ Amber weight; background is Papier `#F4EFE6`, not white
- [ ] Plus Jakarta Sans everywhere; „Vrelo"/„Merak" always Fraunces *Italic*
- [ ] Logo: drop points up, min 80px, never distorted; submark never replaces logo
