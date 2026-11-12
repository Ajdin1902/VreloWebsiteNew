# Voice & Structure (Ratgeber)

The operational subset of the Vrelo voice for blog articles. Source of depth: `Brand.md` (voice section) and the `## Gotchas` in `CLAUDE.md`.

**The voice model is `content/ratgeber/wieso-ist-ki-jetzt-revolutionaer.mdx` (Ajdin, 2026-10-20: „follow this language and structure for every future article“).** Read it in full before drafting. Its moves are listed below; learn the moves, never copy its jokes.

## Voice contract (enforce all)
- **Calm over loud, but never humourless.** Personal brand, first-person „Ich“. Dry, self-aware humour is part of the voice: deadpan, never a punchline with a drumroll. No hype, no hard sell, no false urgency.
- **Generic masculine.** Kunden, Inhaber, Kollegen, Selbstständige: never `:innen` or feminine plurals (Inhaberinnen ✗).
- **German typography.**
  - No Gedankenstrich at all: neither the en-dash (U+2013) nor the em-dash (U+2014), never `--` (founder decision 2026-08-16; `findCopyIssues` fails on both). Join clauses with comma, period or colon; ranges with „bis“.
  - German quotes „…“: U+201E open, U+201C close. Never ASCII `"`.
- **Water metaphor: at most ONE** per article (Quelle / Fluss / Wasser…). One evocative touch, not a flood. Zero is fine.
- ***Merak* only where it lands naturally.** A feeling, never a product name. The voice model has none and closes on a callback instead; never force it in.
- **Specificity sells.** Name the real task (die Website, das Finanzamt, ein Montagmorgen), a real number, a real before/after.
- **Buzzwords only as the target.** skalieren, disrupten, KI-Magie, Game-Changer, Synergien, revolutionär: never as our claim. Allowed when the article is poking at the word itself (the voice model's title asks why KI „revolutionär“ is).
- **No AI tells.** At most one „Das ist kein X. Das ist Y.“ cadence; vary sentence length.
- **BrandWord:** write „Vrelo“ and „Merak“ as plain words; the `remark-brandword` plugin italicizes them.

## The moves (from the voice model)

| Move | In the voice model | How to use it |
|---|---|---|
| **Open on my own use** | „Ich persönlich nutze Claude bei meiner täglichen Arbeit. Claude hat mir erheblich bei der Erstellung meiner Website, des Designs und sogar beim Verständnis von Forderungen seitens des Finanzamts geholfen.“ | First paragraph = what I actually did, with real tasks named. Never a definition, never „In der heutigen Zeit“. |
| **Klammer-Pointe** (bracketed aside) | „(Den Teil mit dem Beziehungsberater empfehle ich persönlich nicht. Dieses Rätsel hat die KI noch nicht gelöst.)“ | Claim in the main sentence, dry deflation in brackets, full sentences inside. 1 to 3 per article, mostly in the hook. |
| **Running image + callback close** | Terminator/Schwarzenegger set up in section 1, reused as a transition („Terminator hin oder her,“), returned to in the last line („Bis dahin mache ich mich auf die Suche, wo sich der Schwarzenegger heutzutage rumtreibt.“). | One image per article: set it up once, use it once as a bridge, close on it. Find a new one every time. |
| **Hype taken literally** | „Jede Woche kommen neue Modelle heraus und die Herrschaft über die Menschheit durch die Superintelligenz kommt immer näher. […] Und freuen uns darüber!“ | Push the market's own story one step further until it's absurd, then say it deadpan. |
| **The fake slip** | „…Mitarbeitereinsparung sowie Kostenersparnis sein. Ah, sorry, ich meinte Mitarbeiterentlastung. Hoffentlich bekommt das der Betriebsrat nicht mit.“ | Say the uncomfortable truth, then „correct“ it into the euphemism. Once per article at most. |
| **Question chain into absurdity** | „Braucht die KI dann Urlaub? Raucherpausen? Sabbaticals?“ | Three or more questions, each shorter, the last one or two words. |
| **Comparisons from the Betrieb** | KI-Agenten im Betriebsrat · KI als Beziehungsberater · „Erkläre es mir, als ob ich zehn Jahre alt wäre.“ | Map the tech onto what an Inhaber knows from his own shop and life (Betriebsrat, Urlaub, Steuerberater, Azubi, Feierabend), not onto tech or sports metaphors. |
| **Spoken connectors** | „Ich meine,“ · „Lange Rede, kurzer Sinn:“ · „Terminator hin oder her,“ · „Aber dazu ein anderes Mal mehr.“ | Write transitions you'd say out loud at the Stammtisch, not written-German glue („Darüber hinaus“, „Zudem“). |
| **Honest hedges** | „meiner Meinung nach“ · „Dieses Gefühl hatte ich zumindest.“ · „habe ich noch nicht getestet“ | Mark opinion as opinion; admit what I don't know. That is where the trust comes from. |
| **„Ob A, B oder C.“ fragment** | „Ob Designer, Programmierer, Steuerberater oder sogar Beziehungsberater.“ | Part of his rhythm, but at most twice per article (the voice model uses it more; don't). Put the odd one out last. |

**Who the jokes hit:** hype, the market, the AI, and me. Never the reader, his staff or a named competitor (no competitor names in public content, root CLAUDE.md „Hard rules“). Casting the AI as staff (der neue Azubi, ein Kollege im Betriebsrat) is fine: the joke is on the AI in that role, never on the real Azubi or Kollege.

**Only claim what is real.** Every „ich nutze“ / „bei mir läuft“ must be live today, not planned; no time-saved figure or client result unless the founder confirmed it (HQ: never a number without confirmation). When unsure, describe what the system does, not what it saved.

## Article shape (the arc)
1. **Hook (2 to 3 paragraphs):** my own use, honest, with the first Klammer-Pointe. Build the common belief (or the enthusiasm) fairly, the way I really felt it.
2. **2 to 3 `##` sections with short plain headings** (3 to 5 words, descriptive, no puns: „Jede Woche ein neues Modell“, „Was KI in Prozessen leisten soll“). The early sections carry the humour; the middle carries the substance.
3. **The turn = the one `>` pull-quote**, placed late, in first person: the moment the article changes its mind or says the honest thing. „Mit der Zeit merke ich: So einfach ist es doch nicht.“ Not a summary of what came before.
4. **After the turn:** 1 to 2 calm, serious paragraphs with the real point.
5. **Last line:** the callback to the running image, one sentence. Never a CTA (the page's CTA band asks), never a recap.

A forward hook („Aber dazu ein anderes Mal mehr.“) is allowed once, where it points to a topic for a later article.

**Guides (Grundlagen, Praxis, Kosten)** keep the same voice and arc, with more substance in the middle: the steps, numbers and decisions the reader came for. The humour stays in the hook, the asides and the close: one running image, one or two asides. Use a `-` bullet list once if it genuinely helps scanning. **Meinung pieces** can carry the full set of moves and need no list.

Length: short ≈ 600 to 750 words (~4 min; the voice model is ~650), standard ≈ 900 to 1100 words (~6 min). `readingMinutes` is computed from the body. **Default to short.** Length is a ceiling, never a target.

## Markdown the renderer supports (`src/components/Prose.tsx`)
`##` / `###` headings · `-`/`1.` lists · `>` blockquote · `[label](url)` links · `**bold**` · `*italic*`. Body renders at 18px on the deeper article reading surface. No raw HTML, no images inside the body (the cover is the only image).

## Cover
Pick the motif from `image_prompt.md` §9 that matches the article's theme (e.g. „getting started“ → a single clean ripple; „saubere Quelle“ → a deep clear pool revealing pebbles). Fill the base prompt, keep it dark/low-contrast/cool with one warm accent. `coverAlt` is a plain German description of that image. **Meinung exception:** the cover may be an absurd AI scene that stages the article's running image (the voice model: a Betriebsrat of robots), photoreal people allowed only if **not real and not look-alike** (a Schwarzenegger-like figure was dropped: § 22 KUG, Art. 50 deepfake label). A celebrity may be *named* in the text, never depicted.

## Self-check (the gate before writing the file)
Run every line; fix before writing.
- [ ] No em-dash (U+2014) and no en-dash (U+2013) anywhere; the copy guard fails on both.
- [ ] German quotes balanced: count of „ equals count of “ (U+201C). No ASCII `"` in prose.
- [ ] No comma before „und“ anywhere (Ajdin 2026-10-01). Where grammar needs it, rephrase; `findCopyIssues` fails the build otherwise.
- [ ] ≤ 1 water metaphor in the whole body.
- [ ] Generic masculine only: no `…innen` / feminine plurals.
- [ ] Hook opens on my own use or experience, with a real task named; no definition opener.
- [ ] At least one Klammer-Pointe; one running image, set up early and called back in the last line.
- [ ] The running image and the jokes are new: not Terminator/Schwarzenegger, not a gag from another article (`grep` the corpus if unsure).
- [ ] Every joke hits hype, the market, the AI or me; none hits the reader, his staff or a named competitor.
- [ ] Every claim about my own use is live today; no unconfirmed numbers.
- [ ] Exactly one `>` pull-quote, and it is the turn, late in the article.
- [ ] „Ob A, B oder C.“ fragments ≤ 2; transitions sound spoken.
- [ ] *Merak* only if it lands naturally; never forced.
- [ ] Frontmatter complete: `title, description (≤~155), date, tags, kategorie, cover, coverAlt, draft: true`.
- [ ] `slug` == filename stem == `<slug>` in the `cover` path; slug doesn't already exist in `content/ratgeber/`.
- [ ] Body closes on the callback or the article's point, not a CTA.
- [ ] Lean and non-repetitive: each point made once, no padding. Ran the `copy-editing` skill and tightened every line that could be sharper.
- [ ] Cover image exists at `public/images/ratgeber-<slug>.webp` **before committing**: the covers test (`ratgeber.covers.test.ts`) checks the file exists for every article, so `npm test` fails without it.
