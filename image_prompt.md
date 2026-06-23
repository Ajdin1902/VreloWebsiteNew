# image_prompt.md — Vrelo image prompt catalog

Reusable prompts for generating site imagery with Nano Banana (Gemini 2.5 Flash Image). Every prompt stays in the same calm water world so the whole site reads as one piece. Brand source of truth: [Brand.md](Brand.md).

## Shared rules (true for every prompt below)

- **Palette line (do not paraphrase):** *deep teal-navy `#0A2538`, petrol `#1B5063`, glacier turquoise, one warm amber-honey highlight `#D4A24C`/`#E8B86B`, warm off-white `#F4EFE6`; cool dominant, warm only as a small accent.* This is the brand's 70/20/10 (cool / warm / neutral) — never let the amber take over.
- **Style:** fine-art photorealistic water photography, soft natural light, shallow depth of field, calm, minimal, generous negative space, no HDR over-processing.
- **Register:** Vrelo content (the work — Leistungen, Ratgeber, FAQ) leans cool. Merak content (the feeling — Kontakt welcome) leans a touch warmer. Über-mich blends (cool source + warm story).
- **Universal negative** (paste into the negative field if your tool has one):
  `text, words, letters, captions, watermark, logo, signature, people, hands, faces, UI, charts, oversaturated, neon, HDR, busy, cluttered, lens flare, cartoon, 3D render, illustration`
- **Aspect ratio:** append `<W:H> aspect ratio` to the prompt AND set the tool's aspect-ratio control to the same value. All ratios below are native Nano Banana ratios.

## Aspect-ratio + placement reference

| # | Image | Page / placement | Aspect | Export (2×) |
|---|---|---|---|---|
| 0 | **Hero background (full-bleed, centered overlay)** | `/` Hero (full-bleed bg + petrol scrim) | **16:9** (center-safe) | ~2560 × 1440 |
| 1 | Bosnian spring | `/` Geschichte | **3:2** | 1800 × 1200 |
| 2 | Saubere Quelle | `/` Was ich baue | **4:5** | 1280 × 1600 |
| 3 | Fließen *(opt)* | `/` Steps | **21:9** | 2520 × 1080 |
| 4 | Petrol texture *(opt)* | `/` section bg | **16:9** | 2560 × 1440 |
| 5 | Water channels | `/leistungen` | **21:9** | 2520 × 1080 |
| 6 | Origin landscape | `/ueber-mich` | **16:9** | 2400 × 1350 |
| 7 | Invitation pool | `/kontakt` | **21:9** | 2520 × 1080 |
| 8 | Light through water | `/ratgeber` index | **16:9** | 2400 × 1350 |
| 9 | Article header | `/ratgeber/[slug]` | **16:9** | 1600 × 900 |
| 10 | Clear pebbles *(opt)* | `/faq` | **16:9** | 1920 × 1080 |
| 11 | Steady stream *(opt)* | `/newsletter` | **16:9** | 1920 × 1080 |

Legal pages (`/impressum`, `/datenschutz`) and `/newsletter/bestaetigt` get no imagery.

---

## Home

### 0 · Hero — full-bleed background (centered overlay text) — `16:9`
> **Changed 2026-06-16:** the hero is now a **full-bleed background image** with centered overlay text over a petrol scrim (`.hero-overlay-scrim` in `globals.css`), not a side panel. So the image must be **wide (16:9, center-safe)**, calm and low-detail through the middle, and tolerate a dark petrol scrim so the Papier H1 + CTA stay AA-legible. Decorative (`alt=""`) — the H1 carries the meaning.
>
> ✅ **Chosen & wired: Direction C** (flowing water) → `public/images/hero-flow.webp` (rendered with Nano Banana, 2026-06-16). The other two directions are kept below for future re-rolls.
>
> **Three directions** — a spectrum from the *Merak* feeling to the automation itself. All keep the brand rules: **no people, no on-screen UI, no text, calm over hype, cool-dominant except where noted.** Trade-off: **A/B keep the deliberate warm break** (the payoff, a finished day); **C is the abstract-water world** as a calm background (a system that runs itself) — the founder picked C.

> **A — Merak evening (the payoff / feeling; warm).** Wide cinematic fine-art photograph of a calm, tidy desk at golden hour just after the workday has ended — a closed laptop, a single cup of coffee, a small notebook and pen, everything ordered and unhurried. Warm low golden-hour light streams from a window to one side, long soft light and a gentle glow across the wood; warm off-white (Papier) wall behind. Calm, restful, content — work finished early, time given back. The center of the frame is calm and uncluttered with generous negative space for a headline to sit over; soft natural light, shallow depth of field, premium, minimal. Warm Merak palette — golden, honey, warm neutral; no cool blue. No people, no hands, no faces, no on-screen UI, no text, no letters, no logos, no watermark, no clutter. 16:9 aspect ratio.

> **B — the calm, well-run morning (middle; warm-neutral + petrol undertone).** Wide fine-art photograph of an impeccably ordered home-office desk at soft early-morning first light — everything already in its place, nothing pending: a closed laptop, a neat empty tray, a single small plant, clean surfaces. The quiet feeling of a system that did its work overnight, an empty to-do list. Soft cool dawn light from a side window with one warm amber glow where the sun first reaches the wood. Calm, low-detail center with generous negative space for overlay text. Restrained palette: warm off-white and pale wood with a cool petrol shadow and a single amber highlight. Shallow depth of field, premium, minimal, unhurried. No people, no hands, no on-screen UI, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

> **C — pure water flow (abstract background; cool, petrol-dominant).** Abstract fine-art photograph of clear water flowing smoothly and continuously, soft silken long-exposure motion, a gentle unhurried current moving across the frame — **no objects, no stones, just water in calm effortless flow.** Deep teal-navy and petrol tones, glassy and controlled, very low contrast and dark like deep water at dusk, one small soft warm amber-honey glint catching a ripple. The sense of a system running by itself: smooth, calm, repeatable. A calm, almost-uniform flowing texture with no hard focal point and generous dark negative space so a headline reads over it. Soft directional light, shallow depth of field, fine detail, premium, minimal, no HDR over-processing. Cool petrol-dominant palette, a single small warm accent. No people, no on-screen UI, no text, no letters, no logos, no watermark, no stones, no horizon. 16:9 aspect ratio. *(Note: C is the abstract-water world used as a calm background — it trades the warm Merak payoff for a flowing-water automation metaphor.)*

> **Wiring notes (for re-rolls):** render → optimize to WebP (`sharp`, q80) → replace `public/images/hero-flow.webp` (the `src` in `Hero.tsx`). Keep interest **center-safe**: the hero is `min-h-[80vh]` full-bleed, so `object-cover` crops top/bottom on wide desktops and the sides on tall mobiles — keep the focal calm zone centered. After dropping it in, re-check H1/CTA contrast against the real image (AA) and nudge `.hero-overlay-scrim` if needed. (The current render is ~1376w — regenerate larger if it softens on big displays.)

### 1 · Geschichte (Bosnian spring) — `3:2`
> Fine-art photograph of a hidden karst spring in the Bosnian highlands, crystal-clear turquoise water welling up from beneath pale grey limestone rock, faint concentric ripples spreading from the source, soft moss and a few smooth stones at the water's edge. Calm, still, sacred atmosphere. Warm low golden morning light grazing across the water from the side, a single soft amber-honey highlight on the surface, deep teal-navy shadows in the water. Muted, restrained palette: deep teal-navy and petrol blue meeting warm golden light. Medium-format, 50mm, shallow depth of field, fine natural detail, gentle, premium, meditative, generous negative space. No people, no text, no letters, no logos, no watermark, no buildings, no boats. 3:2 aspect ratio.

### 2 · Was ich baue (clean source) — `4:5`
> Fine-art macro photograph of a single clear drop of water meeting a perfectly calm, deep teal-navy water surface, sending out one set of clean, even concentric rings, flawless and ordered. Dark petrol-blue water, glassy and still, one soft warm amber-honey reflection at the centre where the light catches. Cool, quiet, architectural sense of precision and calm. Soft directional light from above, deep shadows, shallow depth of field, ultra-fine detail on the water's surface tension. Minimal, premium, meditative, lots of empty dark water as negative space. Muted palette: deep teal-navy and petrol with a single warm highlight. No people, no text, no letters, no logos, no watermark. 4:5 aspect ratio.

### 3 · Steps (Fließen) — `21:9` *(optional)*
> Fine-art photograph of clear water flowing gently and steadily over smooth rounded stones in a shallow natural stream, soft long-exposure motion giving a calm silken flow, unhurried and effortless, the main current centered in the middle third of the frame. Deep teal-navy and petrol tones in the water, pale stones beneath, one warm amber-honey glint of light on a ripple. Tranquil, minimal, premium nature photography, soft golden light, shallow depth of field, generous negative space, balanced centered composition. Cool palette dominant, a single small warm accent. No people, no text, no letters, no logos, no watermark. 21:9 aspect ratio.

### 4 · Section texture — `16:9` *(optional background)*
> Abstract fine-art photograph of a calm deep-water surface, very soft out-of-focus ripples and gentle caustics, almost monochrome in deep teal-navy and petrol blue, extremely low contrast and dark, like still water at dusk. Quiet, minimal, atmospheric, no focal point, a calm even texture. A barely-there warm amber undertone in one corner. Subtle film grain, soft, premium. Muted palette: deep teal-navy and petrol with the faintest warm accent. No people, no text, no letters, no logos, no watermark, no horizon line. 16:9 aspect ratio.

---

## Full-bleed page heroes (PageHero) — `16:9`, scrim-tolerant, hi-res

> **Added 2026-06-23.** `/ueber-mich`, `/leistungen`, `/faq`, `/ratgeber` now open with a **full-bleed `PageHero`** (`src/components/PageHero.tsx`): the image fills `min-h-[68vh]` with the page title overlaid on the `.hero-overlay-scrim`, like the home Hero. These **supersede** the contained-panel placements #5/#6/#8/#10 below for these four pages. Regenerate larger — the originals are ~1264–1584w and soften full-bleed.
>
> **Hero spec (append to every prompt in this section):** wide, **center-safe**, calm and low-detail through the middle so a light overlay title reads over a dark petrol scrim; cool-dominant and dark enough in the center to stay AA-legible under Papier text. Decorative (`alt=""`) — the H1 carries the meaning. **Render at max, target export ~2560 × 1440 (upscale 2×).** Then: WebP (`sharp`, q80) → replace the same filename → re-check title contrast (AA) at 1440 + 390.
>
> Every prompt also keeps the **shared palette line, style, and universal negative** from the top of this file, and ends with `16:9 aspect ratio`.

### H1 · /ueber-mich hero — turquoise spring (replaces #6) — `16:9`
> Wide fine-art photorealistic photograph of a clear turquoise karst spring welling up among dark moss-covered limestone rocks, faint concentric rings spreading softly from the source across calm petrol-and-turquoise water; the centre of the frame is calm, darker deep-water and low in detail so an overlaid title stays legible. Soft natural side light, shallow depth of field, deep teal-navy shadows, one small warm amber-honey glint on a ripple. Cool-dominant brand palette: deep teal-navy `#0A2538`, petrol `#1B5063`, glacier turquoise, a single warm amber-honey highlight `#D4A24C`, warm off-white; cool dominant, warm only as a small accent. Calm, minimal, meditative, generous negative space, center-safe. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

### H2 · /leistungen hero — water channels (replaces #5) — `16:9`
> Wide fine-art photograph of clear water flowing through clean, minimal, precisely-cut pale stone channels that meet at the centre of the frame, ordered and geometric like a calm modern spring-house or aqueduct — water given a clean path. Deep teal-navy and petrol water, glassy and controlled, a sense of architecture, structure and quiet precision; the central water darker and low-contrast so an overlaid title reads over it. Soft directional daylight, shallow depth of field, fine detail, one small warm amber-honey glint where light catches a ripple. Cool-dominant brand palette: deep teal-navy `#0A2538`, petrol `#1B5063`, glacier turquoise, a single warm amber-honey highlight `#D4A24C`, warm off-white. Minimal, premium, calm, center-safe, generous negative space. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

### H3 · /faq hero — clear pebbles (replaces #10) — `16:9`
> Wide fine-art photograph of exceptionally clear, still water over pale smooth pebbles, every stone sharp through the calm surface — transparency and clarity — with dark moss-shadowed deeper water across the upper-centre of the frame so an overlaid title stays legible against it. Cool teal-petrol tones, two tiny warm amber-honey pebble glints as the only warm accent, soft daylight, shallow depth of field. Cool-dominant brand palette: deep teal-navy `#0A2538`, petrol `#1B5063`, glacier turquoise, a single warm amber-honey highlight `#D4A24C`, warm off-white. Minimal, premium, calm, center-safe, generous negative space. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

### H4 · /ratgeber hero — light through water (replaces #8) — `16:9`
> Wide fine-art photograph of soft sunlight god-rays filtering down through clear, calm, deep teal-petrol water toward a faint pale sandy bed far below, gentle caustics and fine particles catching the light — clarity, depth, quiet understanding. Dark and low-contrast overall so a light overlaid title reads easily, with one soft warm amber shaft of light as the single warm accent. Cool turquoise-to-navy gradient. Cool-dominant brand palette: deep teal-navy `#0A2538`, petrol `#1B5063`, glacier turquoise, a single warm amber-honey highlight `#D4A24C`, warm off-white. Shallow depth of field, premium, meditative, center-safe, generous dark negative space. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

---

### 5 · /leistungen — architecture of the source — `21:9`
> Fine-art top-down photograph of clear water flowing through clean, minimal, precisely-cut pale stone channels, ordered and geometric like a calm spring-house or modern aqueduct, the channels and water meeting at the centre of the frame. Water deep teal-navy and petrol blue, glassy and controlled, a sense of architecture, structure and quiet precision: water given a clean path. Soft directional daylight, shallow depth of field, fine detail, one small warm amber-honey glint where light catches a ripple. Minimal, premium, calm, centered composition with generous negative space. Muted palette: deep teal-navy and petrol with a single warm highlight. No people, no text, no letters, no logos, no watermark. 21:9 aspect ratio.

### 6 · /ueber-mich — origin landscape — `16:9`
> Note: the founder portrait stays a real photo, not AI. This is the atmosphere image only.
> Wide atmospheric fine-art landscape of a turquoise spring river emerging at the foot of pale limestone mountains in the Bosnian highlands at dawn, soft mist over still turquoise-and-petrol water, the quiet beginning of a river. Nostalgic, personal, sacred, deeply calm. Low warm golden first light on the peaks, cool teal shadows in the valley water, one soft amber highlight on the mist. Medium-format, shallow depth of field, fine natural detail, restrained muted palette, generous negative space. No people, no text, no letters, no logos, no watermark, no buildings. 16:9 aspect ratio.

### 7 · /kontakt — the invitation — `21:9`
> Fine-art photograph of a serene, perfectly still pool of water at warm dawn, a single gentle ripple just beginning to spread from one point at the centre of the frame, soft, open and inviting, the feeling of a quiet beginning. Warm low golden light meeting cool deep teal-petrol water, the warm amber-honey glow slightly more present than usual but still soft. Glassy surface, shallow depth of field, fine detail, minimal, premium, centered composition with calm negative space on both sides. No people, no text, no letters, no logos, no watermark. 21:9 aspect ratio.

### 8 · /ratgeber — clarity (index header) — `16:9`
> Fine-art photograph of soft sunlight rays filtering down through clear, calm, deep teal-petrol water, gentle god-rays and faint caustics, a sense of clarity, depth and quiet understanding. Clean, meditative, minimal. Cool turquoise-to-navy gradient with one soft warm amber shaft of light. Shallow depth of field, fine particles catching the light, premium, calm, generous empty water as negative space. Muted palette: deep teal-navy and petrol with a single warm highlight. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

### 10 · /faq — clarity — `16:9` *(optional)*
> Fine-art photograph of exceptionally clear, still water over pale smooth pebbles, every stone sharp and visible through the calm surface, a sense of transparency and clarity. Cool teal-petrol tones, one tiny warm amber glint, soft daylight, shallow depth of field, minimal, premium, generous negative space. Muted palette: deep teal-navy and petrol with a single warm highlight. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

### 11 · /newsletter — a steady, ongoing flow — `16:9` *(optional)*
> Fine-art photograph of a calm, narrow stream of clear water flowing steadily and unhurried into soft distance, gentle continuous motion, the feeling of something quietly ongoing. Deep teal-petrol water, pale banks, one soft warm amber highlight on the far ripples, soft golden-hour light, shallow depth of field, minimal, premium, calm. Muted palette: deep teal-navy and petrol with a single warm highlight. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

---

## 9 · Ratgeber article headers — `16:9` (reusable, swap `[MOTIF]`)

Banner above the article title; cool-dominant, low contrast + dark so a German headline reads over it.

### Base prompt
> Minimal fine-art abstract photograph of calm deep teal-petrol water with **[MOTIF]**, very soft and out of focus, low contrast, one small warm amber-honey highlight, lots of dark calm negative space for a headline to sit over. Muted, premium, meditative, cool-dominant palette: deep teal-navy and petrol with a single warm accent. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

### Motif library (pick on the fly)

| Article theme / mood | `[MOTIF]` to drop in |
|---|---|
| Getting started / first step | `a single clean ripple expanding from one point` |
| Automation running by itself / efficiency | `a gentle steady flow over smooth rounded stones` |
| Clarity / explaining something simply | `soft sunlight rays breaking through the surface from above` |
| Calm / mindset / Kopffreiheit / Ruhe | `a perfectly still glassy surface at dusk` |
| Connecting tools / integrations | `two slow streams quietly merging into one` |
| Finding the right workflow / process | `water finding its path between smooth rocks` |
| Where the busywork disappears / data entry | `a slow, gentle vortex drawing inward` |
| Recurring tasks / follow-ups / scheduling | `slow droplets falling in a steady rhythm` |
| Trust / DSGVO / transparency / documentation | `clear light caustics rippling over a pale sandy bed` |
| Clean foundation / "saubere Quelle" / good data | `a deep clear pool revealing smooth pebbles far below` |
| Beginnings / starting out | `thin morning mist rising off calm water at dawn` |
| Structure / architecture / building the system | `clear water guided through one clean narrow channel` |
| Many small tasks / communication | `several concentric rings gently overlapping` |
| Change / before-and-after / transition | `a frosted edge melting into slow flowing water` |
| Letting go / less stress / lightness | `a single leaf drifting on a still surface` |
| Steady small inputs / consistency / habits | `soft rain gently dimpling a calm surface` |
| Continuous output / things flowing out | `a smooth thin sheet of water spilling over a clean edge` |
| The Vrelo to Merak duality / the payoff | `a warm sky reflected on cool still water` |
| Insight / ideas surfacing | `slow bubbles rising from the dark depths` |
| Growth, but calm (avoid hype) | `water level rising slowly and evenly in a stone basin` |
| Reliability / something that just runs | `an unbroken, even, slow-moving current` |
| Simplicity / cutting the clutter | `one single drop suspended above a flat dark surface` |

> If none fit: any **calm, abstract, cool water** motif works as long as it stays minimal, low-contrast, dark, with one tiny warm accent and lots of negative space.

### Variation knobs (optional, for more range)
- **Light / time:** `soft overcast light` · `low golden first light` · `cool blue dusk` · `a single shaft of warm light`
- **Texture:** `subtle film grain` · `glassy and sharp` · `dreamy long-exposure softness`
- **Headroom for text:** `with the calm area in the [left / right / lower] third for a headline`
- **Depth:** `shot just above the surface` · `looking straight down` · `half-submerged at the waterline`

---

## Workflow notes

1. **Palette lock:** generate the home **Bosnian-spring (#1)** first, then feed it back as a reference image on every other prompt ("match this color grade, light and mood"). Every image then shares one palette.
2. **Mobile crop for 21:9 bands (#3, #5, #7):** these become a sliver on phones and get center-cropped, so keep the focal interest centered (already in those prompts) or generate a separate phone crop.
3. **Resolution:** Nano Banana renders ~1024-1536px on the long edge. Contained panels (#1, #2) are crisp as-is; **upscale the full-width 21:9 banners 2×** after generation.
4. **Keep article headers dark + low-contrast** so light German headlines stay readable on top.
5. Generate 2-3 variants each, keep the **calmest, most negative-space-heavy** one (brand = "generous breathing room").
6. Deliver files back and they get wired in: right sizes, `next/image` with `priority` only above the fold, German alt text, gate (test/tsc/lint/build) then ship.
