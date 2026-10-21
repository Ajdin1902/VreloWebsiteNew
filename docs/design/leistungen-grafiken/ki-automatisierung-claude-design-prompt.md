# Claude Design prompt: Leistungs-Grafik KI-Automatisierung

> How to use: open a new Claude Design project, paste everything below the line as the first message, ask for the three variants, pick one. Claude Design is the sketchpad here, not the deliverable: the chosen variant gets rebuilt in the site as an inline SVG React component (brand tokens, live text, responsive, accessible), so the export never ships as is. First of a series of nine (one per `/leistungen` subpage): keep the visual language reusable. No Gedankenstrich anywhere in this file, so nothing leaks into the labels.

---

Design one simple explanatory graphic for a service page on the website of Vrelo, a one-person automation studio in Regensburg, Germany. The page is called "KI-Automatisierung & Assistenten". The reader is a business owner who distrusts "tech" and "KI" and skims. The graphic has one job: after five seconds the reader remembers what the service does, without reading a paragraph. It replaces text, so it must work on its own.

## 1. The one idea to show

Information arrives in a different shape every time (an e-mail, a supplier invoice as a PDF, a voice message from the road). The KI reads it, understands what it is and puts it in order. A person checks and approves before anything goes out. The rule the page teaches: **if the input is different every time, you need KI.**

Show this as a calm left to right flow in three stages:

1. **Kommt rein** (messy): three input items, visibly different in shape and slightly uneven, as if dropped on a desk: an envelope labelled `E-Mail`, a document labelled `Rechnung.pdf`, a small waveform or speech bubble labelled `Sprachnachricht`.
2. **KI liest und sortiert** (the centre): one calm node. Out of it come the same three items, now aligned and identical in shape, each a tidy card with extracted fields, for example the invoice card shows `Lieferant`, `Betrag`, `Datum` as short label rows (no real names or numbers).
3. **Du gibst frei**: a single approval mark (a check in a circle) the tidy cards pass through. This stage matters: the KI prepares, the person decides.

The contrast between stage 1 (uneven, different shapes) and stage 2 (aligned, same shape) is the whole message. Make it obvious.

## 2. Brand system (use exactly, do not reinvent)

| Token | Hex | Use |
|---|---|---|
| Papier | `#F4EFE6` | Background. Never pure white. |
| Tiefes Wasser | `#0A2538` | Main line work, the KI node, labels. |
| Vrelo Petrol | `#1B5063` | Secondary lines, card outlines, connectors. |
| Gletscher | `#DCE7EB` | Light fills of the tidy cards. |
| Faden | `#D4CCBC` | Hairlines, the messy inputs' outlines. |
| Stumm | `#696359` | Small field labels. |
| Amber | `#D4A24C` | The only warm accent: the approval mark in stage 3, nothing else. |

Cool tones lead (about 70 percent), amber stays a single small accent. Flat colours only: no gradients, no shadows, no glows, no 3D, no glassmorphism.

Type: **Plus Jakarta Sans** for every label (stage titles weight 600, field labels 500). Labels in German, exactly as given above, no other words. No headline, no sentence, no logo inside the graphic: the page carries the heading.

Style: thin, even line work (1.5 to 2 px at desktop size), rounded corners, generous empty space, simple geometric icons drawn as outlines. Calm, precise, slightly warm. Think a well drawn diagram in a good manual, not a stock illustration. A subtle nod to water is welcome (the connectors may flow like a gentle stream into the KI node, as Vrelo means "source"), but no literal waves, drops or fish.

Avoid: robots, brains, glowing circuits, sparkles, magic wands, chat bubbles with faces, people or hands, emojis, any "AI" cliché. The KI node is a plain shape (a rounded square or circle) with a small, quiet mark, no face.

## 3. Format

- Desktop: wide, about 1200 x 420 px, flow left to right.
- Mobile: the same three stages stacked top to bottom, about 360 x 640 px. Show this variant too.
- Build it as one inline SVG per format, every label as live `<text>` (not outlined), shapes as simple paths, so it can be rebuilt in code. No raster images.
- Must read at a glance on a phone: labels at least 14 px at mobile size, contrast at least 4.5:1 against Papier.

## 4. What I want back

Three variants of the same idea, each with its desktop and mobile layout:

- **A, Fluss:** the three inputs flow along gentle curved lines into the KI node and leave as straight parallel lines.
- **B, Stapel:** the messy items lie as an uneven pile on the left, the KI node in the middle, a neat stack of identical cards on the right.
- **C, Raster:** the simplest possible version, three columns of plain shapes, almost a pictogram.

After the three, tell me in two sentences which one is easiest to remember and why.
