# /referenzen Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One page `/referenzen` that names MDZ Hausmeisterservice and Velp, shows what was built and what changed, gathers the owners' quotes at the end and links to the Prozess-Check; the compact cards on the homepage and the /leistungen hub get the names too.

**Architecture:** `src/lib/referenzen.ts` stays the single data source: its `Referenz` type swaps the old anonymous beats (problem/gebaut/laeuft/ergebnis) for the named fields, and a new `stimmen` export holds the quotes. `ReferenzCard` keeps only its compact variant (homepage + hub). The new page is a server page built from `PageHero`, a new `ReferenzDetail` card per client and a new `Stimmen` quote band that ends on the house CTA.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Vitest + React Testing Library.

**Spec:** [docs/superpowers/specs/2026-11-05-referenzen-page-design.md](../specs/2026-11-05-referenzen-page-design.md) (approved 2026-11-05). Read it first; every German string for MDZ and the quotes is copied **verbatim** from its §6.

## Global Constraints

- Work on branch `feat/referenzen-page` in the `Website/` repo. **Never push, never merge to `main`** (push to `main` deploys prod). Merge waits for Mirsad's OK on the German of his quotes (spec §3, §10).
- Never stage `.claude/skills/ratgeber-article/*` (pre-existing unrelated changes). Stage files by name.
- German quotes are U+201E „ and U+201C “, never ASCII `"`. No Gedankenstrich (U+2013, U+2014) in German copy. No comma before „und“ (`src/lib/kommaUnd.test.ts` sweeps all of `src/`). The Write/Edit tools silently downgrade „“ to ASCII: after writing any file with German quotes, check the bytes (`python -I -c "s=open(P,encoding='utf-8').read(); print(s.count(chr(0x201E)), s.count(chr(0x201C)))"`, counts must match the intended number) and repair with a script using `chr(0x201E)` / `chr(0x201C)`.
- No prices, no „kostenlos“, no build durations on the page (spec §2).
- Founder name ASCII `Ajdin Dzafic`; MDZ owner `Mirsad Dzafic`; Velp owner `Alen Purisic`. Never diacritics.
- MDZ public facts only: seit 2008 · über 55 Objekte · eigenes Team. Never client names, staff names, revenue, invoice counts, IBAN, Steuernummer.
- Velp: no number goes public until Alen approves one (spec §6.3); its `kennzahl` stays the non-number „Projektdokumentation“.
- Generic masculine. Brand voice: calm, du, „Ich“.
- Metadata: `alternates.canonical: canonical("/referenzen")`, `title: "Referenzen"`, description ≤ 170 chars, **no page-level `openGraph`**.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A compact card's link must land on its card.** Every compact headline links to `/referenzen#referenz-<slug>`; the page must render an element with exactly that id for every slug (Task 2 page test).
2. **MDZ must never appear named without the family tie.** The compact card shows „Betrieb meines Vaters“, the detail card shows the full father line (Task 1 card test, Task 2 page test).
3. **Quote bytes downgraded by the tools.** Every string in `referenzen` and `stimmen` pairs „ with “ and holds no ASCII `"` (Task 1 data test, extended to `stimmen`).
4. **The newsletter becomes unreachable after the nav swap.** The footer must still link `/newsletter` (Task 3 footer test).
5. **Phone width.** At 375 px the page has no horizontal scroll and the clip falls back to its poster under reduced motion (Task 4 browser check; `LazyVideo` already handles reduced motion).

---

### Task 1: Named data + compact cards everywhere

**Files:**
- Modify: `src/lib/referenzen.ts`, `src/lib/referenzen.test.ts`
- Modify: `src/components/referenzen/ReferenzCard.tsx`, `src/components/referenzen/ReferenzCard.test.tsx`
- Modify: `src/components/home/Referenzen.tsx`, `src/components/home/Referenzen.test.tsx`
- Modify: `src/components/leistungen/Referenzen.tsx`, `src/components/leistungen/Referenzen.test.tsx`

**Interfaces:**
- Produces (in `src/lib/referenzen.ts`):
  ```ts
  export type Baustein = { titel: string; text: string };
  export type Referenz = {
    slug: string;                 // "mdz" | "velp", also the anchor suffix
    name: string;                 // "MDZ Hausmeisterservice" | "Velp"
    label: string;                // place line: MDZ "Regensburg"; Velp "Marketingagentur · Regensburg"
    inhaber: string;              // "Mirsad Dzafic" | "Alen Purisic"
    fakten?: string;              // MDZ only (spec §6.1 facts line)
    familie?: { kurz: string; lang: string }; // MDZ only
    titel: string;                // compact headline
    ueberblick: string;
    bausteine: Baustein[];
    clip?: { mp4: string; poster: string };   // MDZ only
    resultat: string;
    kompakt: string;              // compact one-liner
    kennzahl: string;
    kennzahlLabel: string;
  };
  export type Stimme = { text: string; name: string; firma: string };
  export const referenzen: Referenz[];   // order: MDZ, Velp
  export const stimmen: Stimme[];
  export function referenzAnchorId(slug: string): string; // `referenz-${slug}`
  ```
- Produces: `ReferenzCard({ referenz }: { referenz: Referenz })` — compact only; the `variant` and `surfaceClassName` props are removed (no caller uses `surfaceClassName`; the full variant's last caller, the hub, switches to compact here).

**Content (copy into the data file):**
- **MDZ** (`slug: "mdz"`): `name` „MDZ Hausmeisterservice“, `label` „Regensburg“, `inhaber` „Mirsad Dzafic“, `fakten` / `familie.lang` / `ueberblick` / the five `bausteine` (titles and texts in the order Telegram-Assistent · Rechnungsautomat · MDZ Core · Entsorgungsplan · Website) / `resultat` verbatim from spec §6.1; `familie.kurz` „Betrieb meines Vaters“; `clip` `{ mp4: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" }`; `titel` and `kompakt` keep today's `hausmeister` strings; `kennzahl` „2 Std./Tag“, `kennzahlLabel` „Büroarbeit weniger“.
- **Velp** (`slug: "velp"`): this is the draft spec §6.2 asks for; Ajdin reviews it on localhost (Task 4). `name` „Velp“, `label` „Marketingagentur · Regensburg“, `inhaber` „Alen Purisic“, no `fakten`, no `familie`, no `clip`; `titel`, `kompakt`, `kennzahl` („Projektdokumentation“), `kennzahlLabel` („läuft von selbst“) keep today's `agentur` strings.
  - `ueberblick`: Jeder neue Kunde durchläuft bei Velp dieselben Phasen. Früher wurde jede Karte von Hand weitergeklickt, jede Aufgabe neu angelegt, jede Frist von Hand gesetzt. Das kostete täglich Zeit und ging leicht unter.
  - `bausteine`:
    1. Phasen-Steuerung / Sind alle Aufgaben einer Phase erledigt, schaltet die Kundenkarte von selbst in die nächste Phase.
    2. Aufgaben mit Fristen / Für jede neue Phase legt das System die passenden Aufgaben an, mit Werktags-Fristen und dem richtigen Ansprechpartner.
    3. BAFA-Spur / Wird ein Kunde über die BAFA gefördert, legt das System die verknüpfte Förderkarte mit ihren Schritten an und weist jeden Schritt dem richtigen Mitarbeiter zu.
  - `resultat`: Niemand bewegt mehr eine Karte von Hand. Das Team hat mehr Zeit für die eigentliche Arbeit, statt zu dokumentieren.
- **`stimmen`**: the three quotes of spec §6.4 (not the two spares), each `text` including its „…“, `name` „Mirsad Dzafic“, `firma` „MDZ Hausmeisterservice“.

- [ ] **Step 1: Create the branch**

Run: `git switch -c feat/referenzen-page` (inside `Website/`), then `git add docs/superpowers/specs/2026-11-05-referenzen-page-design.md docs/superpowers/plans/2026-11-05-referenzen-page.md && git commit -m "docs: /referenzen design + plan"` (with the Co-Authored-By line).
Expected: `git branch --show-current` prints `feat/referenzen-page`.

- [ ] **Step 2: Rewrite the data test** (`src/lib/referenzen.test.ts`)

Keep the `strings()` walker, now over `[referenzen, stimmen]`, and keep the quotes / dash / quote-pairing / currency / `:innen` tests. Replace the rest with:

```ts
it("ships MDZ first, then Velp, with unique slugs", () => {
  expect(referenzen.map((r) => r.slug)).toEqual(["mdz", "velp"]);
});
it("gives every card its required fields and at least one Baustein", () => {
  for (const r of referenzen) {
    for (const f of ["name", "label", "inhaber", "titel", "ueberblick", "resultat", "kompakt", "kennzahl", "kennzahlLabel"] as const)
      expect(r[f].length, `${r.slug}.${f}`).toBeGreaterThan(0);
    expect(r.bausteine.length).toBeGreaterThan(0);
  }
});
it("lists the MDZ Bausteine in Ajdin's order", () => {
  expect(mdz.bausteine.map((b) => b.titel)).toEqual(["Telegram-Assistent", "Rechnungsautomat", "MDZ Core", "Entsorgungsplan", "Website"]);
});
it("carries the family tie on MDZ only", () => {
  expect(mdz.familie?.kurz).toBe("Betrieb meines Vaters");
  expect(mdz.familie?.lang).toMatch(/^Der Betrieb meines Vaters\./);
  expect(velp.familie).toBeUndefined();
});
it("publishes no Velp number until Alen approves one", () => {
  expect(/\d/.test(velp.kennzahl + velp.kennzahlLabel)).toBe(false);
});
it("pins the MDZ number Mirsad confirmed", () => {
  expect([mdz.kennzahl, mdz.kennzahlLabel]).toEqual(["2 Std./Tag", "Büroarbeit weniger"]);
});
it("never says kostenlos, never leaks private data, spells names in ASCII", () => {
  expect(all.filter((s) => /kostenlos|pro bono/i.test(s))).toEqual([]);
  expect(all.filter((s) => /IBAN|Steuernummer|Umsatz/i.test(s))).toEqual([]);
  expect(all.filter((s) => /[ČčĆćŽžŠšĐđ]/.test(s))).toEqual([]);
});
it("ships Mirsad's three quotes, each wrapped in German quotes", () => {
  expect(stimmen).toHaveLength(3);
  for (const s of stimmen) {
    expect(s.text.startsWith("„") && s.text.endsWith("“")).toBe(true);
    expect([s.name, s.firma]).toEqual(["Mirsad Dzafic", "MDZ Hausmeisterservice"]);
  }
});
it("builds the anchor id from the slug", () => {
  expect(referenzAnchorId("mdz")).toBe("referenz-mdz");
});
```
(`const mdz = referenzen[0], velp = referenzen[1];`. The quote characters in `startsWith`/`endsWith` must be U+201E/U+201C: check the bytes after writing.)

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/lib/referenzen.test.ts`
Expected: FAIL (`stimmen` / `referenzAnchorId` not exported, slugs differ).

- [ ] **Step 4: Rewrite `src/lib/referenzen.ts`** with the interfaces and content above. Then check the bytes (Global Constraints) and fix any downgraded quote.

- [ ] **Step 5: Update the card + section tests**

`ReferenzCard.test.tsx` (replace all three tests):
- `"shows name, place and the family tie in the eyebrow for MDZ"`: render MDZ; `getByText("MDZ Hausmeisterservice · Regensburg · Betrieb meines Vaters")`; heading `mdz.titel`; `getByText(mdz.kompakt)`, `getByText(mdz.kennzahl)`, `getByText(mdz.kennzahlLabel)`.
- `"shows no family tie for Velp"`: render Velp; `getByText("Velp · Marketingagentur · Regensburg")`; `queryByText(/Betrieb meines Vaters/)` is null.
- `"links the headline to the client's card on /referenzen"`: link name `mdz.titel` has `href` `/referenzen#referenz-mdz`.
- `"leaves the long story to /referenzen"`: `queryByText(mdz.ueberblick)` and `queryByText(mdz.resultat)` are null.

`home/Referenzen.test.tsx`: the detail link `/Beide Projekte im Detail ansehen/i` has `href` `/referenzen`; keep the other two tests.

`leistungen/Referenzen.test.tsx` (replace): renders an h2 and, per card, the `titel` heading + `kompakt` text; `queryByText(r.ueberblick)` null; link `/Beide Projekte im Detail ansehen/i` → `/referenzen`; keeps the `#referenzen` anchor (`container.querySelector("#referenzen")`). Drop the „coming soon“ test (that string is long gone).

- [ ] **Step 6: Run them to see them fail**

Run: `npx vitest run src/components/referenzen src/components/home/Referenzen.test.tsx src/components/leistungen/Referenzen.test.tsx`
Expected: FAIL (eyebrow text, hrefs).

- [ ] **Step 7: Implement**

- `ReferenzCard.tsx`: compact only. Eyebrow = `[r.name, r.label, r.familie?.kurz].filter(Boolean).join(" · ")` in the existing eyebrow `<p>`; headline link `href={`/referenzen#${referenzAnchorId(r.slug)}`}`; body = `kompakt`; the number foot unchanged. Update the comments that mention /leistungen and the full variant.
- `home/Referenzen.tsx`: `<ReferenzCard referenz={r} />`, link `href="/referenzen"`. Heading stays.
- `leistungen/Referenzen.tsx`: compact cards in the same grid, no per-card ids (the anchors move to the page), plus the same detail link to `/referenzen` as the homepage (copy its `Link` and its #6f4a20 colour, contrast already measured on this backdrop). Keep `id="referenzen"`, heading and backdrop.

- [ ] **Step 8: Run tests + type-check**

Run: `npx vitest run src/lib/referenzen.test.ts src/components/referenzen src/components/home src/components/leistungen src/lib/kommaUnd.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 9: Commit**

```bash
git add src/lib/referenzen.ts src/lib/referenzen.test.ts src/components/referenzen/ReferenzCard.tsx src/components/referenzen/ReferenzCard.test.tsx src/components/home/Referenzen.tsx src/components/home/Referenzen.test.tsx src/components/leistungen/Referenzen.tsx src/components/leistungen/Referenzen.test.tsx
git commit -m "feat(referenzen): named data, compact cards link to /referenzen"
```

---

### Task 2: The /referenzen page

**Files:**
- Create: `src/components/referenzen/ReferenzDetail.tsx`, `src/components/referenzen/Stimmen.tsx`
- Create: `src/app/referenzen/page.tsx`, `src/app/referenzen/page.test.tsx`
- Modify: `src/lib/prozessCheckCta.ts` (add `referenzen: "referenzen"` to `CHECK_SRC`)
- Modify: `src/app/sitemap.ts`, `src/app/sitemap.test.ts`, `src/app/canonical.metadata.test.ts`

**Interfaces:**
- Consumes: `Referenz`, `referenzen`, `stimmen`, `referenzAnchorId` (Task 1).
- Produces: `ReferenzDetail({ referenz }: { referenz: Referenz })` → an `<article id={referenzAnchorId(slug)}>` with the name as **h2**; `Stimmen()` → the quote band section with h2 „Das sagen meine Kunden.“ and the CTA; `CHECK_SRC.referenzen`.

- [ ] **Step 1: Write the page test** (`src/app/referenzen/page.test.tsx`, pattern: `src/app/leistungen/page.test.tsx`)

- `"opens on the agreed hero"`: h1 name „So läuft es heute bei meinen Kunden.“.
- `"renders one named card per client with its anchor"`: for each `r` in `referenzen`: `getByRole("heading", { level: 2, name: r.name })`; `container.querySelector("#" + referenzAnchorId(r.slug))` not null; every `b.titel` of `r.bausteine` present; `r.resultat` present.
- `"shows the father line on the MDZ card"`: `getByText(mdz.familie!.lang)`; `getByText(mdz.fakten!)`.
- `"gathers the quotes at the end under their own heading"`: h2 „Das sagen meine Kunden.“; every `s.text` present; each attribution text `Mirsad Dzafic, MDZ Hausmeisterservice` present (`getAllByText`, length 3).
- `"ends on the Prozess-Check with the direct path under it"`: link `CHECK_CTA.label` → `/prozess-check?src=referenzen`; `getByText(CHECK_CTA.microcopy)`; link `CHECK_CTA.directLabel` → `/kontakt`.
- `"keeps its description in the search-snippet budget"`: `String(metadata.description).length` ≤ 170 and `metadata.openGraph` undefined.

Also add `["referenzen", referenzenMeta, "/referenzen"]` to `canonical.metadata.test.ts` and `expect(urls).toContain(`${siteUrl}/referenzen`)` to the core-routes test in `sitemap.test.ts`.

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/app/referenzen src/app/sitemap.test.ts src/app/canonical.metadata.test.ts`
Expected: FAIL (module `./referenzen/page` not found).

- [ ] **Step 3: Implement**

- `CHECK_SRC.referenzen = "referenzen"` (the existing `prozessCheckCta.test.ts` checks it survives `normalizeSource` and is unique).
- `ReferenzDetail`: h2 `name`; meta line `{label} · Inhaber {inhaber}`; `fakten` if set; `familie.lang` if set, visually set apart (a quiet italic line in the body font, never Fraunces, which is reserved for *Vrelo*/*Merak*); `ueberblick`; h3 „Was ich gebaut habe“; `<ul>` of Bausteine as `<strong>{titel}:</strong> {text}`; `clip` via `LazyVideo` (`mp4`, `poster`, rounded, `aspect-video`/`object-cover`), its meaning carried by the bullet above; then the result block: `resultat` plus `kennzahl` / `kennzahlLabel` in the compact card's number style.
- `Stimmen`: `Section` on the petrol/dark tone (as in the brainstorm mockup B) with h2 „Das sagen meine Kunden.“; each quote a `<figure>` with `<blockquote>` (the `text`) and `<figcaption>` `{name}, {firma}`; then `CTAButton` → `checkHref(CHECK_SRC.referenzen)` labelled `CHECK_CTA.label`, a `<p>` with `CHECK_CTA.microcopy`, and `SecondaryLink tone="dark"` with `CHECK_CTA.directPrefix` / `directLabel` / `directHref`. Check `CTAButton`'s variants for the one meant for dark sections.
- `page.tsx`: `metadata` = `{ alternates: { canonical: canonical("/referenzen") }, title: "Referenzen", description: "Zwei Betriebe aus Regensburg: was ich für MDZ Hausmeisterservice und Velp gebaut habe und was sich seitdem im Alltag verändert hat." }`. Body: `PageHero` (`title` = the h1 above, `lead` = spec §6.0, `src` = an existing banner from `public/images/`, chosen by eye on localhost; no new image), then a warm `Section` with the two `ReferenzDetail` cards stacked (MDZ full width first), then `<Stimmen />`, then `JsonLd` `breadcrumbLd([{ name: "Start", path: "/" }, { name: "Referenzen", path: "/referenzen" }])`. No `ClosingCta`: the band carries the close (spec §5).
- `sitemap.ts`: add `"/referenzen"` after `"/leistungen"`'s subpages.

- [ ] **Step 4: Check bytes, then run tests**

Run the byte check on `page.tsx`, `Stimmen.tsx`, `ReferenzDetail.tsx` (Global Constraints), then `npx vitest run src/app src/components/referenzen src/lib && npx tsc --noEmit`.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/referenzen/ReferenzDetail.tsx src/components/referenzen/Stimmen.tsx src/app/referenzen/page.tsx src/app/referenzen/page.test.tsx src/lib/prozessCheckCta.ts src/app/sitemap.ts src/app/sitemap.test.ts src/app/canonical.metadata.test.ts
git commit -m "feat(referenzen): /referenzen page with named cards and quote band"
```

---

### Task 3: Referenzen in the nav, newsletter out of it

**Files:**
- Modify: `src/lib/nav.ts`, `src/lib/nav.test.ts`, `src/components/Footer.test.tsx`

- [ ] **Step 1: Write the tests**

`nav.test.ts`: `it("puts Referenzen right after Leistungen and drops Newsletter from the nav", ...)` → `expect(navLinks.map((l) => l.href)).toEqual(["/leistungen", "/referenzen", "/ueber-mich", "/faq", "/ratgeber", "/kontakt"])`.
`Footer.test.tsx`: `it("still links the newsletter after it left the top nav", ...)` → some link in the rendered footer has `href` `/newsletter`.

- [ ] **Step 2: Run to see the nav test fail** — `npx vitest run src/lib/nav.test.ts src/components/Footer.test.tsx`. Expected: nav test FAIL, footer test PASS (footer has its own `/newsletter` links; the test guards them).

- [ ] **Step 3: Implement** — in `navLinks`, remove `{ href: "/newsletter", label: "Newsletter" }` and insert `{ href: "/referenzen", label: "Referenzen" }` after Leistungen.

- [ ] **Step 4: Run the full suite** — `npm test`. Expected: all PASS (Header/MobileNav render from `navLinks`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav.ts src/lib/nav.test.ts src/components/Footer.test.tsx
git commit -m "feat(nav): Referenzen replaces Newsletter in the top nav"
```

---

### Task 4: Verify on localhost and hand to Ajdin

- [ ] **Step 1: Gates** — `npm run lint && npx tsc --noEmit && npm test && npm run build`. Expected: all clean.
- [ ] **Step 2: Browser check** — `npm start`, then with Playwright at 375×812 and 1280×800 open `/referenzen`, `/` and `/leistungen`: screenshot each; on `/referenzen` assert `document.documentElement.scrollWidth <= window.innerWidth`; click the MDZ compact headline on `/` and confirm it scrolls to `#referenz-mdz`; with `emulateMedia({ reducedMotion: "reduce" })` the MDZ clip shows its poster image.
- [ ] **Step 3: Hand over** — show Ajdin `/referenzen` on localhost; he reviews the Velp copy and the hero image. **Stop here: no push, no merge.** Merge needs (spec §10): Mirsad's OK on the exact German of his three quotes; Alen's quote (optional, would join `stimmen`), any Velp number, the branch label. After the merge: spec §9 (HQ §7, Vault sync).
