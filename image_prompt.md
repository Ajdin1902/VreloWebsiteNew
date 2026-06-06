# image_prompt.md — Ratgeber article-header image prompts

Reusable prompt for generating **Ratgeber (`/ratgeber/[slug]`) article-header images** with Nano Banana (Gemini 2.5 Flash Image). Keeps every article header in the same calm water world as the rest of the site.

- **Aspect ratio:** `16:9` (banner above the article title; safe on mobile).
- **Register:** cool-dominant (Ratgeber = Vrelo / the work + knowledge). Warm only as a *single small accent* (brand 70/20/10).
- **Style:** fine-art photorealistic water photography, calm, minimal, low contrast + dark so a headline reads over it, generous negative space.
- Palette line is fixed — **do not paraphrase it** (it's what keeps the set cohesive).

---

## Base prompt (swap `[MOTIF]`)

> Minimal fine-art abstract photograph of calm deep teal-petrol water with **[MOTIF]**, very soft and out of focus, low contrast, one small warm amber-honey highlight, lots of dark calm negative space for a headline to sit over. Muted, premium, meditative, cool-dominant palette: deep teal-navy and petrol with a single warm accent. No people, no text, no letters, no logos, no watermark. 16:9 aspect ratio.

**Universal negative** (paste into the negative field if your tool has one):
`text, words, letters, captions, watermark, logo, signature, people, hands, faces, UI, charts, oversaturated, neon, HDR, busy, cluttered, lens flare, cartoon, 3D render, illustration`

---

## Motif library (pick on the fly)

Each `[MOTIF]` stays inside the water world, stays abstract, stays calm. Match the motif to the article's *feeling*, not literally.

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
| Clean foundation / „saubere Quelle“ / good data | `a deep clear pool revealing smooth pebbles far below` |
| Beginnings / starting out | `thin morning mist rising off calm water at dawn` |
| Structure / architecture / building the system | `clear water guided through one clean narrow channel` |
| Many small tasks / communication | `several concentric rings gently overlapping` |
| Change / before-and-after / transition | `a frosted edge melting into slow flowing water` |
| Letting go / less stress / lightness | `a single leaf drifting on a still surface` |
| Steady small inputs / consistency / habits | `soft rain gently dimpling a calm surface` |
| Continuous output / things flowing out | `a smooth thin sheet of water spilling over a clean edge` |
| The Vrelo → Merak duality / the payoff | `a warm sky reflected on cool still water` |
| Insight / ideas surfacing | `slow bubbles rising from the dark depths` |
| Growth, but calm (avoid hype) | `water level rising slowly and evenly in a stone basin` |
| Reliability / something that just runs | `an unbroken, even, slow-moving current` |
| Simplicity / cutting the clutter | `one single drop suspended above a flat dark surface` |

> If none fit: any **calm, abstract, cool water** motif works as long as it stays minimal, low-contrast, dark, with one tiny warm accent and lots of negative space.

---

## Variation knobs (optional, for more range)

Append or tweak one of these if a header needs to feel different from its neighbours, without leaving the palette:

- **Light / time:** `soft overcast light` · `low golden first light` · `cool blue dusk` · `a single shaft of warm light`
- **Texture:** `subtle film grain` · `glassy and sharp` · `dreamy long-exposure softness`
- **Headroom for text:** `with the calm area in the [left / right / lower] third for a headline` (helps when the title overlays a specific side)
- **Depth:** `shot just above the surface` · `looking straight down` · `half-submerged at the waterline`

---

## Workflow notes

1. **Palette lock:** generate the home **Bosnian-spring** image once, then feed it back as a reference on each article prompt („match this color grade, light and mood“). Every header then shares one palette.
2. **Keep it dark + low-contrast** so white/light German headlines stay readable on top.
3. Generate 2–3 variants, keep the **calmest, most negative-space-heavy** one (brand = „generous breathing room“).
4. Output is ~1024–1536px on the long edge; a 16:9 header at 1600×900 is usually fine as-is — upscale 2× only if it sits full-bleed on wide layouts.
5. Cool dominant, warm accent tiny — never let the amber take over (70/20/10).

---

*Related: full per-page prompt set lives in the chat history; brand source of truth is [Brand.md](Brand.md).*
