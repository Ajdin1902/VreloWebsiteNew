# Ratgeber Cluster — design (2026-07-28)

Nine German Ratgeber articles, backdated weekly from the last published article, aimed at the broker
niche with a general minority. Turns the Ratgeber from three awareness-stage posts into a lead
channel with commercial intent.

**Origin:** the [Rang-Eins competitor teardown](../../../../Knowledge/marketing/competitor-rang-eins.md)
(ToDo ① of the Content-Engine block in HQ `CLAUDE.md` §7). The finding that drove it: all three live
articles are May-2026 awareness pieces („Grundlagen“ / „Zeit“ / „Termine“) — **none is
broker-targeted and none has commercial search intent**, so the Ratgeber is pointed at a different
funnel stage than the one that produces booked calls.

**Method:** every article is produced by the existing `.claude/skills/ratgeber-article` skill. This
spec front-loads that skill's intake for all nine so it runs in batch rather than nine live
interviews. It does **not** change the skill.

---

## 1. Decisions (settled with the founder, 2026-07-28)

| # | Decision | Why |
|---|---|---|
| 1 | **Backdate weekly** from 2026-05-28 → dates 06-04 … 07-30; publish as one batch | An unbroken archive at launch beats a visible two-month gap. Founder's call, made against the alternative of a forward cadence. **Consequence: all nine covers are needed before anything commits.** |
| 2 | **Market price ranges yes, Vrelo's own prices no** | The „Was kostet …“ article names what this work costs *at market* and places Vrelo qualitatively — **„meist darunter, je nach Projekt“**. Keeps the locked *„Prices never appear on the site“* decision intact while still answering the question the searcher came for. Never goes stale when pricing moves. |
| 3 | **Name the niche explicitly** — titles say „Makler“ / „Finanzmakler“ | Wins low-volume, high-intent keywords a broker actually types. Broad automation keywords are dominated by agencies with far more domain authority. The three existing generic articles keep the Ratgeber readable for everyone else; tags separate the registers. |
| 4 | **Arrangement A** — niche-heavy, generals mid-timeline, sharpest broker piece newest | Backdating publishes all nine at once, so chronological order is invisible to a reader arriving from search. What it *does* control is the top of `/ratgeber` (newest first) — the page a broker sees when sent the link. That must be broker content, not „Claude im Alltag“. |
| 5 | **Concise throughout** — the skill's *short* tier, 600–750 words | Founder instruction, and the skill already defaults to it: „Length is a ceiling, never a target: stop when the point is made.“ |
| 6 | **Grounding: 8 from the vault, #4 from the founder** | The skill requires one concrete grounding detail per article. This is a first-person personal brand — inventing the founder's working habits would be fabrication, and would damage the „der Saubere“ positioning it is meant to support. |

> **Note on decision 2.** The copy-guard test (`src/lib/makler.test.ts`) only walks the `/makler`
> copy module, so MDX articles are not technically blocked from containing prices. This is a founder
> decision, not a mechanical gate — the constraint has to be honoured by hand in review.

---

## 2. The nine articles

Newest sits at the top of `/ratgeber`. **Niche** = broker-targeted; **General** = „kleine Betriebe“
register, matching the three existing articles.

| # | Date | Slug | Title | Kind | Job |
|---|---|---|---|---|---|
| 1 | 2026-06-04 | `warum-makler-anfragen-verlieren` | Warum Makler die meisten Anfragen schon in der ersten Stunde verlieren | Niche | Problem-awareness. The entry point of the whole funnel. |
| 2 | 2026-06-11 | `was-ki-im-betrieb-wirklich-kann` | Was KI im Betrieb wirklich kann – und was nicht | General | Expectation-setting; disarms the hype-wariness before any offer talk. |
| 3 | 2026-06-18 | `unterlagen-einsammeln-ohne-nachfassen` | Unterlagen einsammeln, ohne ständig nachzufassen | Niche | Document-Concierge awareness for Finanzierungsberater. |
| 4 | 2026-06-25 | `claude-im-alltag-nutzen` | Wie du Claude im Alltag wirklich nutzt | General | Broad reach + newsletter fodder. **Blocked on founder input** (§4). |
| 5 | 2026-07-02 | `crm-antwortet-aber-kein-termin` | Dein CRM antwortet schon – warum daraus trotzdem kein Termin wird | Niche | Kills the #1 objection before the sales call ever happens. |
| 6 | 2026-07-09 | `selbst-bauen-oder-bauen-lassen` | Selbst bauen oder bauen lassen? | General | The DIY / n8n-Zapier objection. |
| 7 | 2026-07-16 | `wo-laeuft-deine-ki` | Wo läuft eigentlich deine KI? | Niche | **The trust wedge.** The one article a Makler or Kanzlei would forward to someone else. |
| 8 | 2026-07-23 | `was-kostet-anfragen-automatisieren` | Was kostet es, Anfragen automatisch beantworten zu lassen? | Niche | **The money article** — highest commercial intent in the batch. |
| 9 | 2026-07-30 | `aus-jeder-anfrage-ein-termin` | Aus jeder Anfrage ein Termin – wie das konkret abläuft | Niche | Mechanism; closest to the offer. Heads the index. |

Ordering logic: #8 (cost) sits immediately before #9 (how it works), so a reader who arrives on the
price question meets the mechanism next. #7 precedes both — trust before money.

---

## 3. Per-article grounding, tags and covers

Cover motifs are drawn from the fixed table in `image_prompt.md` §9. Do **not** invent a new style;
fill the §9 base prompt with the `[MOTIF]` below.

| # | Grounding (the required concrete detail) | Tags | `[MOTIF]` |
|---|---|---|---|
| 1 | Verified research in `Vrelo/wiki/sources/makler-lead-market-research`: speed-to-lead **21× / 10×** effect; ImmoScout24 sells the same lead **2–3×**. | `["Makler", "Automatisierung"]` | `a smooth thin sheet of water spilling over a clean edge` |
| 2 | Vrelo's own **Bordmittel rule** and the Velp #8 lesson: a shipped KI-Dashboard that the platform already provided natively. Concrete, true, and self-deprecating in the right way. ⚠ **Tell it without naming or identifying the client** — it is a founder's mistake story, not a client's. | `["Grundlagen", "KI"]` | `soft sunlight rays breaking through the surface from above` |
| 3 | The Document-Concierge flow as designed (`Knowledge/Strategy/Document_Concierge.md`): hybrid nudge, one EU upload link, presence + sanity-check that bounces blurry uploads. | `["Automatisierung", "Praxis"]` | `slow droplets falling in a steady rhythm` |
| 4 | **Founder input required** — see §4. | `["KI", "Praxis"]` | `slow bubbles rising from the dark depths` |
| 5 | The CRM battlecard (`Knowledge/marketing/competitive-positioning-crm.md`): onOffice/FlowFact *do* auto-reply — with the Exposé only; onPointment exists but is a separate paid product **not wired to the reply**. | `["Makler", "Automatisierung"]` | `two slow streams quietly merging into one` |
| 6 | The market rates from the teardown (Freelancer 60–120 €/h) plus the honest maintenance tail: who fixes it at 22:00 when the API changes. | `["Grundlagen", "Praxis"]` | `water finding its path between smooth rocks` |
| 7 | **The founder's own gotcha:** Anthropic's first-party API has no EU region (`inference_geo` is us/global only) → Vertex AI `region="eu"`. Genuinely his to tell. | `["Vertrauen", "KI"]` | `clear light caustics rippling over a pale sandy bed` |
| 8 | Market ranges: Prozessautomatisierung **5.000–25.000 €** einmalig, fertige Tools 200–2.000 €/Mo, Freelancer 60–120 €/h, Agentur 80–200 €/h. Vrelo placed as **„meist darunter, je nach Projekt“**. | `["Kosten", "Grundlagen"]` | `a deep clear pool revealing smooth pebbles far below` |
| 9 | The Termin-Quelle integration standard (`Knowledge/Offers/2026-07-14-termin-quelle-integration-design.md`): wire into his existing channels → hybrid E-Mail-react → deterministic no-AI booking page on his own server. | `["Makler", "Termine"]` | `an unbroken, even, slow-moving current` |

**Tags.** Reuses the existing `Grundlagen · Zeit · Praxis · Termine · Automatisierung`; introduces
four new: `Makler · KI · Vertrauen · Kosten`.

**No article may cite Rang Eins by name.** The price anchor works because it is the market's, not
because it is a competitor's. Same for #7: the line is always the *question* „wo läuft das Modell?“,
never an accusation about any named provider — OpenAI does offer EU residency and we cannot see
anyone's configuration.

---

## 4. The one open input — article #4

`claude-im-alltag-nutzen` cannot be written from the vault. Before drafting it, ask the founder:

1. What do you actually use Claude for in a normal week — name two or three real tasks.
2. What surprised you: something it turned out to be good at, or bad at, that you didn't expect.
3. What did you **stop** doing because of it?
4. One moment where it got something wrong and you noticed.

Question 4 matters most — an article about an AI tool that admits nothing reads like advertising.
If the founder has no time for this, the fallback agreed in brainstorming is to swap #4 for a sixth
broker article and move the Claude piece to the forward cadence. **Do not invent the answers.**

---

## 5. Production process

Per article, run `.claude/skills/ratgeber-article`, supplying its step-1 intake from §2–3 above
instead of interviewing the founder:

1. Draft: hook (1–3 short paragraphs) → 2–4 `##` sections → **exactly one** `>` pull-quote → short
   thematic close. **Never close on a CTA** — the article page's CTA band already makes the ask.
2. Frontmatter per the skill's spec. `date` from §2 (**not** today). `draft: true` always.
3. Run the skill's **self-check** (12 items) — this is the gate.
4. Run **`copy-editing`** over the draft (mandated by the skill) and **`stop-slop`**.
   *`copywriting` is deliberately not used: it generates new marketing copy, which is the wrong tool
   for tightening a finished article.*
5. Write `content/ratgeber/<slug>.mdx`.
6. Byte-verify German typography (§6), then emit the cover prompt for that article.

**Batch discipline.** Draft in the §2 order (1 → 9) so recurring themes are introduced before they
are referenced, and so repetition across articles is visible while writing. After all nine exist,
do **one cross-article pass**: no two articles may make the same point as their central argument,
and the water metaphor must differ between neighbours.

---

## 6. Verification

- **Per article** (the skill's self-check): zero em-dashes; „…“ counts balanced with no ASCII `"`;
  ≤ 1 water metaphor; generic masculine only; *Merak* lands as a warm feeling near the end;
  first-person „Ich“; body closes on the point; slug == filename stem == the `<slug>` in `cover`.
- **Byte check after every write** — the Write/Edit tools silently downgrade the closing „…“ to
  ASCII. Repair with codepoint escapes only:
  `perl -CSD -0777 -i -pe 's/\x{201E}([^\x{201E}\x{201C}]*?)\x{201D}/\x{201E}${1}\x{201C}/gs' FILE`
  then confirm empty:
  `perl -CSD -0777 -ne 'print while /\x{201E}[^\x{201E}\x{201C}]*\x{201D}/gs' FILE`.
  ⚠ Never write a literal `”` in the perl program — it cannot match and the check silently passes.
- **Repo gate:** `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
- **`npm test` will fail until every cover WebP exists** (`ratgeber.covers.test.ts` checks the file
  for every article, **drafts included**). That failing test is the signal, not a defect.

---

## 7. Covers — the actual bottleneck

Nine covers at `public/images/ratgeber-<slug>.webp`, WebP quality 80. Because of the backdating
decision, all nine are needed before the batch can be committed.

Per `image_prompt.md` §9 workflow notes: generate 2–3 variants each and keep the calmest,
most negative-space-heavy one; feed an existing cover (e.g. `ratgeber-termine.webp`) as a colour
reference so the batch shares one grade. Keep every cover dark and low-contrast — a light German
headline sits on top.

**Founder action, not code.** The `.mdx` files can be written and reviewed first; the branch simply
cannot pass its gate or merge until the images are in place.

---

## 8. Publishing

Every article is written `draft: true`. Publishing is nine deliberate flips to `draft: false` — a
human step, by design, and the last chance to catch a backdated article that reads wrong. No code
change is needed to publish.

---

## 9. Out of scope

- Any change to the `ratgeber-article` skill itself.
- The other three Content-Engine ToDos (proof architecture · published price ranges as a site
  convention · local pages) — separate work items in HQ `CLAUDE.md` §7.
- Cover *generation* (founder action) and the domain cutover that makes any of this rank.
- The forward weekly cadence from August onward — a follow-on, not part of this batch.
